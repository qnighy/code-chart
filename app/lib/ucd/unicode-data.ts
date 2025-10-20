import {
  generalCategoryFromShorthand,
  type GeneralCategoryReq,
} from "./character-data";

export type UnicodeDataRowPair = {
  codePointStart: number;
  codePointEnd: number;
  name: string;
  generalCategory: GeneralCategoryReq;
};

export async function* parseUnicodeDataLines(
  lines: AsyncIterable<string> | Iterable<string>,
): AsyncIterableIterator<UnicodeDataRowPair> {
  let lastRow: UnicodeDataRow | null = null;
  for await (const line of lines) {
    const row = parseUnicodeDataLine(line);
    if (row.name.endsWith(", First>")) {
      if (lastRow != null) {
        throw new SyntaxError("Unclosed range in UnicodeData.txt");
      }
      lastRow = row;
    } else if (row.name.endsWith(", Last>")) {
      if (lastRow == null) {
        throw new SyntaxError("Unexpected range end in UnicodeData.txt");
      }
      if (lastRow.codePoint >= row.codePoint) {
        throw new SyntaxError("Invalid range in UnicodeData.txt");
      }
      const name0 = lastRow.name.replace(", First>", ">");
      const name1 = row.name.replace(", Last>", ">");
      if (
        !(name0 === name1 && lastRow.generalCategory === row.generalCategory)
      ) {
        throw new SyntaxError("Range property mismatch in UnicodeData.txt");
      }
      yield {
        codePointStart: lastRow.codePoint,
        codePointEnd: row.codePoint,
        name: name0,
        generalCategory: lastRow.generalCategory,
      };
      lastRow = null;
    } else {
      if (lastRow != null) {
        throw new SyntaxError("Unclosed range in UnicodeData.txt");
      }
      yield {
        codePointStart: row.codePoint,
        codePointEnd: row.codePoint,
        name: row.name,
        generalCategory: row.generalCategory,
      };
    }
  }
}

export type UnicodeDataRow = {
  codePoint: number;
  name: string;
  generalCategory: GeneralCategoryReq;
};

export function parseUnicodeDataLine(line: string): UnicodeDataRow {
  const fields = line.trim().split(";");
  if (fields.length < 3) {
    throw new Error(`Invalid UnicodeData line: ${line}`);
  }

  const codePointText = fields[0]!;
  if (!/^([1-F]|10)?[0-9A-F]{4}$/.test(codePointText)) {
    throw new SyntaxError(`Invalid code point: ${codePointText}`);
  }
  const codePoint = parseInt(codePointText, 16);

  const name = fields[1]!;

  const generalCategoryShorthand = fields[2]!;
  const generalCategory = generalCategoryFromShorthand(
    generalCategoryShorthand,
  );
  if (!generalCategory) {
    throw new SyntaxError(
      `Invalid General Category: ${generalCategoryShorthand}`,
    );
  }

  return {
    codePoint,
    name,
    generalCategory,
  };
}
