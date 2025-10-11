import path from "node:path";
import fs from "node:fs/promises";
import { extractUCD } from "./extract.ts";
import { ucdTmpPath } from "./path.ts";
import { parseUnicodeDataLine, type UnicodeDataRow } from "./unicode-data.ts";
import { linesFromBytes } from "../line-stream.ts";

export class UCD {
  #version: string;
  #path: string;
  #initialized = false;

  constructor(version: string) {
    this.#version = version;
    this.#path = path.join(ucdTmpPath, `UCD-${version}`);
  }

  get version(): string {
    return this.#version;
  }

  async init(): Promise<void> {
    await extractUCD(this.#version);
    this.#initialized = true;
  }

  #ensureInitialized(): void {
    if (!this.#initialized) {
      throw new TypeError("UCD not initialized. Call init() first.");
    }
  }

  async *unicodeData(): AsyncIterableIterator<UnicodeDataRow> {
    this.#ensureInitialized();
    const filePath = path.join(this.#path, "UnicodeData.txt");
    const fileHandle = await fs.open(filePath, "r");
    try {
      for await (const line of linesFromBytes(
        fileHandle.readableWebStream() as ReadableStream<BufferSource>,
      )) {
        yield parseUnicodeDataLine(line);
      }
    } finally {
      await fileHandle.close();
    }
  }
}

if (import.meta.main) {
  const ucd = new UCD("15.0.0");
  await ucd.init();
  for await (const row of ucd.unicodeData()) {
    console.log(row);
  }
}
