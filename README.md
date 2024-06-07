# Telegraph

[![JSR Version](https://jsr.io/badges/@dcdunkan/telegraph)](https://jsr.io/@dcdunkan/telegraph)
[![JSR Score](https://jsr.io/badges/@dcdunkan/telegraph/score)](https://jsr.io/@dcdunkan/telegraph/score)

Telegraph API wrapper with additional support for uploading media and
HTML/Markdown content formatting.

#### What is Telegraph?

> Telegra.ph is a minimalist publishing tool that allows you to create richly
> formatted posts and push them to the Web in just a click. Telegraph posts also
> get beautiful [Instant View](https://telegram.org/blog/instant-view) pages on
> [Telegram](https://telegram.org).
>
> _from official API documentation._

It is highly recommended to read the official documentation by Telegram Team.

- [Telegraph API Documentation](https://telegra.ph/api)
- [API Reference](https://jsr.io/@dcdunkan/telegraph/doc)

Import from the module:

```ts
import { Telegraph } from "jsr:@dcdunkan/telegraph";
```

## Example Usage

Here is a small demonstration of how you can create an account and create a page
using the Markdown format.

```ts
import { parse, Telegraph } from "jsr:@dcdunkan/telegraph";

const telegraph = new Telegraph(
  {
    token: "", // pass in a token if you have one
    apiRoot: "https://api.graph.org", // change the api root if you need to
  },
);

// If you don't already have an access token, create one!
const account = await telegraph.createAccount({ short_name: "John" });
// Assign the access token to the instance.
telegraph.token = account.access_token;

const content = `\
I created this page using and [Telegraph](https://github.com/dcdunkan/telegraph)
library. You can also create one with just a few lines of code.

See the [GitHub Repository](https://github.com/dcdunkan/telegraph) for more.`;

// Now that you have set a token, let's create a page.
const page = await telegraph.create({
  title: "My Telegraph Post",
  content: parse(content, "Markdown"),
});

console.log(page); // logs information about the page we just created.
```

Try other methods as well. The official documentation is also available in your
editor! Simply hover your mouse over the methods and properties to see their
documentation.

The default API root URL is **<https://api.telegra.ph>**. You can change it in
the options if you want to.

## Content Formatting

With Telegraph API, you can only create articles using the Node format, which is
relatively hard to use and work on compared to plain text formats. This library
provides helpers functions to deal with this. HTML and Markdown are supported
out-of-the-box using the `parse` method.

```ts
import { parse } from "jsr:@dcdunkan/telegraph";

const markdown = parse(`**Something in Markdown**`, "Markdown");
const html = parse(`<h1>Some heading in HTML</h1>`, "HTML");
```

> [!NOTE]
>
> - Markdown parsing uses the default configuration of
>   [marked](https://github.com/markedjs/marked).
> - HTML is using [deno-dom](https://github.com/b-fuze/deno-dom)
>
> Markdown is first transformed to HTML and parsed to Node format.

The returned array of `Node` the `parse` function can then be used to create
content.

#### "Can I use other Markdown specifications?"

Yes, you can. Default configuration of **[marked](https://npm.im/marked)** is
used for the markdown parsing. If you wish to use some other, you can just parse
it to HTML first and then `parse` with HTML as parse mode.

(uses <https://jsr.io/@deno/gfm> as an example:)

```ts
import { parse } from "jsr:@dcdunkan/telegraph";
import { render } from "jsr:@deno/gfm";

const html = render("Some GFM markdown");
const content = parse(html); // tada :D
// use `content` for creating pages.
```

## Upload Media Files

There is an undocumented API endpoint for uploading media files to Telegraph
servers. A helper function for uploading local media files to this endpoint is
also included in this library.

> **Note**: As far as I know, this API only allows you to upload a limited set
> of media types: gif, png, png, mp4, jpg, and jpeg of limited size, around 6
> MB. **Do not ask questions regarding these, as I do not know anything more**.

```ts
import { upload } from "jsr:@dcdunkan/telegraph";

const file = await Deno.readFile("./image.png");
await upload(file); // returns url of the uploaded file

// The following also works:
await upload("https://some.temporary-link-servi.ce/1234.gif");
await upload(new URL("..."));
await upload({ url: "...", otherProps: {} });

const response = await fetch("file:///home/user/file.png");
await upload(response); // Response
await upload(await response.blob()); // Blob
await upload(await response.bytes()); // Uint8Array

const file = await Deno.open("./video.gif");
await upload(file.readable); // ReadableStream<Uint8Array>
await upload(file.readable[Symbol.asyncIterator]()); // AsyncIterable<Uint8Array>, also sync ones!
```

API URL can also be changed for uploading files:

```ts
await upload(data, "https://graph.org/upload");
```

It defaults to <https://telegra.ph/upload>.

> **Just don't misuse the free service.**

#### "Why can't I just pass in the local filepath?"

For the ease of shipping for multiple runtimes. You can always have local files
uploaded by opening them by yourselves and passing the stream/content to the
upload helper. You can even `fetch` using `file:///` protocol and pass the
response to get the file uploaded.

---

If you are having issues with the library, you can report it by
[opening an issue](https://github.com/dcdunkan/telegraph/issues).

[Licensed under MIT](./LICENSE)
