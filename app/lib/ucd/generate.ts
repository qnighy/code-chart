import path from "node:path";
import fs from "node:fs/promises";

import { codePointHex } from "../unicode";
import { UCD } from "./handle";
import { WritableChunks } from "./writable-chunks";
import { CHUNK_SIZE, chunkIndexOf, getCharacterInChunkOrCreate } from "./chunk";
import {
  CLOSE_PUNCTUATION,
  CONNECTOR_PUNCTUATION,
  CONTROL,
  CURRENCY_SYMBOL,
  DASH_PUNCTUATION,
  DECIMAL_NUMBER,
  ENCLOSING_MARK,
  FINAL_PUNCTUATION,
  FORMAT,
  INITIAL_PUNCTUATION,
  LETTER_NUMBER,
  LINE_SEPARATOR,
  LOWERCASE_LETTER,
  MATH_SYMBOL,
  MODIFIER_LETTER,
  MODIFIER_SYMBOL,
  NAME_DERIVATION_CJK_COMPATIBILITY_IDEOGRAPH,
  NAME_DERIVATION_CJK_UNIFIED_IDEOGRAPH,
  NAME_DERIVATION_CONTROL,
  NAME_DERIVATION_EGYPTIAN_HIEROGLYPH,
  NAME_DERIVATION_HANGUL_SYLLABLE,
  NAME_DERIVATION_KHITAN_SMALL_SCRIPT_CHARACTER,
  NAME_DERIVATION_NONCHARACTER,
  NAME_DERIVATION_NUSHU_CHARACTER,
  NAME_DERIVATION_PRIVATE_USE,
  NAME_DERIVATION_SURROGATE,
  NAME_DERIVATION_TANGUT_IDEOGRAPH,
  NAME_DERIVATION_UNSPECIFIED,
  NONSPACING_MARK,
  OPEN_PUNCTUATION,
  OTHER_LETTER,
  OTHER_NUMBER,
  OTHER_PUNCTUATION,
  OTHER_SYMBOL,
  PARAGRAPH_SEPARATOR,
  PRIVATE_USE,
  SPACE_SEPARATOR,
  SPACING_MARK,
  SURROGATE,
  TITLECASE_LETTER,
  UNASSIGNED,
  UPPERCASE_LETTER,
  type CharacterData,
  type NameDerivation,
} from "./proto/character_data_pb";
import {
  decodeSkipInfo,
  type ChunkData,
  type SkipInfo,
} from "./proto/chunk_pb";
import type { GeneralCategoryReq } from "./character-data";

const dirname = new URL(".", import.meta.url).pathname;

const outputPath = path.join(dirname, "../../../public/data/ucd/chunks");

export async function generateUCDChunks() {
  const ucd = new UCD("17.0.0");
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
  // Initialize all chunks first
  for (let i = 0; i < numChunks; i++) {
    const chunk = await chunks.openChunk(i);
    chunk.data.chunkIndex = i;
    chunk.dirty = true;
    chunk.dispose();
  }

  for await (const row of ucd.unicodeData()) {
    for (
      let codePoint = row.codePointStart;
      codePoint <= row.codePointEnd;
      codePoint++
    ) {
      const chunk = await chunks.openChunk(chunkIndexOf(codePoint));
      try {
        const nameDerivation = inferNameDerivation(codePoint, row.name);
        chunk.data.characters ??= [];
        chunk.data.characters.push({
          codePoint,
          name: nameDerivation === NAME_DERIVATION_UNSPECIFIED ? row.name : "",
          nameDerivation,
          generalCategory: row.generalCategory,
        });
        chunk.dirty = true;
      } finally {
        chunk.dispose();
      }
    }
  }

  // Noncharacters; they are not listed in UnicodeData.txt
  for (const codePoint of nonCharacters()) {
    const chunk = await chunks.openChunk(chunkIndexOf(codePoint));
    try {
      const charData = getCharacterInChunkOrCreate(chunk.data, codePoint);
      charData.nameDerivation = NAME_DERIVATION_NONCHARACTER;
      charData.generalCategory = UNASSIGNED;
      chunk.dirty = true;
    } finally {
      chunk.dispose();
    }
  }

  // Forward seeking for backwardSkips
  {
    let skipInfo: SkipInfo = decodeSkipInfo(new Uint8Array());
    for (let chunkIndex = 0; chunkIndex < numChunks; chunkIndex++) {
      const chunk = await chunks.openChunk(chunkIndex);
      try {
        chunk.data.backwardSkips = skipInfo;
        chunk.dirty = true;

        skipInfo = incrementedSkipInfo(skipInfo);
        for (const charData of chunk.data.characters) {
          updateSkipInfoForCharacter(skipInfo, charData);
        }
        updateSkipInfoForReserved(skipInfo, chunk.data);
      } finally {
        chunk.dispose();
      }
    }

    // Backward seeking for forwardSkips
    {
      let skipInfo: SkipInfo = decodeSkipInfo(new Uint8Array());
      for (let chunkIndex = numChunks - 1; chunkIndex >= 0; chunkIndex--) {
        const chunk = await chunks.openChunk(chunkIndex);
        try {
          chunk.data.forwardSkips = skipInfo;
          chunk.dirty = true;

          skipInfo = incrementedSkipInfo(skipInfo);
          for (const charData of chunk.data.characters) {
            updateSkipInfoForCharacter(skipInfo, charData);
          }
          updateSkipInfoForReserved(skipInfo, chunk.data);
        } finally {
          chunk.dispose();
        }
      }
    }
  }

  await chunks.disposeAsync();
}

