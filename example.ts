// Port of "Sample Requests" on https://telegra.ph/api.
import { Telegraph } from "./mod.ts";

// Token included in the sample request sections of https://telegra.ph/api.
// deno-lint-ignore no-unused-vars
const SANDBOX_TOKEN =
  "d3b25feccb89e508a9114afb82aa421fe2a9712b963b387cc5ad71e58722";

const t = new Telegraph(
  // { token: SANDBOX_TOKEN },
  // telegra.ph is blocked by ISP for some reason.
  // { apiRoot: "https://api.graph.org" },
);

// I don't want to create an account each time I'm testing and waste their
// server resources. So, IF!
if (!t.token) {
  const account = await t.createAccount({
    short_name: "Sandbox",
    author_name: "Anonymous",
  });
  t.token = account.access_token;
}

const account = await t.getAccount();
console.log({ account });

const editedAccount = await t.editAccount({
  short_name: "Sandbox",
  author_name: "Anonymous",
  author_url: "https://telegra.ph",
});
console.log({ editedAccount });

const token = await t.revokeToken();
console.log({ token });

const createdPage = await t.create({
  title: "Sample Page",
  content: [{ tag: "p", children: ["Hello, world!"] }],
  author_name: "Anonymous",
  return_content: true,
});
console.log({ createdPage });

const page = await t.get(createdPage.path);
console.log({ page });

const edited = await t.edit(page.path, {
  title: page.title,
  content: page.content,
  author_name: "Anonymous",
});
console.log({ edited });

const views = await t.getViews(
  "Sample-Page-12-15",
  { year: 2016, month: 12 },
);
console.log({ views });

const pages = await t.getPages({ limit: 3 });
console.log({ pages });
