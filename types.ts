// deno-fmt-ignore
export const SUPPORTED_TAGS = [
  "a", "aside", "b", "blockquote", "br", "code", "em", "figcaption",
  "figure", "h3", "h4", "hr", "i", "iframe", "img", "li", "ol", "p",
  "pre", "s", "strong", "u", "ul", "video",
] as const;

export interface Account {
  short_name: string;
  author_name: string;
  author_url: string;
  access_token: string;
  auth_url?: string;
  page_count?: number;
}

export interface RevokedAccessToken {
  access_token: string;
  auth_url: string;
}

export interface PageViews {
  views: number;
}

export type SupportedTag = typeof SUPPORTED_TAGS[number];

export interface NodeElement {
  tag: SupportedTag;
  attrs?: { href?: string; src?: string };
  children?: Node[];
}

export type Node = string | NodeElement;

export interface Page {
  path: string;
  url: string;
  title: string;
  description: string;
  author_name?: string;
  author_url?: string;
  image_url?: string;
  content?: string | Node[];
  views: number;
  can_edit?: boolean;
}

export interface PageList {
  total_count: number;
  pages: Page[];
}
