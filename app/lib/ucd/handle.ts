import path from "node:path";
import fs from "node:fs/promises";
import { extractUCD } from "./extract.ts";
import { ucdTmpPath } from "./path.ts";
import {
  parseUnicodeDataLines,
  type UnicodeDataRowPair,
} from "./unicode-data.ts";
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

  async *unicodeData(): AsyncIterableIterator<UnicodeDataRowPair> {
    this.#ensureInitialized();
    const filePath = path.join(this.#path, "UnicodeData.txt");
    const fileHandle = await fs.open(filePath, "r");
    try {
      for await (const rowPair of parseUnicodeDataLines(
        linesFromBytes(
          fileHandle.readableWebStream() as ReadableStream<BufferSource>,
        ),
      )) {
        yield rowPair;
      }
    } finally {
      await fileHandle.close();
    }
  }
}
