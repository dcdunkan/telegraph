# [Telegra.ph](https://telegra.ph) API wrapper for Deno [🦕](https://deno.land)

This is a tiny Telegra.ph API wrapper for [Deno](https://deno.land) written in
[TypeScript](https://typescriptlang.org). All methods as listed
[here](https://telegra.ph/api#Available-methods) are available. See
[Usage](#usage) for usage examples for each methods.

See the [Deno module here](https://deno.land/x/telegraph).

### Table of Contents

- [What is Telegra.ph?](#what-is-telegraph)
- [Usage](#usage)
- [Upload](#upload)
- [Content Formatting](#content-formatting)

---

## What is Telegra.ph?

**Telegra.ph** is a minimalist publishing tool that allows you to create richly
formatted posts and push them to the Web in just a click. Telegraph posts also
get beautiful [Instant View](https://telegram.org/blog/instant-view) pages on
[Telegram](https://telegram.org).

**It is recommended to read the official [Telegra.ph](https://telegra.ph) API
docs** @<https://telegra.ph/api>

This module contains all methods in the official Telegra.ph API and a unofficial
Telegra.ph file upload module (Only `.jpg`, `.jpeg`, `.png`, `.gif` and `.mp4`
files). See example usage.

---

## Usage

Import to your project file and connect or create a Telegraph account:

```ts
// Import Telegraph class to your project.
import { Telegraph } from "https://deno.land/x/telegraph/mod.ts";

// Connect to an account.
const tphOldAccount = new Telegraph({
  access_token: "<your account access token>",
});

// Oh, don't have an access token? Create an account and use it.
// This will create an account with the given details.
const tphNew = new Telegraph({
  short_name: "Deno", // Short Name is required.
  author_name: "Deno.land", // Optional parameter.
  author_url: "https://deno.land/", // Optional parameter.
});

// You want to use an already existing account with an access token and edit some of the details?
const tphUpdatedOld = new Telegraph({
  access_token: "<the account access token>",
  short_name: "Ryan Dahl", // A little change. (Optional)
  author_url: "https://github.com/ry", // Change in URL (Optional)
});
```

Now you can use any methods. See the examples for each methods:

- [`createAccount`](#createAccount)
- [`editAccount`](#editAccount)
- [`revokeAccessToken`](#revokeAccessToken)
- [`getAccount`](#getAccount)
- [`create`](#create)
- [`edit`](#edit)
- [`get`](#get)
- [`getPages`](#getPages)
- [`getPageViews`](#getPageViews)

<h3 id="createAccount">Account > <a href="https://telegra.ph/api#createAccount"><code>createAccount</code></a></h3>

Creates a new Telegraph account, and returns the newly created account's details
including `auth_url` and `access_token`.

Read more: <https://telegra.ph/api#createAccount>

<small>Usage:</small>

```ts
tph.createAccount({
  short_name: "Sandbox", // Required
  author_name: "Anonymous", // Optional
  author_url: "", // Optional
});
```

<small>Outputs:</small>

```json
{
  "short_name": "Sandbox",
  "author_name": "Anonymous",
  "author_url": "",
  "access_token": "xxxxxxxx",
  "auth_url": "https://edit.telegra.ph/auth/xxxxxxx"
}
```

<h3 id="editAccount">Account > <a href="https://telegra.ph/api#editAccountInfo"><code>editAccount</code></a></h3>

Edits the details of the connected Telegraph account, and returns the edited
account details. Does **not** includes `access_token` or `auth_url`. Requires
atleast one of the parameters.

Read more: <https://telegra.ph/api#editAccountInfo>

<small>Usage:</small>

```ts
tph.editAccount({
  short_name: "BoxSand",
  author_name: "Nonymous",
  author_url: "https://minecraft.net",
});
```

<small>Outputs:</small>

```json
{
  "short_name": "BoxSand",
  "author_name": "Nonymous",
  "author_url": "https://minecraft.net/"
}
```

<h3 id="revokeAccessToken">Account > <a href="https://telegra.ph/api#revokeAccessToken"><code>revokeAccessToken</code></a></h3>

Revokes `access_token` of the connected Telegraph account, and returns the new
`access_token` and `auth_url`.

Read more: <https://telegra.ph/api#revokeAccessToken>

Takes in one optional parameter,

- **`save`**
  - _Type_: `boolean`.
  - _Defaults to_ `true`.
  - If `true`, the new `access_token` will be set to the connected account.

<small>Usage:</small>

```ts
// Revokes the `access_token` and sets the
// new one to the connected account.
tph.revokeAccessToken();
// Only revokes the `access_token`.
// @param save - boolean. Defaults to true.
tph.revokeAccessToken(false);
```

<small>Outputs:</small>

```json
{
  "access_token": "xxxxxxxx",
  "auth_url": "https://edit.telegra.ph/auth/xxxxxxx"
}
```

<h3 id="getAccount">Account > <a href="https://telegra.ph/api#getAccountInfo"><code>getAccount</code></a></h3>

Returns the account details.

Read more: <https://telegra.ph/api#getAccountInfo>

Parameter:

- **`fields`**: Fields to return.
  - _Type_:
    `("short_name" | "author_name" | "author_url" | "auth_url" | "page_count")[]`.
  - _Defaults to_
    `[ "short_name", "author_name", "author_url", "auth_url", "page_count" ]`.

<small>Usage:</small>

```ts
// Returns all.
tph.getAccount();
// Returns specified.
tph.getAccount(["author_url"]); // --> { author_url: "https://minecraft.net/" }
tph.getAccount(["author_name", "author_url"]); // --> { author_url: "https://minecraft.net/", author_name: "Nonymous" }
tph.getAccount(["page_count"]);
```

<small>Outputs (Or only specified fields):</small>

```json
{
  "short_name": "BoxSand",
  "author_name": "Nonymous",
  "author_url": "https://minecraft.net/"
}
```

---

<h3 id="create">Page > <a href="https://telegra.ph/api#createPage"><code>create</code></a></h3>

Creates a new Telegraph Page (Post), and returns the details of the created
page.

Read more: <https://telegra.ph/api#createPage>

In parameter `options`, the property `content` can be a `string` or `string[]`
or HTML or Markdown or an array of [`Node`](https://telegra.ph/api#Node).

See [Content Formatting](#content-formatting) for more.

Example for content:

```ts
"Telegraph is cool!" // Just string
["Foo", "Bar"]; // Array of strings.
```

Passing `Markdown` as content:

```ts
const content = parseMarkdown(
  "## Jurassic Deno\n\n" +
    `![image](${await Telegraph.upload("jurassicDeno.jpg")})`,
)!;
```

Or the same thing by using `HTML` as content:

```ts
const content = parseHtml(
  "<h3>Jurassic Deno</h3><br>" +
    `<img src="${await Telegraph.upload("jurassicDeno.jpg")}">`,
)!;
```

Passing [`Node`](https://telegra.ph/api#Node) as content:

```ts
[
  {
    tag: "a", // Tag.
    attrs: {
      href: "https://github.com", // Attributes supports `href` and `src`.
    },
    children: ["GitHub"],
  },
  {
    tag: "br",
  },
  // A paragraph
  {
    tag: "p",
    children: [
      "GitHub is where over 73 million developers shape the future of software, together.",
    ],
  },
  // An image
  {
    tag: "img",
    attrs: { // Attributes supports `href` and `src`.
      src:
        "https://github.githubassets.com/images/modules/site/social-cards/github-social.png",
    },
  },
  // A code block.
  {
    tag: "pre",
    children: [
      `const tph = new Telegraph({
  accessToken: ""
});

tph.getAccount();`,
    ],
  },
];
```

<small>Usage:</small>

```ts
tph.create({
  title: "Telegraph is cool!", // Required. 1 to 256 characters.
  content: "Telegraph is cool!", // Required. Upto 64KB.
  author_name: "Telegram", // Optional. 0 to 128 characters.
  author_url: "https://telegram.org", // Optional. 0 to 512 characters.
  return_content: true, // Optional. Defaults to `false`.
});
```

<small>Outputs:</small>

```json
{
  "path": "Telegraph-is-cool-12-24",
  "url": "https://telegra.ph/Telegraph-is-cool-12-24",
  "title": "Telegraph is cool!",
  "description": "",
  "author_name": "Telegram",
  "author_url": "https://telegram.org/",
  "content": ["Telegraph is cool!"],
  "views": 0,
  "can_edit": true
}
```

<h3 id="edit">Page > <a href="https://telegra.ph/api#editPage"><code>edit</code></a></h3>

Edits a Telegraph page (post), and on success, returns the edited page details.

See [Content Formatting](#content-formatting) to know more about the values can
be given to `content` parameter.

Read more: <https://telegra.ph/api#editPage>

<small>Usage:</small>

```ts
tph.edit("Telegraph-is-cool-12-24", {
  content: "Telegraph is simple!", // Required.
  title: "Telegraph is simple, but cool!", // Optional.
  author_name: "Telegram Team", // Optional.
  author_url: "https://telegram.org/", // Optional.
  return_content: false, // Optional.
});
```

<small>Outputs:</small>

```json
{
  "path": "Telegraph-is-cool-12-24",
  "url": "https://telegra.ph/Telegraph-is-cool-12-24",
  "title": "Telegraph is simple, but cool!",
  "description": "",
  "author_name": "Telegram Team",
  "author_url": "https://telegram.org/",
  "views": 0,
  "can_edit": true
}
```

<h3 id="get">Page > <a href="https://telegra.ph/api#getPage"><code>get</code></a></h3>

Returns the details of a Telegraph page (post).

Read more: <https://telegra.ph/api#getPage>

Parameters

- `path` (_`string`_): Path of the page.
- `returnContent` (_`boolean`_): Optional. If `true`, the page content will also
  be returned. Defaults to `false`.

<small>Usage:</small>

```ts
tph.get("Telegraph-is-cool-12-24");
```

<small>Outputs:</small>

```json
{
  "path": "Telegraph-is-cool-12-24",
  "url": "https://telegra.ph/Telegraph-is-cool-12-24",
  "title": "Telegraph is simple, but cool!",
  "description": "",
  "author_name": "Telegram Team",
  "author_url": "https://telegram.org/",
  "views": 0
}
```

<h3 id="getPages">Page > <a href="https://telegra.ph/api#getPageList"><code>getPages</code></a></h3>

Returns a list of pages belonging to the connected Telegraph account.

Read more: <https://telegra.ph/api#getPageList>

<small>Usage:</small>

```ts
tph.getPages(); // -> Gets all pages belonging to the connected account.
// Or, if you want some of them,
tph.getPages({
  offset: 1, // Optional. Sequential number of the first page to be returned
  limit: 2, // Optional. Number of pages to be returned.
});
// ^ This will return you the details of 2nd and 3rd last created pages.
```

<small>Outputs:</small>

```json
{
  "total_count": 14,
  "pages": [
    {
      "path": "GitHub-12-24-7",
      "url": "https://telegra.ph/GitHub-12-24-7",
      "title": "GitHub",
      "description": "GitHub is where over 73 million developers shape the future of software, together.\nconst tph = new T...",
      "author_name": "GitHub",
      "author_url": "https://github.com/",
      "views": 0,
      "can_edit": true
    },
    {
      "path": "Telegraph-is-cool-12-24",
      "url": "https://telegra.ph/Telegraph-is-cool-12-24",
      "title": "Telegraph is simple, but cool!",
      "description": "",
      "author_name": "Telegram Team",
      "author_url": "https://telegram.org/",
      "views": 0,
      "can_edit": true
    }
  ]
}
```

<h3 id="getPageViews">Page > <a href="https://telegra.ph/api#getViews"><code>getPageViews</code></a></h3>

Returns the number of views of the specified page. You can pass in some
**optional** date options to get the views of that time.

Read more: <https://telegra.ph/api#getViews>

<small>Usage:</small>

```ts
tph.getPageViews("Telegraph-is-cool-12-24"); // -> { views: 0 }
// Maybe only the views of the year 2021?
tph.getPageViews({
  year: 2021,
});
// Just views of 3PM of December 24th of year 2021.
tph.getPageViews({
  hour: 15, // Optional. 0 to 24.
  day: 24, // Required if `hour` is passed. 1 to 31.
  month: 12, // Required if `day` is passed. 1 to 12.
  year: 2021, // Required if `month` is passed. 2000 to 2100.
});
```

<small>Outputs:</small>

```json
{ "views": 0 }
```

---

## Upload

This is not a part of the official [Telegra.ph API](https://telegra.ph/api).
This function helps you to upload `.jpg`, `.jpeg`, `.png`, `.gif` and `.mp4`
files upto ~6MB (I think so) to [Telegra.ph](https://telegra.ph).

```ts
import { parseMarkdown, Telegraph } from "https://deno.land/x/telegraph/mod.ts";
// Local File
const localFile = await Telegraph.upload("video.mp4");
// From URL, you actually don't have to do this, you can pass this URL as src if you want to.
// But, it might become useful for temporary links.
const url = await Telegraph.upload(
  "https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_640_3MG.mp4",
);
// Or URL | Blob | Uint8Array | BufferSource?

// Use while creating a page.
const tph = new Telegraph({
  access_token: "<your access token>",
});

// What about markdown?
// https://telegra.ph/Jurassic-Deno-01-10
const content = parseMarkdown(
  "Jurassic Deno\n\n" +
    `![image](${await Telegraph.upload("jurassicDeno.jpg")})`,
)!;

await tph
  .create({
    title: "Jurassic Deno",
    content,
  })
  .then((page) => console.log(page.url));

// Or the same exact thing in Node.
// https://telegra.ph/Jurassic-Deno-12-25
await tph.create({
  title: "Jurassic Deno",
  content: [
    "Jurassic Deno:",
    {
      tag: "img",
      attrs: {
        src: await Telegraph.upload("jurassicDeno.jpg"),
      },
    },
  ],
});

// https://telegra.ph/Denoland-12-25
await tph.create({
  title: "Deno.land",
  content: [
    // Local file
    {
      tag: "img",
      attrs: {
        src: await Telegraph.upload("jurassicDeno.jpg"),
      },
    },
    // You actually don't have to do this.
    // You can just give that URL as value of src.
    {
      tag: "img",
      attrs: {
        src: await Telegraph.upload("https://deno.land/images/deno_logo.png"),
      },
    },
    {
      tag: "img",
      attrs: {
        src: await Telegraph.upload(
          "https://github.com/denolib/animated-deno-logo/raw/master/deno-rect-24fps.gif",
        ),
      },
    },
    "Example video:",
    {
      tag: "video",
      attrs: {
        src: await Telegraph.upload(
          "https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_640_3MG.mp4",
        ),
      },
    },
  ],
});
```

---

## Content Formatting

Content can be **Markdown**, **HTML**, or just **String** or **Array of
strings** or **[Node](https://telegra.ph/api#Node)** or an Array of both strings
and Nodes. To use HTML and Markdown you need to import two parser functions from
the module.

```ts
import { parseHtml, parseMarkdown } from "https://deno.land/x/telegraph/mod.ts";
```

Here are basic examples for each type. See the README of the official Repository
to find more of them.

```ts
const content = "With just a string";
const content = ["Array of strings.", " I am number one."];
```

**HTML**, `parseHtml(htmlContent)` will convert the HTML string to Node.

```ts
// Import the HTML parser.
import { parseHtml } from "https://deno.land/x/telegraph/mod.ts";
const content = parseHtml(`<h1>Pure HTML, boys</h1><br>
<p><b>Be bold</b></p>`);
```

**Markdown**, `parseMarkdown(mdContent)` will parse the Markdown down to Node
for the content.

```ts
// Import the markdown parser.
import { parseMarkdown } from "https://deno.land/x/telegraph/mod.ts";
const content = parseMarkdown(`## Heading 2\n\nThis is so **cool**!`);
```

**Node**, a bit complicated one to create (That's why MD and HTML methods
exists), if there is a lot of formatting and all. And you have to do this in

```ts
const content = [
  {
    tag: "a", // Specifies the tag.
    attrs: {
      href: "https://github.com", // Attributes supports `href` and `src`.
    },
    children: ["GitHub"], // Children can be another Node, parsed HTML, parsed MD, strings.
  },
  { tag: "br" },
  {
    tag: "p", // Paragraph
    children: [
      "GitHub is where over 73 million developers shape the future of software, together.",
    ],
  },
  {
    tag: "img", // Image
    attrs: { // Attributes supports `href` and `src`.
      src:
        "https://github.githubassets.com/images/modules/site/social-cards/github-social.png",
    },
  },
];
```

---

If you are having issues with this library, or if you like to suggest something
that can make this library better, please open a
[issue here](https://github.com/dcdunkan/telegraph/issues). Or if you'd like to
contribute, please open a pull request.

**[MIT License](./LICENSE). Copyright (c) 2022
[dcdunkan](https://github.com/dcdunkan)**.
