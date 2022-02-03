import { blockParsers as p, Parser } from "../deps.ts";

// Underline, because it is not supported by marky's default parser.
const underline = (block: string): string =>
  matchAndReplace(block, "__", 2, "u");

// Follows Telegram Markdown V2 specification.
// https://core.telegram.org/bots/api#markdownv2-style
const tgBold = (block: string): string => matchAndReplace(block, "\\*", 1, "b");
const tgItalic = (block: string): string => matchAndReplace(block, "_", 1, "i");
const tgStrikethrough = (block: string): string =>
  matchAndReplace(block, "~", 1, "s");

function matchAndReplace(
  block: string,
  matcher: string,
  length: number,
  replaceTag: string,
): string {
  // Support to escape the matcher.
  const regex = new RegExp(
    `${matcher}(.*?)((?<!\\\\)|(?<=\\\\\\\\)|(.+))${matcher}`,
    "g",
  );
  const matches = block.match(regex);
  if (!matches) return block;
  for (const match of matches) {
    const value = match.substring(length, match.length - length);
    const replacement = `<${replaceTag}>${value}</${replaceTag}>`;
    block = block.replace(match, replacement);
  }
  return block;
}

// Telegram Markdown V2 parsers.
export const tgMdParsers: Parser[] = [
  {
    matcher: p.isEmptyBlock,
    renderers: [p.emptyBlock],
  },
  {
    matcher: p.isHeadingBlock,
    renderers: [
      underline,
      tgItalic,
      tgBold,
      p.inlineCode,
      tgStrikethrough,
      p.linkAndImage,
      p.headingBlock,
    ],
  },
  {
    matcher: p.isCodeBlock,
    renderers: [p.codeBlock],
  },
  {
    matcher: p.isHorizontalLineBlock,
    renderers: [p.horizontalLineBlock],
  },
  {
    matcher: p.isQuoteBlock,
    renderers: [p.quoteBlock],
  },
  {
    matcher: p.isListBlock,
    renderers: [
      underline,
      tgItalic,
      tgBold,
      p.inlineCode,
      tgStrikethrough,
      p.linkAndImage,
      p.listBlock,
    ],
  },
  {
    renderers: [
      underline,
      tgItalic,
      tgBold,
      p.inlineCode,
      tgStrikethrough,
      p.linkAndImage,
      p.paragraphBlock,
    ],
  },
];

// Modified default marky parser.
export const MdParsers: Parser[] = [
  {
    matcher: p.isEmptyBlock,
    renderers: [p.emptyBlock],
  },
  {
    matcher: p.isHeadingBlock,
    renderers: [
      p.bold,
      p.strikethrough,
      underline,
      p.italic,
      p.inlineCode,
      p.linkAndImage,
      p.headingBlock,
    ],
  },
  {
    matcher: p.isCodeBlock,
    renderers: [p.codeBlock],
  },
  {
    matcher: p.isHorizontalLineBlock,
    renderers: [p.horizontalLineBlock],
  },
  {
    matcher: p.isQuoteBlock,
    renderers: [p.quoteBlock],
  },
  {
    matcher: p.isListBlock,
    renderers: [
      p.bold,
      underline,
      p.strikethrough,
      p.italic,
      p.inlineCode,
      p.linkAndImage,
      p.listBlock,
    ],
  },
  {
    renderers: [
      p.bold,
      underline,
      p.italic,
      p.inlineCode,
      p.strikethrough,
      p.linkAndImage,
      p.paragraphBlock,
    ],
  },
];
