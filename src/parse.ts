import { DOMParser, Element, marky, Parser } from "../deps.ts";
import { NodeElement, Tag } from "./types.ts";

/**
 * `RegExp`s for detecting Telegram, Vimeo, Twitter and YouTube URLs and finds the main things that we need to make a Telegra.ph compatible source value for `<iframe>`s.
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

/**
 * Parses Markdown string to node content which can be used while creating or editing pages.
 *
 * Example usage:
 * ```ts
 * const content = parseMarkdown("**bold**");
 * // [ { tag: "p", children: [ { tag: "strong", children: ["bold"] } ] } ]
 * tph.create({
 *    content,
 *    title: "Telegraph.md",
 * });
 * ```
 * @param content Markdown content to parse.
 * @returns Node content.
 */
export const parseMarkdown = (content: string, markyParsers?: Parser[]) => {
  const md = marky(content, markyParsers).replace(
    /\<del\>(.*)\<\/del\>/gim,
    "<s>$1</s>",
  );
  return parseHtml(md);
};

/**
 * Parses HTML to node content which can be used while creating or editing pages.
 * - `<h1>`, `<h2>` will be changed to `<h3>` and `<h4>` since Telegra.ph only supports `h3` and `h4`s as heading tags.
 * `<h5` and `<h6>` will also be changed to `<h3>` and `<h4>`.
 * - When using `<iframe>`s, you need to wrap them inside a `<figure>`.
 *
 * ***
 *
 * Example usage:
 * ```ts
 * const content = parseHtml("<b>Bold</b><br><i>Italic</i>");
 * // [
 * //   { tag: "b", children: [ "Bold" ] },
 * //   { tag: "br" },
 * //   { tag: "i", children: [ "Italic" ] }
 * // ]
 * tph.create({
 *    content,
 *    title: "Telegra.ph Deno API wrapper is cool!",
 * });
 * ```
 * @param content HTML content to parse.
 * @returns Node content.
 */
export const parseHtml = (content: string) => {
  const body = new DOMParser().parseFromString(content, "text/html")!.body;
  const node = domToNode(body);
  if (node) return typeof node === "string" ? node : node.children;
};

/**
 * Modified, *internally* used `domToNode` function for parsing HTML DOM Element to node elements that can be used in your pages as `content`.
 * Helps to write HTML (and Markdown, which gets parsed to HTML using [marky](https://deno.land/x/marky@v1.1.6/mod.ts)) code and convert it to ready `content` for Telegra.ph.
 *
 * Original version of this helper function can be found here, https://telegra.ph/api#Content-format
 *
 * ***
 * There might be more tags that should/can be detected and be changed into something that Telegra.ph supports.
 * But I haven't found them yet, since I don't work too much with HTML. But, if you find anything that can enchance this, please open a PR.
 * @param el HTML Element to be parsed into an NodeElement.
 * @returns Parsed node element, ready to be used in your pages.
 */
const domToNode = (el: Element) => {
  if (el.nodeType === el.TEXT_NODE) return el.nodeValue;

  const tag = el.tagName.toLowerCase();
  const nodeElement: NodeElement = {
    tag: tag as Tag,
  };

  switch (tag) {
    case "h1":
      nodeElement.tag = "h3";
      break;

    case "h2":
      nodeElement.tag = "h4";
      break;

    case "h5":
      nodeElement.tag = "h3";
      break;

    case "h6":
      nodeElement.tag = "h4";
      break;

    case "del":
      nodeElement.tag = "s";
      break;

    case "code":
      // Having a code block like `<pre><code>content here</code></pre>`, is not rendering as an actual "pre" code block.
      // But, instead having just `<pre>content here</pre>` or a `<pre><pre>content here</pre></pre>` works fine.
      if (el.parentElement?.tagName === "PRE") nodeElement.tag = "pre";
      break;
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

  if (el.childNodes.length > 0) {
    nodeElement.children = [];
    for (let i = 0; i < el.childNodes.length; i++) {
      const child = el.childNodes[i];
      const node = domToNode(child as Element);
      if (node) nodeElement.children.push(node);
    }
  }
  return nodeElement;
};