// §23.7 Noncharacters
// https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-23/#G12612
function* nonCharacters(): IterableIterator<number> {
  for (let cp = 0xfdd0; cp <= 0xfdef; cp++) {
    yield cp;
  }
  for (let plane = 0; plane <= 0x10; plane++) {
    const base = plane << 16;
    yield base | 0xfffe;
    yield base | 0xffff;
  }
}

const NameDerivationLabelMap: Record<string, NameDerivation> = {
  // 0000..001F, 007F..009F
  "<control>": NAME_DERIVATION_CONTROL,
  // 3400..4DBF
  "<CJK Ideograph Extension A>": NAME_DERIVATION_CJK_UNIFIED_IDEOGRAPH,
  // 4E00..9FFF
  "<CJK Ideograph>": NAME_DERIVATION_CJK_UNIFIED_IDEOGRAPH,
  // AC00..D7A3
  "<Hangul Syllable>": NAME_DERIVATION_HANGUL_SYLLABLE,
  // D800..DB7F
  "<Non Private Use High Surrogate>": NAME_DERIVATION_SURROGATE,
  // DB80..DBFF
  "<Private Use High Surrogate>": NAME_DERIVATION_SURROGATE,
  // DC00..DFFF
  "<Low Surrogate>": NAME_DERIVATION_SURROGATE,
  // E000..F8FF
  "<Private Use>": NAME_DERIVATION_PRIVATE_USE,
  // 17000..187FF
  "<Tangut Ideograph>": NAME_DERIVATION_TANGUT_IDEOGRAPH,
  // 18D00..18D1E
  "<Tangut Ideograph Supplement>": NAME_DERIVATION_TANGUT_IDEOGRAPH,
  // 20000..2A6DF
  "<CJK Ideograph Extension B>": NAME_DERIVATION_CJK_UNIFIED_IDEOGRAPH,
  // 2A700..2B73F
  "<CJK Ideograph Extension C>": NAME_DERIVATION_CJK_UNIFIED_IDEOGRAPH,
  // 2B740..2B81D
  "<CJK Ideograph Extension D>": NAME_DERIVATION_CJK_UNIFIED_IDEOGRAPH,
  // 2B820..2CEAD
  "<CJK Ideograph Extension E>": NAME_DERIVATION_CJK_UNIFIED_IDEOGRAPH,
  // 2CEB0..2EBE0
  "<CJK Ideograph Extension F>": NAME_DERIVATION_CJK_UNIFIED_IDEOGRAPH,
  // 2EBF0..2EE5D
  "<CJK Ideograph Extension I>": NAME_DERIVATION_CJK_UNIFIED_IDEOGRAPH,
  // 30000..3134A
  "<CJK Ideograph Extension G>": NAME_DERIVATION_CJK_UNIFIED_IDEOGRAPH,
  // 31350..323AF
  "<CJK Ideograph Extension H>": NAME_DERIVATION_CJK_UNIFIED_IDEOGRAPH,
  // 323B0..33479
  "<CJK Ideograph Extension J>": NAME_DERIVATION_CJK_UNIFIED_IDEOGRAPH,
  // F0000..FFFFD
  "<Plane 15 Private Use>": NAME_DERIVATION_PRIVATE_USE,
  // 100000..10FFFD
  "<Plane 16 Private Use>": NAME_DERIVATION_PRIVATE_USE,
};

const IdeographBaseNameMap: Record<string, NameDerivation> = {
  "CJK UNIFIED IDEOGRAPH": NAME_DERIVATION_CJK_UNIFIED_IDEOGRAPH,
  "CJK COMPATIBILITY IDEOGRAPH": NAME_DERIVATION_CJK_COMPATIBILITY_IDEOGRAPH,
  "EGYPTIAN HIEROGLYPH": NAME_DERIVATION_EGYPTIAN_HIEROGLYPH,
  "TANGUT IDEOGRAPH": NAME_DERIVATION_TANGUT_IDEOGRAPH,
  "KHITAN SMALL SCRIPT CHARACTER":
    NAME_DERIVATION_KHITAN_SMALL_SCRIPT_CHARACTER,
  "NUSHU CHARACTER": NAME_DERIVATION_NUSHU_CHARACTER,
};

