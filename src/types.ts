// Available Types https://telegra.ph/api#Available-types
export interface Account {
  short_name: string;
  author_name: string;
  author_url: string;
  access_token: string;
  auth_url?: string;
  page_count?: number;
}

export interface RevokeAccessTokenResponse {
  access_token: string;
  auth_url: string;
}

export interface PageViews {
  views: number;
}

export type Tag =
  | "a"
  | "aside"
  | "b"
  | "blockquote"
  | "br"
  | "code"
  | "em"
  | "figcaption"
  | "figure"
  | "h3"
  | "h4"
  | "hr"
  | "i"
  | "iframe"
  | "img"
  | "li"
  | "ol"
  | "p"
  | "pre"
  | "s"
  | "strong"
  | "u"
  | "ul"
  | "video";

export interface NodeElement {
  tag: Tag;
  attrs?: {
    href?: string;
    src?: string;
  };
  children?: Array<string | Node>;
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

// Request Options
export interface CreateAccountOptions {
  short_name: string;
  author_name?: string;
  author_url?: string;
}

export interface EditAccountOptions {
  short_name?: string;
  author_name?: string;
  author_url?: string;
}

export type GetAccountInfoFields = (
  | "short_name"
  | "author_name"
  | "author_url"
  | "auth_url"
  | "page_count"
)[];

export interface GetAccountInfoOptions {
  fields: GetAccountInfoFields;
}

export interface CreatePageOptions {
  title: string;
  content: string | Node[];
  author_name?: string;
  author_url?: string;
  return_content?: boolean;
}

export interface EditPageOptions {
  title?: string;
  content: string | Node[];
  author_name?: string;
  author_url?: string;
  return_content?: boolean;
}

export interface EditPageRequestOptions {
  path: string;
  title?: string;
  content: string | Node[];
  author_name?: string;
  author_url?: string;
  return_content?: boolean;
}

export interface GetPageOptions {
  path: string;
  return_content?: boolean;
}

export interface GetPageListOptions {
  offset?: number;
  limit?: number;
}

export interface GetViewsOptions {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
}

export interface GetViewsRequestOptions {
  path: string;
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
}
