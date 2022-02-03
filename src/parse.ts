import { DOMParser, Element, marky, Parser } from "../deps.ts";
import { Node, NodeElement, Tag } from "./types.ts";
import { MdParsers, tgMdParsers } from "./parsers.ts";

/**
 * `RegExp`s for detecting Telegram, Vimeo, Twitter and YouTube URLs and finds
 * the main things that we need to make a Telegra.ph compatible source value for
 * `<iframe>`s.
 *
 * Found from several sources on web, credits to them.
 */
const REGEX = {
  TELEGRAM:
    /^(https?):\/\/(t\.me|telegram\.me|telegram\.dog)\/([a-zA-Z0-9_]+)\/(\d+)/,
  VIMEO:
    /(https?:\/\/)?(www.)?(player.)?vimeo.com\/([a-z]*\/)*([0-9]{6,11})[?]?.*/,
  TWITTER:
    /(https?:\/\/)?(www.)?twitter.com\/([a-z,A-Z]*\/)*status\/([0-9])[?]?.*/,
  YOUTUBE:
    /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]+).*/,
} as const;

type ParseMode = "TGMarkdown" | "Markdown" | "HTML";

/**
 * Parses the given HTML or markdown content and returns a Telegra.ph compatible
 * `content` value. You have to provide a `parseMode` in order to parse the
 * content properly. The value of `parseMode` can be either `"TGMarkdown"`,
 * `"Markdown"` or `"HTML"`.
 */
export function parse(
  content: string,
  parseMode: ParseMode,
  markyParsers: Parser[] = [],
): string | Node[] {
  switch (parseMode) {
    case "TGMarkdown": {
      const md = marky(content, tgMdParsers.concat(markyParsers));
      return parseHtml(md);
    }
    case "Markdown": {
      const md = marky(content, MdParsers.concat(markyParsers));
      return parseHtml(md);
    }
    case "HTML": {
      return parseHtml(`<p>${content}</p>`);
    }
  }
}

function parseHtml(content: string) {
  const body = new DOMParser().parseFromString(content, "text/html")!.body;
  const node = domToNode(body);
  if (typeof node === "string") return node;
  else if (node.children) return node.children;
  else return "";
}

/**
 * Modified, *internally* used `domToNode` function for parsing HTML DOM Element
 * to node elements that can be used in your pages as `content`. Helps to write
 * HTML (and Markdown, which gets parsed to HTML using
 * [marky](https://deno.land/x/marky@v1.1.6/mod.ts)) code and convert it to
 * ready `content` for Telegra.ph.
 *
 * Original version of this helper function can be found here,
 * https://telegra.ph/api#Content-format
 *
 * ***
 * There might be even more tags that should/can be detected and be changed into
 * something that Telegra.ph supports. But I haven't found them yet, since I
 * don't work too much with HTML. But, if you find anything that can enchance
 * this, please open a PR.
 * @param el HTML Element to be parsed into an NodeElement.
 * @returns Parsed node element, ready to be used in your pages.
 */
function domToNode(el: Element): NodeElement | string {
  if (el.nodeType === el.TEXT_NODE) {
    return el.nodeValue ? el.nodeValue : "";
  }

  const tag = el.tagName.toLowerCase();
  const nodeElement: NodeElement = {
    tag: tag as Tag,
  };

  const replaceTags: Record<string, Tag> = {
    h1: "h3",
    h2: "h4",
    h5: "h3",
    h6: "h4",
    del: "s",
  };

  if (tag in replaceTags) nodeElement.tag = replaceTags[tag];
  if (tag === "code" && el.parentElement?.tagName === "PRE") {
    nodeElement.tag = "pre";
  }

  if ("href" in el.attributes) nodeElement.attrs = { href: el.attributes.href };
  if ("src" in el.attributes) {
    let src = el.attributes.src;
    if (nodeElement.tag === "iframe") {
      // Twitter embed post urls
      if (REGEX.TWITTER.test(src)) {
        const match = REGEX.TWITTER.exec(src);
        if (match) src = `/embed/twitter?url=${src}`;
      } else if (REGEX.YOUTUBE.test(src)) {
        // YouTube urls
        const match = REGEX.YOUTUBE.exec(src);
        if (match) {
          src = `/embed/youtube?url=${
            encodeURIComponent(
              `https://www.youtube.com/watch?v=${match[1]}`,
            )
          }`;
        }
      } else if (REGEX.VIMEO.test(src)) {
        // Vimeo urls
        const match = REGEX.VIMEO.exec(src);
        if (match) {
          src = `/embed/vimeo?url=${
            encodeURIComponent(
              `https://vimeo.com/${match.pop()}`,
            )
          }`;
        }
      } else if (REGEX.TELEGRAM.test(src)) {
        // Telegram urls
        const match = REGEX.TELEGRAM.exec(src);
        if (match) src = `/embed/telegram?url=${src}`;
      }
    }
    nodeElement.attrs = { ...nodeElement.attrs, src };
  }

  // Recursive domTonode for children.
  if (el.childNodes.length > 0) {
    nodeElement.children = [];
    for (let i = 0; i < el.childNodes.length; i++) {
      const child = el.childNodes[i];
      const node = domToNode(child as Element);
      if (node) nodeElement.children.push(node);
    }
  }

  return nodeElement;
}
