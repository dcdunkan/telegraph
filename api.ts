import type {
  AccessToken,
  Account,
  AuthUrl,
  Node,
  Page,
  PageList,
  PageViews,PageCount
} from "./types.ts";

const API_ROOT = "https://api.telegra.ph";

interface Options {
  /** Root URL of the API server. Defaults to https://telegra.ph/api. */
  apiRoot?: string;
}

/** All account fields that is returned by `getAccount` method. */
export const ACCOUNT_FIELDS = [
  "short_name",
  "author_name",
  "author_url",
  "auth_url",
  "page_count",
] as const;
/** Account fields that can be requested through `getAccountInfo` method. */
export type AccountFields = typeof ACCOUNT_FIELDS[number];

/**
 * Error handler that can be installed on a Telegraph instance to catch error
 * thrown by the API calls.
 */
export type ErrorHandler = (error?: unknown) => unknown;

/**
 * Most important class of the module. Helps to manage accounts and created
 * Telegraph pages.
 */
export class Telegraph {
  /**
   * Holds the error handler of the instance that is invoked whenever API calls
   * (rejects). If you set your own error handler via `t.catch`, all that
   * happens is that this variable is assigned.
   */
  public errorHandler: ErrorHandler = (err) => {
    console.error("No error handler was set!");
    console.error("Set your own error handler with `t.catch((err) => ...)`");
    console.error(err);
    throw err;
  };

  /**
   * Sets the instance's error handler that is called whenever an error occurs.
   *
   * @param errorHandler A function that handles potential errors
   */
  catch(errorHandler: ErrorHandler) {
    this.errorHandler = errorHandler;
  }

  constructor(
    /** Access token of the Telegraph account */
    public token?: string,
    /** Options for configuring the instance */
    private options: Options = { apiRoot: API_ROOT },
  ) {}

