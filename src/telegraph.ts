import * as types from "./types.ts";

/** Officially available methods of Telegra.ph API. https://telegra.ph/api#Available-methods */
export type Method =
  | "createAccount"
  | "createPage"
  | "editAccountInfo"
  | "editPage"
  | "getAccountInfo"
  | "getPage"
  | "getPageList"
  | "getViews"
  | "revokeAccessToken";

export interface TelegraphOptions {
  accessToken?: string;
  short_name?: string;
  author_name?: string;
  author_url?: string;
  apiRoot?: string;
}

/**
 * This single important class helps you to create [Telegra.ph](https://telegra.ph) account instances and create pages (posts) through them.
 *
 * With an account instance, you can create posts so easily! For example,
 * ```ts
 * // Create a Telegra.ph account.
 * const tph = new Telegraph({
 *    // Only `short_name` is required to
 *    // create an account.
 *    short_name: "Gary",
 *    // However, you can pass in the rest
 *    // as optional parameters,
 *    author_name: "Gary J. Franco",
 *    author_url: "https://telegra.ph/",
 * });
 * ```
 *
 * You can also connect to an existing account by passing in the `accessToken`.
 * ```ts
 * // Create a Telegra.ph account.
 * const tph = new Telegraph({
 *    accessToken: "XXXXXXXXXXX", // Keep your `accessToken` private, boys!
 * });
 * ```
 *
 * Wow, cool! You know something more cool? Connect to an existing account but also change the details of it.
 * ```ts
 * // Create a Telegra.ph account.
 * const tph = new Telegraph({
 *    accessToken: "XXXXXXXXXXX", // Existing account's access_token.
 *    // Hmm, I didn't like the old name, let's change it.
 *    short_name: "Bob", // This will change the account's short name to "Bob".
 *    // Don't forget to call `setupAccount`.
 *    // You can also change `author_name` and `author_url` as well.
 * });
 * ```
 *
 * Now that you have created an instance of Telegraph, let's move on.
 *
 * Call `setupAccount` before you do any other operations with your account.
 * But, if you are only passing in `accessToken` as options, you don't have to call this.
 * ```ts
 * await tph.setupAccount();
 * ```
 *
 * Now that you have connected your account, you can call any methods with the required arguments!
 * Try calling this:
 *
 * ```ts
 * const post = await tph.create({
 *    title: "My first post using Tph's Deno API wrapper",
 *    content: "Yoohooo! This is my first post created using Telegraph's Deno API wrapper.",
 * });
 * // The `post` constant contains all the
 * // available details of your fresh post!
 * // Try logging the URL to console.
 * console.log(post.url);
 * ```
 *
 * Read the JSDocs or the official documentation on GitHub to find out more about all methods and their usage.
 */
export class Telegraph {
  private readonly API_ROOT: string = "https://api.telegra.ph/";
  private accessToken = "";
  private readonly config: TelegraphOptions;
  /**
   * Currently, you can pass in the values in 3 different ways.
   *
   * - **Creating a new account**
   *
   * ```ts
   * const tph = new Telegraph({
   *     // Only `short_name` is required to
   *     // create an account.
   *     short_name: "Gary",
   *     // However, you can pass in the rest
   *     // as optional parameters,
   *     author_name: "Gary J. Franco",
   *     author_url: "https://telegra.ph/",
   * });
   *
   * // To actually setup (create) an account.
   * await tph.setupAccount();
   * ```
   *
   * - **Connecting to an existing account**
   *
   * ```ts
   * // Create a Telegra.ph account.
   * const tph = new Telegraph({
   *    accessToken: "XXXXXXXXXXX", // Keep your `accessToken` private, boys!
   * });
   *
   * // You don't need to call `setupAccount` here.
   * ```
   * - **Connecting to an account and changing the account info**
   *
   * ```ts
   * // Create a Telegra.ph account.
   * const tph = new Telegraph({
   *    accessToken: "XXXXXXXXXXX", // Existing account's access_token.
   *    // Update `short_name` to "Snoopy"
   *    short_name: "Snoopy",
   *    // Don't forget to call `setupAccount`.
   *    // You can also change `author_name` and `author_url` as well.
   * });
   *
   * // To update and connect to the account.
   * await tph.setupAccount();
   * ```
   *
   * @param config Values required for creating or connecting a Telegra.ph account. Pass in required values as the docs says.
   */
  constructor(config: TelegraphOptions) {
    if (config.accessToken) this.accessToken = config.accessToken;
    if (config.apiRoot) this.API_ROOT = config.apiRoot;
    this.config = config;
    if (!config.accessToken && !config.short_name) {
      throw new Error(
        "No valid input were provided to create or connect a Telegraph account.",
      );
    }
  }

