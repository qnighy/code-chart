import path from "node:path";
import fs from "node:fs/promises";
import { UCD } from "./handle";
import { WritableChunks } from "./writable-chunks";
import { CHUNK_SIZE, chunkIndexOf } from "./chunk";
import type { GeneralCategoryShorthand } from "./unicode-data";
import type { GeneralCategoryCore } from "./character-data";

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
        generalCategory: generalCategoryMap[row.generalCategory],
      });
      chunk.dirty = true;
    } finally {
      chunk.dispose();
    }
  }

  await chunks.disposeAsync();
}

const generalCategoryMap: Record<
  GeneralCategoryShorthand,
  GeneralCategoryCore
> = {
  Lu: "UPPERCASE_LETTER",
  Ll: "LOWERCASE_LETTER",
  Lt: "TITLECASE_LETTER",
  Lm: "MODIFIER_LETTER",
  Lo: "OTHER_LETTER",
  Mn: "NONSPACING_MARK",
  Mc: "SPACING_MARK",
  Me: "ENCLOSING_MARK",
  Nd: "DECIMAL_NUMBER",
  Nl: "LETTER_NUMBER",
  No: "OTHER_NUMBER",
  Pc: "CONNECTOR_PUNCTUATION",
  Pd: "DASH_PUNCTUATION",
  Ps: "OPEN_PUNCTUATION",
  Pe: "CLOSE_PUNCTUATION",
  Pi: "INITIAL_PUNCTUATION",
  Pf: "FINAL_PUNCTUATION",
  Po: "OTHER_PUNCTUATION",
  Sm: "MATH_SYMBOL",
  Sc: "CURRENCY_SYMBOL",
  Sk: "MODIFIER_SYMBOL",
  So: "OTHER_SYMBOL",
  Zs: "SPACE_SEPARATOR",
  Zl: "LINE_SEPARATOR",
  Zp: "PARAGRAPH_SEPARATOR",
  Cc: "CONTROL",
  Cf: "FORMAT",
  Cs: "SURROGATE",
  Co: "PRIVATE_USE",
  Cn: "UNASSIGNED",
};

if (import.meta.main) {
  await generateUCDChunks();
}
