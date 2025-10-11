import path from "node:path";
import fs from "node:fs/promises";
import { UCD } from "./handle";
import { WritableChunks } from "./writable-chunks";
import { CHUNK_SIZE, chunkIndexOf } from "./chunk";

const dirname = new URL(".", import.meta.url).pathname;

const outputPath = path.join(dirname, "../../../public/data/ucd/chunks");

export async function generateUCDChunks() {
  const ucd = new UCD("16.0.0");
  await ucd.init();

  try {
    await fs.rm(outputPath, { recursive: true });
  } catch (error) {
    if (
      !(error instanceof Error) ||
      (error as NodeJS.ErrnoException).code !== "ENOENT"
    ) {
      throw error;
    }
  }
  await fs.mkdir(outputPath, { recursive: true });

  const chunks = new WritableChunks(outputPath);

  const numChunks = 0x110000 / CHUNK_SIZE;
  for (let i = 0; i < numChunks; i++) {
    const chunk = await chunks.openChunk(i);
    chunk.data.chunkIndex = i;
    chunk.data.characters = [];
    chunk.dirty = true;
    chunk.dispose();
  }

  for await (const row of ucd.unicodeData()) {
    const chunk = await chunks.openChunk(chunkIndexOf(row.codePoint));
    try {
      chunk.data.characters ??= [];
      chunk.data.characters.push({
        codePoint: row.codePoint,
        name: row.name,
      });
      chunk.dirty = true;
    } finally {
      chunk.dispose();
    }
  }

  await chunks.disposeAsync();
}

if (import.meta.main) {
  await generateUCDChunks();
}