  /** Access token of the account */
  get token() {
    return this.accessToken;
  }

  set token(value: string) {
    this.accessToken = this.config.accessToken = value;
  }

  /**
   * Updates or creates a Telegraph account and assigns the access token to the account instance.
   *
   * ```ts
   * await tph.setupAccount();
   * ```
   *
   * You have to call this method if you haven't passed `accessToken` to create an account **or**,
   * if you have provided something with `accessToken` for updating the existing account -- while creating an account instance.
   * @returns Information about the connected account.
   */
  async setupAccount(): Promise<types.Account> {
    // If access token and any other param is provided.
    if (
      this.config.accessToken &&
      (this.config.author_name ||
        this.config.author_url ||
        this.config.short_name)
    ) {
      return await this.editAccount(this.config);
    }

    // If no access token, and but at least `short_name`,
    if (
      !this.config.accessToken &&
      !this.accessToken &&
      this.config.short_name
    ) {
      const account = await this.createAccount({
        short_name: this.config.short_name,
        author_name: this.config.author_name,
        author_url: this.config.author_url,
      });

      this.token = account.access_token;
      return account;
    }

    // If just access token.
    return await this.getAccount();

    // What about no access token and no `short_name`?
    // Already handled in constructor, I think that works.
  }

  /**
   * Helps to upload local files upto 5 or 6MB (I think) to Telegraph's file uploading service and returns the URL of the uploaded file.
   *
   * Useful to add local images as a source for `<img>`.
   *
   * Supported file formats: `.jpg`, `.jpeg`, `.png`, `.gif` and `.mp4`.
   *
   * ```ts
   * const imgUrl = await Telegraph.upload("./assets/images/banner.png");
   * ```
   *
   * **This is not actually a part of the official Telegraph API**, at least, it does not have any official documentation.
   *
   * @param src The local or remote file path or URL.
   * @returns Remote URL to the uploaded file.
   */
  public static async upload(
    src: string | URL | Blob | Uint8Array | BufferSource,
  ): Promise<string> {
    let blob: Blob | BufferSource;

    if (typeof src === "string") {
      // Use the same URL.
      const r = new RegExp("http(s?)://telegra.ph/file/(.+).(.+)", "i");
      if (r.test(src)) return src.toLowerCase();
      // Download file from external source.
      if (src.startsWith("https://") || src.startsWith("http://")) {
        const response = await fetch(src);
        const buffer = await response.arrayBuffer();
        blob = new Uint8Array(buffer);
      } else {
        // Probably (It should be) it's a file path.
        await Deno.open(src).catch(() => {
          throw new Error(`The file '${src}' does not exists`);
        });
        blob = await Deno.readFile(src);
      }
    } else if (src instanceof URL) {
      blob = await Deno.readFile(src);
    } else {
      // Blob | Uint8Array | BufferSource?
      blob = src;
    }

    const file = new File([blob], "blob");
    const form = new FormData();
    form.append("photo", file);

    const res = await fetch("https://telegra.ph/upload", {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);

    return `https://telegra.ph${json[0].src}`;
  }

  /**
   * Requests a API method with access token.
   * @param method API method.
   * @param payload Body of the API call.
   * @returns Result of the API call.
   */
  private async request<T, U = void>(method: Method, payload?: U): Promise<T> {
    const url = this.API_ROOT + method;
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        access_token: this.accessToken,
        ...payload,
      }),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const json = await response.json();
    if (!json.ok) {
      throw new Error(json.error);
    }
    return json.result;
  }

  /**
   * Creates a Telegraph account and returns the details of the new account.
   * Remember to store the `access_token`, of the account.
   *
   * It also returns a URL to authorize a browser on telegra.ph and connect it to a Telegraph account.
   * This URL is valid for only one use and for 5 minutes only.
   *
   * Read more: https://telegra.ph/api#createAccount
   *
   * ```ts
   * const account = await tph.createAccount({
   *    short_name: "Aaron",
   *    author_name: "Aaron Blake",
   *    author_url: "https://randomwordgenerator.com/name.php",
   * });
   * ```
   *
   * @param options Details of the account you want to create. Only `short_name` is required.
   * @returns "On success, returns an Account object with the regular fields and an additional access_token field".
   */
  async createAccount(
    options: types.CreateAccountOptions,
  ): Promise<types.Account> {
    return await this.request<types.Account, types.CreateAccountOptions>(
      "createAccount",
      options,
    );
  }

  /**
   * Update information about the account. Pass only the parameters that you want to edit. At least one of them is required.
   *
   * Read more: https://telegra.ph/api#editAccountInfo
   *
   * ```ts
   * const account = await tph.editAccount({
   *    short_name: "James",
   *    author_name: "Aaron James Blake",
   *    author_url: "https://randomwordgenerator.com/name.php",
   * });
   * ```
   *
   * @param options Information of the account you want to edit. At least one of them is required.
   * @returns On success, returns an Account object with the `short_name`, `author_name` (if there is) and `author_url` (if there is) fields.
   */
  async editAccount(options: types.EditAccountOptions): Promise<types.Account> {
    return await this.request<types.Account, types.EditAccountOptions>(
      "editAccountInfo",
      options,
    );
  }

  /**
   * Use this method to get information about the account.
   *
   * You can specify the list of account fields to return.
   * Available fields are `short_name`, `author_name`, `author_url`, `auth_url` and `page_count`.
   *
   * Read more: https://telegra.ph/api#getAccountInfo
   *
   * By default it fetches all fields.
   *
   * ```ts
   * // Default: All details.
   * await tph.getAccount();
   * // `author_name` only.
   * await tph.getAccount(["author_name"]);
   * // Basic details.
   * await tph.getAccount([
   *  "short_name",
   *  "author_name",
   *  "author_url"
   * ]);
   * ```
   *
   * @param fields The List of account fields to return. Available fields: `short_name`, `author_name`, `author_url`, `auth_url` and `page_count`.
   * @returns Account object with the requested fields on success.
   */
  async getAccount(
    fields: types.GetAccountInfoFields = [
      "short_name",
      "author_name",
      "author_url",
      "auth_url",
      "page_count",
    ],
  ): Promise<types.Account> {
    return await this.request<types.Account, types.GetAccountInfoOptions>(
      "getAccountInfo",
      {
        fields,
      },
    );
  }

  /**
   * Use this method to revoke `access_token` and generate a new one.
   * For example, if the you would like to reset all connected sessions,
   * or you have reasons to believe the token was compromised.
   *
   * Passing the argument `true` or just leaving it empty,
   * revokes the `access_token` and sets the new one to the connected account.
   * And that `access_token` will be used when calling methods later on.
   *
   * Read more: https://telegra.ph/api#revokeAccessToken
   *
   * ```ts
   * await tph.revokeAccessToken();
   * ```
   *
   * By passing `false`, it only revokes the `access_token`.
   * You have to store the returned `access_token`, if you want to do something with the account later.
   *
   * ```ts
   * await tph.revokeAccessToken(false);
   * ```
   *
   * Or set yourself manually later at some point like,
   * ```ts
   * const { access_token } = await tph.revokeAccessToken(false);
   * // When you are done with your things,
   * tph.token = access_token;
   * ```
   *
   * @param save Whether you wanna save the new `access_token` to the account or not. Defaults to `true`. Set to `false` if you don't want to update it.
   * @returns On success, returns new `access_token` and `auth_url` for the account.
   */
  async revokeAccessToken(
    save = true,
  ): Promise<types.RevokeAccessTokenResponse> {
    const accountCreds = await this.request<types.RevokeAccessTokenResponse>(
      "revokeAccessToken",
    );
    if (save) this.token = accountCreds.access_token;
    return accountCreds;
  }

  /**
   * Use this method to create a new Telegraph page from the account.
   *
   * Read more: https://telegra.ph/api#createPage
   *
   * `title` and `content` are required.
   * `author_name`, `author_url`, `return_content` are optionals.
   *
   * ```ts
   * await tph.create({
   *    title: "Telegraph is cool!",
   *    // See down below for more content types.
   *    content: "I <3 Telegra.ph!",
   *    // Not required.
   *    author_name: "Telegram",
   *    author_url: "https://telegram.org",
   *    return_content: true,
   * });
   * ```
   *
   * Content can be **Markdown**, **HTML**, just **String** or **Array of strings** or **[Node](https://telegra.ph/api#Node)** or an Array of both strings and Nodes.
   * To use HTML and Markdown you need to import 2 parser functions from this module.
   *
   * ```ts
   * import { parseHtml, parseMarkdown } from "https://deno.land/x/telegraph/mod.ts";
   * ```
   *
   * Here are basic examples for each type. See the README of the official Repository to find more of them.
   *
   * ```ts
   * const content = "With just a string";
   * const content = [ "Array of strings.", " I am number one." ];
   * ```
   *
   * **HTML**, `parseHtml(htmlContent)` will convert the HTML string to Node.
   * ```ts
   * const content = parseHtml(`<h1>Pure HTML, boys</h1> <br>
   * <p><b>Be bold</b></p>`);
   * ```
   *
   * **Markdown**, `parseMarkdown(mdContent)` will parse the Markdown down to Node for the content.
   *
   * ```ts
   * const content = parseMarkdown(`## Heading 2\n\nThis is so **cool**!`);
   * ```
   *
   * **Node**, bit complicated one to create (That's why MD and HTML methods exists), if there is a lot of formatting and all.
   *
   * ```ts
   * const content = [
   *   {
   *     tag: "a", // Specifies the tag.
   *     attrs: {
   *       href: "https://github.com", // Attributes supports `href` and `src`.
   *     },
   *     children: ["GitHub"], // Children can be another Node, parsed HTML, parsed MD, strings.
   *   },
   *   {
   *     tag: "br", // Line break
   *   },
   *   {
   *     tag: "p", // Paragraph
   *     children: [
   *       "GitHub is where over 73 million developers shape the future of software, together.",
   *     ],
   *   },
   *   {
   *     tag: "img", // Image
   *     attrs: { // Attributes supports `href` and `src`.
   *       src: "https://github.githubassets.com/images/modules/site/social-cards/github-social.png",
   *     },
   *   },
   * ];
   * ```
   *
   * @param options Options to create the page. Only `title` and `content` is required.
   * @returns On success, returns a `Page` object with all the details of the page you just created.
   */
  async create(options: types.CreatePageOptions): Promise<types.Page> {
    if (typeof options.content === "string") {
      options.content = [options.content];
    }
    return await this.request<types.Page, types.CreatePageOptions>(
      "createPage",
      options,
    );
  }

  /**
   * Use this method to edit an existing Telegraph page.
   *
   * Read more: https://telegra.ph/api#editPage
   *
   * Only `content` is required. All other params are optional.
   *
   * ```ts
   * await tph.edit("Telegrapphs-i-Cool-12-31", {
   *    // See down below for more content types.
   *    content: "I <3 <3 Telegra.ph!",
   *    // Not required.
   *    title: "Telegraph is cool!",
   *    author_name: "Telegram",
   *    author_url: "https://telegram.org",
   *    return_content: true,
   * });
   * ```
   *
   * Content can be **Markdown**, **HTML**, just **String** or **Array of strings** or **[Node](https://telegra.ph/api#Node)** or an Array of both strings and Nodes.
   * To use HTML and Markdown you need to import 2 parser functions from this module.
   *
   * ```ts
   * import { parseHtml, parseMarkdown } from "https://deno.land/x/telegraph/mod.ts";
   * ```
   *
   * Here are basic examples for each type. See the README of the official Repository to find more of them.
   *
   * ```ts
   * const content = "With just a string";
   * const content = [ "Array of strings.", " I am number one." ];
   * ```
   *
   * **HTML**, `parseHtml(htmlContent)` will convert the HTML string to Node.
   * ```ts
   * const content = parseHtml(`<h1>Pure HTML, boys</h1> <br>
   * <p><b>Be bold</b></p>`);
   * ```
   *
   * **Markdown**, `parseMarkdown(mdContent)` will parse the Markdown down to Node for the content.
   *
   * ```ts
   * const content = parseMarkdown(`## Heading 2\n\nThis is so **cool**!`);
   * ```
   *
   * **Node**, bit complicated one to create (That's why MD and HTML methods exists), if there is a lot of formatting and all.
   *
   * ```ts
   * const content = [
   *   {
   *     tag: "a", // Specifies the tag.
   *     attrs: {
   *       href: "https://github.com", // Attributes supports `href` and `src`.
   *     },
   *     children: ["GitHub"], // Children can be another Node, parsed HTML, parsed MD, strings.
   *   },
   *   {
   *     tag: "br", // Line break
   *   },
   *   {
   *     tag: "p", // Paragraph
   *     children: [
   *       "GitHub is where over 73 million developers shape the future of software, together.",
   *     ],
   *   },
   *   {
   *     tag: "img", // Image
   *     attrs: { // Attributes supports `href` and `src`.
   *       src: "https://github.githubassets.com/images/modules/site/social-cards/github-social.png",
   *     },
   *   },
   * ];
   * ```
   *
   * @param path Path to the post (page) you want to edit the title, properties, content. Paths are the string comes after "https://telegra.ph/".
   *
   * For example, `Telegraph-is-cool-12-24` is the path. Original URL: `https://telegra.ph/Telegraph-is-cool-12-24`
   * @param options The fields you want to edit, just like the options of Creating a post. But only `content` is required, all other fields are optional.
   * @returns
   */
  async edit(
    path: string,
    options: types.EditPageOptions,
  ): Promise<types.Page> {
    if (!options.title) {
      const { title } = await this.get(path);
      options.title = title;
    }

    if (typeof options.content === "string") {
      options.content = [options.content];
    }

    return this.request<types.Page, types.EditPageRequestOptions>("editPage", {
      path: path,
      ...options,
    });
  }

  /**
   * Use this method to get a Telegraph page.
   *
   * Read more: https://telegra.ph/api#getPage
   *
   * Get page details without the content.
   *
   * ```ts
   * await tph.get("Telegraph-is-cool-12-24");
   * ```
   *
   * Get a page details including the content.
   *
   * ```ts
   * await tph.get("Telegraph-is-cool-12-24", true);
   * ```
   *
   * @param path Path to the Telegraph page (in the format Title-12-31, i.e. everything that comes after `http://telegra.ph/`).
   * @param returnContent If `true`, content field will be returned in `Page` object. Defaults to `false`.
   * @returns On success, returns a `Page` object with the details of the requested page.
   */
  async get(path: string, returnContent = false): Promise<types.Page> {
    return await this.request<types.Page, types.GetPageOptions>("getPage", {
      path: path,
      return_content: returnContent,
    });
  }

  /**
   * Use this method to get a list of pages belonging to the account.
   * Returns a PageList object, sorted by most recently created pages first.
   *
   * Read more: https://telegra.ph/api#getPageList
   *
   * Get all pages belonging to the connected account.
   *
   * ```ts
   * tph.getPages();
   * ```
   *
   * To get 2nd and 3rd last created pages,
   *
   * ```ts
   * tph.getPages({
   *   offset: 1,
   *   limit: 2,
   * });
   * ```
   *
   * @param options Offset and limit of the pages to be returned.
   *
   * - `offset` - Sequential number of the first page to be returned.
   * - `limit` - Number of pages to be returned.
   * @returns Returns a PageList object, sorted by most recently created pages first.
   */
  async getPages(
    options: types.GetPageListOptions = { limit: 50, offset: 0 },
  ): Promise<types.PageList> {
    return await this.request<types.PageList, types.GetPageListOptions>(
      "getPageList",
      options,
    );
  }

  /**
   * Use this method to get the number of views for a Telegraph article.
   *
   * Read more: https://telegra.ph/api#getViews
   *
   * ```ts
   * tph.getPageViews("Telegraph-is-cool-12-24");
   * // { views: 0 }
   * // View count of the year 2021?
   * tph.getPageViews({ year: 2021 });
   * // View count of 3PM of December 24th of year 2021.
   * tph.getPageViews({
   *   // Optional. 0 to 24.
   *   hour: 15,
   *   // Required if `hour` is passed. 1 to 31.
   *   day: 24,
   *   // Required if `day` is passed. 1 to 12.
   *   month: 12,
   *   // Required if `month` is passed. 2000 to 2100.
   *   year: 2021,
   * });
   * ```
   *
   * @param path Path to the post (page) which you want to get the views. Paths are the string comes after "https://telegra.ph/".
   *
   * For example, `Telegraph-is-cool-12-24` is the path. Original URL: `https://telegra.ph/Telegraph-is-cool-12-24`
   * @param options All are optionals. `hour` (Optional. 0 to 24), `day` (Required if `hour` is passed. 1 to 31), `month` (Required if `day` is passed. 1 to 12), and `year` (Required if `month` is passed. 2000 to 2100)
   * @returns Number of views `{ "views": 0 }`
   * ```
   */
  async getPageViews(
    path: string,
    options?: types.GetViewsOptions,
  ): Promise<types.PageViews> {
    return await this.request<types.PageViews, types.GetViewsRequestOptions>(
      "getViews",
      {
        path: path,
        ...options,
      },
    );
  }
}
