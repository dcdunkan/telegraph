import { DOMParser, Element, marky, Parser } from "../deps.ts";
import { NodeElement, Tag } from "./types.ts";

const TELEGRAM_REGEX =
  /^(https?):\/\/(t\.me|telegram\.me|telegram\.dog)\/([a-zA-Z0-9_]+)\/(\d+)/;
const VIMEO_REGEX =
  /(https?:\/\/)?(www.)?(player.)?vimeo.com\/([a-z]*\/)*([0-9]{6,11})[?]?.*/;
const TWITTER_REGEX =
  /(https?:\/\/)?(www.)?twitter.com\/([a-z,A-Z]*\/)*status\/([0-9])[?]?.*/;
const YOUTUBE_REGEX =
  /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]+).*/;

export const parseMarkdown = (content: string, markyParsers?: Parser[]) => {
  const md = marky(content, markyParsers).replace(
    /\<del\>(.*)\<\/del\>/gim,
    "<s>$1</s>",
  );
  return parseHtml(md);
};

export const parseHtml = (content: string) => {
  const body = new DOMParser().parseFromString(content, "text/html")!.body;
  const node = domToNode(body);
  if (node) return typeof node === "string" ? node : node.children;
};

const domToNode = (el: Element) => {
  if (el.nodeType === el.TEXT_NODE) return el.nodeValue;

  const tag = el.tagName.toLowerCase();
  const nodeElement: NodeElement = { tag: tag as Tag };

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
      if (el.parentElement?.tagName === "PRE") {
        nodeElement.tag = "pre";
      }
      break;
  }

  const hrefAttr = el.attributes.getNamedItem("src");
  if (hrefAttr) {
    nodeElement.attrs = { href: hrefAttr.value };
  }

  const srcAttr = el.attributes.getNamedItem("src");
  if (srcAttr) {
    let src = srcAttr.value;
    if (nodeElement.tag === "iframe") {
      if (TWITTER_REGEX.test(src)) {
        const match = TWITTER_REGEX.exec(src);
        if (match) {
          src = `/embed/twitter?url=${src}`;
        }
      } else if (YOUTUBE_REGEX.test(src)) {
        const match = YOUTUBE_REGEX.exec(src);
        if (match) {
          src = `/embed/youtube?url=${
            encodeURIComponent(
              `https://www.youtube.com/watch?v=${match[1]}`,
            )
          }`;
        }
      } else if (VIMEO_REGEX.test(src)) {
        const match = VIMEO_REGEX.exec(src);
        if (match) {
          src = `/embed/vimeo?url=${
            encodeURIComponent(
              `https://vimeo.com/${match.pop()}`,
            )
          }`;
        }
      } else if (TELEGRAM_REGEX.test(src)) {
        const match = TELEGRAM_REGEX.exec(src);
        if (match) {
          src = `/embed/telegram?url=${src}`;
        }
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
