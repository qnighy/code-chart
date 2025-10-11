import path from "node:path";
import fs from "node:fs/promises";
import { UCD } from "./handle";
import { WritableChunks } from "./writable-chunks";
import { chunkIndexOf } from "./chunk";

const dirname = new URL(".", import.meta.url).pathname;

const outputPath = path.join(dirname, "../../data/ucd/chunks");

export async function generateUCDChunks() {
  const ucd = new UCD("16.0.0");
  await ucd.init();

  await fs.rm(outputPath, { recursive: true });

  const chunks = new WritableChunks(outputPath);

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
