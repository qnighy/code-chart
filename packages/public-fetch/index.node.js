// @ts-check

import fs from "node:fs/promises";
import path from "node:path";

/**
 * @param {string} url
 * @returns {Promise<Response>}
 */
export async function publicFetch(url) {
  if (typeof url !== "string") {
    throw new TypeError("Only string URLs are supported.");
  }
  if (!url.startsWith("/")) {
    throw new TypeError("Only relative URLs are supported.");
  }

  const publicPath = path.join(path.resolve("./public"), `.${url}`);

  /** @type {Buffer<ArrayBuffer>} */
  let buf;
  try {
    buf = /** @type {Buffer<ArrayBuffer>} */ (await fs.readFile(publicPath));
  } catch (error) {
    if (
      !(error instanceof Error) ||
      /** @type {NodeJS.ErrnoException} */ (error).code !== "ENOENT"
    ) {
      throw error;
    }
    return new Response("Not Found", { status: 404 });
  }

  return new Response(buf, { status: 200 });
}