  private async request<T>(method: string, body?: T) {
    const url = `${this.options.apiRoot}/${method}`;
    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: this.token, ...body }),
      });
    } catch (err) {
      return await this.errorHandler(err);
    }
    if (!response.ok) {
      return await this.errorHandler(`Request failed: ${response.statusText}`);
    }
    const json = await response.json();
    if (!json.ok) return await this.errorHandler(json.error);
    return json.result;
  }

  /**
   * Use this method to create a new Telegraph account. Most users only need
   * one account, but this can be useful for channel administrators who would
   * like to keep individual author names and profile links for each of their
   * channels.
   *
   * @param details Details of the account.
   *
   * @returns On success, returns an Account object with the regular fields
   * and an additional access_token field.
   */
  createAccount(details: {
    /**
     * Account name, helps users with several accounts remember which they are
     * currently using. Displayed to the user above the "Edit/Publish" button
     * on Telegra.ph, other users don't see this name.
     */
    short_name: string;
    /** Default author name used when creating new articles. */
    author_name?: string;
    /**
     * Default profile link, opened when users click on the author's name below
     * the title. Can be any link, not necessarily to a Telegram profile or
     * channel.
     */
    author_url?: string;
  }): Promise<Account & AccessToken & AuthUrl> {
    return this.request("createAccount", details);
  }

  /**
   * Use this method to get information about a Telegraph account.
   *
   * @param fields List of account fields to return. Defaults to all
   * (`short_name`, `author_name`, `author_url`, `auth_url`, and `page_count`).
   *
   * @returns Account object on success.
   */
  getAccount<K extends AccountFields>(
    fields?: K[],
  ): Promise<{ [key in K]: Required<Account & AuthUrl & PageCount>[key] }> {
    return this.request("getAccountInfo", { fields: fields ?? ACCOUNT_FIELDS });
  }

  /**
   * Use this method to update information about a Telegraph account. Pass only
   * the parameters that you want to edit.
   *
   * @param details Details of the account
   *
   * @returns On success, returns an Account object with the default fields.
   */
  editAccount(details: {
    /** New account name. */
    short_name?: string;
    /** New default author name used when creating new articles. */
    author_name?: string;
    /**
     * New default profile link, opened when users click on the author's name
     * below the title. Can be any link, not necessarily to a Telegram profile
     * or channel.
     */
    author_url?: string;
  }): Promise<Account> {
    return this.request("editAccountInfo", details);
  }

  /**
   * Use this method to revoke access_token and generate a new one, for example,
   * if the user would like to reset all connected sessions, or you have reasons
   * to believe the token was compromised.
   *
   * @param options Options for the method.
   *
   * @returns On success, returns an Account object with new access_token and
   * auth_url fields.
   */
  async revokeToken(options = {
    /** Whether to apply the new access token to the instance. */
    save: true,
  }): Promise<AccessToken & AuthUrl> {
    const creds = await this.request("revokeAccessToken");
    if (creds && options.save) this.token = creds.access_token;
    return creds;
  }

  /**
   * Use this method to create a new Telegraph page.
   *
   * @param options Information about the page.
   *
   * @returns On success, returns a Page object.
   */
  create<T extends boolean>(
    options: {
      /** Page title. */
      title: string;
      /** Content of the page. */
      content: string | Node[];
      /** Author name, displayed below the article's title. */
      author_name?: string;
      /**
       * Profile link, opened when users click on the author's name below the
       * title. Can be any link, not necessarily to a Telegram profile or channel.
       */
      author_url?: string;
      /** If true, a content field will be returned in the Page object. */
      return_content?: T;
    },
  ): Promise<Page<T>> {
    return this.request("createPage", {
      ...options,
      content: typeof options.content === "string"
        ? [options.content]
        : options.content,
    });
  }

  /**
   * Use this method to edit an existing Telegraph page.
   *
   * @param path Path to the page.
   * @param options Details to edit the page.
   *
   * @returns On success, returns a Page object.
   */
  edit<T extends boolean>(
    path: string,
    options: {
      /** Page title. */
      title: string;
      /** Content of the page. */
      content: string | Node[];
      /** Author name, displayed below the article's title. */
      author_name?: string;
      /**
       * Profile link, opened when users click on the author's name below the
       * title. Can be any link, not necessarily to a Telegram profile or channel.
       */
      author_url?: string;
      /** If true, a content field will be returned in the Page object. */
      return_content?: T;
    },
  ): Promise<Page<T>> {
    return this.request("editPage", { path, ...options });
  }

  /**
   * Use this method to get a Telegraph page.
   *
   * @param path Path to the Telegraph page (in the format Title-12-31, i.e. everything that comes after http://telegra.ph/).
   * @param options Additional parameters.
   *
   * @returns Returns a Page object on success.
   */
  get(path: string, options = {
    /** If true, content field will be returned in Page object. Defaults to true. */
    return_content: true,
  }): Promise<Page<true>> {
    return this.request("getPage", { path, ...options });
  }

  /**
   * Use this method to get a list of pages belonging to a Telegraph account.
   *
   * @param options Additional parameters.
   *
   * @returns Returns a PageList object, sorted by most recently created pages first.
   */
  getPages(options?: {
    /** Sequential number of the first page to be returned. */
    offset?: number;
    /** Limits the number of pages to be retrieved. */
    limit?: number;
  }): Promise<PageList> {
    return this.request("getPageList", options);
  }

  /**
   * Use this method to get the number of views for a Telegraph article.
   *
   * @param path Path to the Telegraph page (in the format Title-12-31, where 12
   * is the month and 31 the day the article was first published).
   * @param options Additional parameters to get views gained in a specific time
   * period.
   *
   * @returns Returns a PageViews object on success. By default, the total number of page views will be returned.
   */
  getViews(path: string, options?: {
    /**
     * Required if month is passed. If passed, the number of page views for the
     * requested year will be returned.
     */
    year?: number;
    /**
     * Required if day is passed. If passed, the number of page views for the
     * requested month will be returned.
     */
    month?: number;
    /**
     * Required if hour is passed. If passed, the number of page views for the
     * requested day will be returned.
     */
    day?: number;
    /** If passed, the number of page views for the requested hour will be returned. */
    hour?: number;
  }): Promise<PageViews> {
    return this.request("getViews", { path, ...options });
  }
}

/**
 * Helper function for uploading local image or video files to Telegraph
 * servers. Supports files upto 5 or 6 MB (Undocumented).
 *
 * @param file File to upload. If a filepath string or URL is given, reads from
 * local filesystem.
 * @param apiUrl API url to use. Defaults to https://telegra.ph/upload.
 *
 * @returns URL of the uploaded file.
 */
export async function upload(
  file: string | Blob | Deno.FsFile | URL | BufferSource,
  apiUrl = "https://telegra.ph/upload",
) {
  let blob: Blob | BufferSource;
  const apiOrigin = new URL(apiUrl).origin;
  if (typeof file === "string") {
    const regex = new RegExp(`${apiOrigin}/file/(.+).(.+)`);
    if (regex.test(file)) return file;

    if (file.startsWith("https://") || file.startsWith("http://")) {
      const res = await fetch(file);
      if (!res.ok) {
        throw new Error("Failed to fetch URL: " + res.statusText);
      }
      blob = await res.blob();
    } else {
      try {
        blob = await Deno.readFile(file);
      } catch (err) {
        throw new Error(err);
      }
    }
  } else if (file instanceof Deno.FsFile) {
    const stat = await file.stat();
    const buffer = new Uint8Array(stat.size);
    await file.read(buffer);
    blob = buffer;
  } else if (file instanceof URL) {
    const res = await fetch(file);
    blob = await res.blob();
  } else {
    blob = file;
  }

  const body = new FormData();
  body.append("photo", new File([blob], "blob"));

  const res = await fetch(apiUrl, { method: "POST", body });
  if (!res.ok) throw new Error(res.statusText);
  const result = await res.json();
  if (result.error || !result?.src) throw new Error(result.error);
  return `${apiOrigin}${result[0].src}`;
}
