## Telegraph [![denoland/x module](https://shield.deno.dev/x/telegraph)](https://deno.land/x/telegraph)

Simple Telegraph API wrapper for Deno with additional support for
uploading media and HTML/Markdown content formatting.

#### What is Telegraph?

Telegra.ph is a minimalist publishing tool that allows you to create richly
formatted posts and push them to the Web in just a click. Telegraph posts also
get beautiful [Instant View](https://telegram.org/blog/instant-view) pages on
[Telegram](https://telegram.org).

_(from https://telegra.ph/api)_

It is highly recommended to read the official documentation by Telegram Team.

- [Telegraph API Documentation](https://telegra.ph/api) ([mirror](https://graph.org/api))
- [API Reference](https://deno.land/x/telegraph/mod.ts)

Import from the module:

```ts
import { Telegraph } from "https://deno.land/x/telegraph/mod.ts";
```

### Example Usage

Here is a small demonstration of how you can create an account and
create a page using the Markdown format.

```ts
import { Telegraph, parse } from "https://deno.land/x/telegraph/mod.ts";

const telegraph = new Telegraph(
  "", // pass an access token if you already have one
  { apiRoot: "https://graph.org" }, // change the options if you need to
);

// If you don't already have an access token, see the documentation of
// createAccount method. Or, why don't you do it with your code?
const account = await telegraph.createAccount({ short_name: "John" });

console.log(account); // it has the access_token (keep it private)

// Let's use the access_token:
telegraph.token = account.token;

const content = `
I created this page using **Deno** and [Telegraph](https://deno.land/x/telegraph)
library. You can also create one with just few lines of code.

See the [GitHub Repository](https://github.com/dcdunkan/telegraph) for more.
`

// Now that you have set a token, let's create a page.
const page = await telegraph.create({
  title: "Create a Telegraph article using Deno",
  content: parse(content, "Markdown"),
});

console.log(page); // logs information about the page we just created.
```

Try other methods as well. The official documentation is also available in your
editor; hover your mouse over the methods and properties to see them.

### Content Formatting

You can only create articles using the Node format, which can be hard to use.
So, this library provides support for HTML and Markdown (uses default [marked](https://www.npmjs.com/package/marked) settings).

```ts
import { parse } from "https://deno.land/x/telegraph/mod.ts";

parse(`**Something in Markdown**`, "Markdown");
parse(`<h1>Some heading in HTML</h1>`, "HTML");
```

The array of Nodes the `parse` function can then be used to create content.

##### "Can I use GFM (GitHub Flavored Markdown)?"

Default configuration of [marked](https://npm.im/marked) is used for the markdown parsing.
If you wish to use some other, such as GFM, you can just parse it to HTML first and then `parse`.

(uses https://deno.land/x/gfm as an example:)

```ts
import { parse } from "https://deno.land/x/telegraph/mod.ts";
import { render } from "https://deno.land/x/gfm/mod.ts";

const html = render("Some GFM markdown");

parse(html); // tada :D
```

### Upload Media Files

There is an undocumented API endpoint for uploading media files to Telegraph servers.
A function for uploading local media files to this endpoint is exported from this library.

> Note: As far as I know, this API only allows you to upload a limited set of
> media types: gif, png, png, mp4, jpg, and jpeg of limited size, around 6 MB.

```ts
import { upload } from "https://deno.land/x/telegraph/mod.ts";

upload("./downloads/image.png");
upload(new URL("file:///home/kek.png"));
upload("https://some.temporary-link-servi.ce/1234.gif");

const file = await Deno.open("./video.mp4");
upload(file);

const content = await Deno.readFile("./photo.jpg");
upload(content);
```

API root can also be changed for this service:

```ts
upload("file.ext", "https://graph.org");
```

Just don't misuse the free service.

---

If you are having issues with the library, report it by [opening an issue](https://github.com/dcdunkan/telegraph/issues).

Licensed under MIT
