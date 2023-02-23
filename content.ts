import {
  DOMParser,
  type Element,
  type IOptions,
  marked,
  sanitizeHtml,
} from "./deps.ts";
import {
  type NodeElement,
  SUPPORTED_TAGS,
  type SupportedTag,
} from "./types.ts";

const HTML_SANITIZER_OPTIONS: IOptions = {
  transformTags: {
    "h1": "h3",
    "h2": "h4",
    "h5": "h3",
    "h6": "h4",
    "del": "s",
  },
  allowedTags: [...SUPPORTED_TAGS],
  allowedAttributes: {
    "a": ["href"],
    "img": ["src"],
    "iframe": ["src"],
  },
};
const IFRAME_SRC_REGEX: Record<string, RegExp> = {
  twitter:
    /(https?:\/\/)?(www.)?twitter.com\/([a-z,A-Z]*\/)*status\/([0-9])[?]?.*/,
  telegram:
    /^(https?):\/\/(t\.me|telegram\.me|telegram\.dog)\/([a-zA-Z0-9_]+)\/(\d+)/,
  vimeo:
    /(https?:\/\/)?(www.)?(player.)?vimeo.com\/([a-z]*\/)*([0-9]{6,11})[?]?.*/,
  youtube:
    /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]+).*/,
};
const PARSE_MODES = ["html", "markdown"];

export type ParseMode = "HTML" | "Markdown";

const DOM_PARSER = new DOMParser();
function parseHtmlToDOM(html: string) {
  return DOM_PARSER.parseFromString(html, "text/html");
}

function transformToIframeURL(url: string) {
  for (const site in IFRAME_SRC_REGEX) {
    if (!IFRAME_SRC_REGEX[site].test(url)) continue;
    return `/embed/${site}?url=${encodeURIComponent(url)}`;
  }
}

export function parse(content: string, parseMode: ParseMode) {
  const mode = parseMode.toLowerCase();
  if (!PARSE_MODES.includes(mode)) {
    throw new Error("Invalid parse mode: " + parseMode);
  }
  const html = mode === "html" ? content : marked.parse(content);
  const sanitized = sanitizeHtml(html, HTML_SANITIZER_OPTIONS);
  const dom = parseHtmlToDOM(sanitized);
  if (dom === null) throw new Error("Failed to parse HTML to DOM");
  const node = domToNode(dom.body);
  if (node === null) throw new Error("Empty node content");
  return typeof node === "string" ? node : node.children;
}

// Transforms DOM to Telegraph compatible content format.
function domToNode(element: Element) {
  if (element.nodeType == element.TEXT_NODE) {
    return element.nodeValue;
  }

  const tag = element.tagName.toLowerCase() as SupportedTag;
  const nodeElement: NodeElement = { tag };
  if (tag === "code" && element.parentElement?.tagName === "PRE") {
    nodeElement.tag = "pre"; // otherwise it won't render properly.
  }
  const href = element.attributes.getNamedItem("href");
  const src = element.attributes.getNamedItem("src");
  if (href) {
    nodeElement.attrs = { href: href.value };
  } else if (src) {
    nodeElement.attrs = {
      src: tag === "iframe" ? transformToIframeURL(src.value) : src.value,
    };
  }

  if (element.childNodes.length) {
    nodeElement.children = [];
    for (const childElement of element.childNodes) {
      const childNode = domToNode(childElement as Element);
      if (childNode) nodeElement.children.push(childNode);
    }
  }

  return nodeElement;
}