function inferNameDerivation(
  codePoint: number,
  declaredName: string,
): NameDerivation {
  if (Object.hasOwn(NameDerivationLabelMap, declaredName)) {
    return NameDerivationLabelMap[declaredName];
  }
  if (declaredName.startsWith("<")) {
    throw new SyntaxError(`Unrecognized special name: ${declaredName}`);
  }

  const cpSuffix = `-${codePointHex(codePoint)}`;
  if (declaredName.endsWith(cpSuffix)) {
    const baseName = declaredName.slice(0, -cpSuffix.length);
    if (Object.hasOwn(IdeographBaseNameMap, baseName)) {
      return IdeographBaseNameMap[baseName];
    }
  }

  return NAME_DERIVATION_UNSPECIFIED;
}

const skipKeys: Array<keyof SkipInfo> = [
  "generalCategoryUppercaseLetter",
  "generalCategoryLowercaseLetter",
  "generalCategoryTitlecaseLetter",
  "generalCategoryModifierLetter",
  "generalCategoryOtherLetter",
  "generalCategoryNonspacingMark",
  "generalCategorySpacingMark",
  "generalCategoryEnclosingMark",
  "generalCategoryDecimalNumber",
  "generalCategoryLetterNumber",
  "generalCategoryOtherNumber",
  "generalCategoryConnectorPunctuation",
  "generalCategoryDashPunctuation",
  "generalCategoryOpenPunctuation",
  "generalCategoryClosePunctuation",
  "generalCategoryInitialPunctuation",
  "generalCategoryFinalPunctuation",
  "generalCategoryOtherPunctuation",
  "generalCategoryMathSymbol",
  "generalCategoryCurrencySymbol",
  "generalCategoryModifierSymbol",
  "generalCategoryOtherSymbol",
  "generalCategorySpaceSeparator",
  "generalCategoryLineSeparator",
  "generalCategoryParagraphSeparator",
  "generalCategoryControl",
  "generalCategoryFormat",
  "generalCategoryPrivateUse",
  "generalCategorySurrogate",
  "generalCategoryUnassigned",
];

const gcSkipKeys: Record<GeneralCategoryReq, keyof SkipInfo> = {
  [UPPERCASE_LETTER]: "generalCategoryUppercaseLetter",
  [LOWERCASE_LETTER]: "generalCategoryLowercaseLetter",
  [TITLECASE_LETTER]: "generalCategoryTitlecaseLetter",
  [MODIFIER_LETTER]: "generalCategoryModifierLetter",
  [OTHER_LETTER]: "generalCategoryOtherLetter",
  [NONSPACING_MARK]: "generalCategoryNonspacingMark",
  [SPACING_MARK]: "generalCategorySpacingMark",
  [ENCLOSING_MARK]: "generalCategoryEnclosingMark",
  [DECIMAL_NUMBER]: "generalCategoryDecimalNumber",
  [LETTER_NUMBER]: "generalCategoryLetterNumber",
  [OTHER_NUMBER]: "generalCategoryOtherNumber",
  [CONNECTOR_PUNCTUATION]: "generalCategoryConnectorPunctuation",
  [DASH_PUNCTUATION]: "generalCategoryDashPunctuation",
  [OPEN_PUNCTUATION]: "generalCategoryOpenPunctuation",
  [CLOSE_PUNCTUATION]: "generalCategoryClosePunctuation",
  [INITIAL_PUNCTUATION]: "generalCategoryInitialPunctuation",
  [FINAL_PUNCTUATION]: "generalCategoryFinalPunctuation",
  [OTHER_PUNCTUATION]: "generalCategoryOtherPunctuation",
  [MATH_SYMBOL]: "generalCategoryMathSymbol",
  [CURRENCY_SYMBOL]: "generalCategoryCurrencySymbol",
  [MODIFIER_SYMBOL]: "generalCategoryModifierSymbol",
  [OTHER_SYMBOL]: "generalCategoryOtherSymbol",
  [SPACE_SEPARATOR]: "generalCategorySpaceSeparator",
  [LINE_SEPARATOR]: "generalCategoryLineSeparator",
  [PARAGRAPH_SEPARATOR]: "generalCategoryParagraphSeparator",
  [CONTROL]: "generalCategoryControl",
  [FORMAT]: "generalCategoryFormat",
  [PRIVATE_USE]: "generalCategoryPrivateUse",
  [SURROGATE]: "generalCategorySurrogate",
  [UNASSIGNED]: "generalCategoryUnassigned",
} as const;

function incrementedSkipInfo(skipInfo: SkipInfo): SkipInfo {
  const newSkipInfo: SkipInfo = { ...skipInfo };
  for (const key of skipKeys) {
    newSkipInfo[key] += 1;
  }
  return newSkipInfo;
}

function updateSkipInfoForCharacter(
  skipInfo: SkipInfo,
  characterData: CharacterData,
): void {
  const gcKey = gcSkipKeys[characterData.generalCategory as GeneralCategoryReq];
  skipInfo[gcKey] = 0;
}

function updateSkipInfoForReserved(
  skipInfo: SkipInfo,
  chunkData: ChunkData,
): void {
  if (chunkData.characters.length === CHUNK_SIZE) {
    // No reserved code points in this chunk
    return;
  }
  skipInfo.generalCategoryUnassigned = 0;
}

if (import.meta.main) {
  await generateUCDChunks();
}
