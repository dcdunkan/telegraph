const API_URL = "https://telegra.ph/upload";

interface URLLike {
  url: string;
}

async function fetchFile(url: string | URL): Promise<Blob> {
  const response = await fetch(url);
  if (response.body == null) {
    throw new Error(`Download failed, no response body from '${url}'`);
  }
  return response.blob();
}

/** Types of file sources supported by {@link upload} */
export type FileSource =
  | string
  | Blob
  | Response
  | URL
  | URLLike
  | Uint8Array
  | ReadableStream<Uint8Array>
  | Iterable<Uint8Array>
  | AsyncIterable<Uint8Array>;

async function toBlob(file: FileSource): Promise<Blob> {
  if (typeof file === "string") {
    if (!URL.canParse(file)) throw new Error("Expected URL as file source");
    if (!file.startsWith("http:") && !file.startsWith("https:")) {
      throw new Error("URL protocol must be HTTP/HTTPS");
    }
    return await fetchFile(file);
  }
  if (file instanceof Blob) return file;
  if (file instanceof Response) {
    if (file.body != null) return file.blob();
    throw new Error("No response body!");
  }
  if (file instanceof URL) return await fetchFile(file);
  if ("url" in file) return await fetchFile(file.url);
  if (file instanceof Uint8Array) return new Blob([file]);
  const stream = file instanceof ReadableStream
    ? file
    : ReadableStream.from(file);
  return new Response(stream).blob();
}

/**
 * Helper function for uploading image or video files to Telegraph
 * servers. Supports files upto 5 or 6 MB (Undocumented).
 *
 * @param file File to upload. If a string is given, considers it as an HTTPS
 * URL. Otherwise takes any type of raw content of type {@link FileSource}.
 * @param apiUrl API url to use. Defaults to https://telegra.ph/upload.
 *
 * @returns URL of the uploaded file.
 */
export async function upload(
  file: FileSource,
  apiUrl = API_URL,
): Promise<string> {
  const { origin } = new URL(apiUrl);
  const body = new FormData();
  const blob = await toBlob(file);
  body.append("photo", new File([blob], "blob"));
  const response = await fetch(apiUrl, {
    method: "POST",
    body,
    headers: { "Access-Control-Allow-Origin": origin },
  });
  if (!response.ok) {
    throw new Error(`File upload failed: ${response.statusText}`);
  }
  const result = await response.json();
  if (
    ("error" in result && result.error != null) || result[0] == null ||
    !("src" in result[0]) || typeof result[0].src !== "string"
  ) {
    throw new Error(`File upload failed: ${result.error}`);
  }
  return `${origin}${result[0].src}`;
}
