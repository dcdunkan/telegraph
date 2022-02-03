/**
 * Helps to upload local files upto 5 or 6MB (I think) to Telegraph's file
 * uploading service and returns the URL of the uploaded file.
 *
 * Useful to add local images as a source for `<img>`.
 *
 * Supported file formats: `.jpg`, `.jpeg`, `.png`, `.gif` and `.mp4`.
 *
 * ```ts
 * const imgUrl = await Telegraph.upload("./assets/images/banner.png");
 * ```
 *
 * **This is not actually a part of the official Telegraph API**, at least, it
 * does not have any official documentation.
 *
 * @param src The local or remote file path or URL.
 * @returns Remote URL to the uploaded file.
 */
export async function upload(
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
