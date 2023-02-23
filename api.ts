import type {
  Account,
  Node,
  Page,
  PageList,
  PageViews,
  RevokedAccessToken,
} from "./types.ts";

const API_ROOT = "https://api.telegra.ph";

interface Options {
  apiRoot?: string;
}

const ACCOUNT_FIELDS = [
  "short_name",
  "author_name",
  "author_url",
  "auth_url",
  "page_count",
] as const;
type AccountFields = typeof ACCOUNT_FIELDS[number];

export class Telegraph {
  constructor(
    public token?: string,
    private options: Options = { apiRoot: API_ROOT },
  ) {}

  private async request<T>(method: string, body?: T) {
    const url = `${this.options.apiRoot}/${method}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: this.token, ...body }),
    });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }
    const json = await response.json();
    if (!json.ok) throw new Error(json.error);
    return json.result;
  }

  createAccount(details: {
    short_name: string;
    author_name?: string;
    author_url?: string;
  }): Promise<Account> {
    return this.request("createAccount", details);
  }

  getAccount(fields: AccountFields[] = [...ACCOUNT_FIELDS]): Promise<Account> {
    return this.request("getAccount", { fields });
  }

  editAccount(
    details: { short_name?: string; author_name?: string; author_url?: string },
  ): Promise<Account> {
    return this.request("editAccount", details);
  }

  async revokeToken(options = { save: true }): Promise<RevokedAccessToken> {
    const creds = await this.request("revokeAccessToken") as RevokedAccessToken;
    if (options.save) this.token = creds.access_token;
    return creds;
  }

  create(
    options: {
      title: string;
      content: string | Node[];
      author_name?: string;
      author_url?: string;
      return_content?: boolean;
    },
  ): Promise<Page> {
    return this.request("createPage", {
      ...options,
      content: typeof options.content === "string"
        ? [options.content]
        : options.content,
    });
  }

  edit(
    path: string,
    options: {
      title?: string;
      content: string | Node[];
      author_name?: string;
      author_url?: string;
      return_content?: boolean;
    },
  ): Promise<Page> {
    return this.request("editPage", { path, ...options });
  }

  get(path: string, options = { return_content: true }): Promise<Page> {
    return this.request("getPage", { path, ...options });
  }

  getPages(options: { offset?: number; limit?: number }): Promise<PageList> {
    return this.request("getPageList", options);
  }

  getViews(path: string, options?: {
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
  }): Promise<PageViews> {
    return this.request("getViews", { path, ...options });
  }
}

export async function upload(
  file: string | Blob | Deno.FsFile | URL | BufferSource,
  apiUrl: string = "https://telegra.ph/upload",
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
  if (result.error) throw new Error(result.error);
  return `${apiOrigin}${result[0].src}`;
}
