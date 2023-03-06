// deno-fmt-ignore
/** Available tags supported in Telegraph */
export const SUPPORTED_TAGS = [
  "a", "aside", "b", "blockquote", "br", "code", "em", "figcaption",
  "figure", "h3", "h4", "hr", "i", "iframe", "img", "li", "ol", "p",
  "pre", "s", "strong", "u", "ul", "video",
] as const;

/** This object represents a Telegraph account. */
export interface Account {
  /**
   * Account name, helps users with several accounts remember which they are
   * currently using. Displayed to the user above the "Edit/Publish" button on
   * Telegra.ph, other users don't see this name.
   */
  short_name: string;
  /** Default author name used when creating new articles. */
  author_name: string;
  /**
   * Profile link, opened when users click on the author's name below the
   * title. Can be any link, not necessarily to a Telegram profile or channel.
   */
  author_url: string;
}

export interface PageCount {
  /** Number of pages belonging to the Telegraph account. */
  page_count: number;
}

/** The access token and auth URL returned after revoking the token. */
export interface AccessToken {
  /**
   * Only returned by the createAccount and revokeAccessToken method.
   * Access token of the Telegraph account.
   */
  access_token: string;
}

export interface AuthUrl {
  /**
   * URL to authorize a browser on telegra.ph and connect it to a
   * Telegraph account. This URL is valid for only one use and for 5 minutes
   * only.
   */
  auth_url: string;
}

/** This object represents the number of page views for a Telegraph article. */
export interface PageViews {
  /** Number of page views for the target page. */
  views: number;
}

/** Available tags in Telegraph. */
export type SupportedTag = typeof SUPPORTED_TAGS[number];

/** This object represents a DOM element node. */
export interface NodeElement {
  /**
   * Name of the DOM element. Available tags: a, aside, b, blockquote, br,
   * code, em, figcaption, figure, h3, h4, hr, i, iframe, img, li, ol, p, pre,
   * s, strong, u, ul, video.
   */
  tag: SupportedTag;
  /**
   * Attributes of the DOM element. Key of object represents name of
   * attribute, value represents value of attribute. Available attributes:
   * href, src.
   */
  attrs?: { href?: string; src?: string };
  /** List of child nodes for the DOM element. */
  children?: Node[];
}

/**
 * This abstract object represents a DOM Node. It can be a String which
 * represents a DOM text node or a NodeElement object.
 */
export type Node = string | NodeElement;

/** This object represents a page on Telegraph. */
export type Page<T extends boolean> =
  & {
    /** Path to the page. */
    path: string;
    /** URL of the page. */
    url: string;
    /** Title of the page. */
    title: string;
    /** Description of the page. */
    description: string;
    /** Name of the author, displayed below the title. */
    author_name?: string;
    /**
     * Profile link, opened when users click on the author's name below the
     * title. Can be any link, not necessarily to a Telegram profile or channel.
     */
    author_url?: string;
    /** Image URL of the page. */
    image_url?: string;
    /** Number of page views for the page. */
    views: number;
    /**
     * Only returned if access_token passed. True, if the target Telegraph
     * account can edit the page.
     */
    can_edit?: boolean;
  }
  & (T extends true ? {
      /** Content of the page. */
      content: string | Node[];
    }
    // deno-lint-ignore ban-types
    : {});

/**
 * This object represents a list of Telegraph articles belonging to an account.
 * Most recently created articles first.
 */
export interface PageList {
  /** Total number of pages belonging to the target Telegraph account. */
  total_count: number;
  /** Requested pages of the target Telegraph account. */
  pages: Page<false>[];
}
