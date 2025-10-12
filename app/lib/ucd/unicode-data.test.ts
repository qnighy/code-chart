import { describe, expect, it } from "vitest";

import {
  parseUnicodeDataLine,
  parseUnicodeDataLines,
  type UnicodeDataRow,
  type UnicodeDataRowPair,
} from "./unicode-data";

describe("parseUnicodeDataLine", () => {
  it("parses a line: U+0000", () => {
    const result = parseUnicodeDataLine(
      "0000;<control>;Cc;0;BN;;;;;N;NULL;;;;\n",
    );
    expect(result).toEqual<UnicodeDataRow>({
      codePoint: 0x0000,
      name: "<control>",
      generalCategory: "Cc",
    });
  });
});

describe("parseUnicodeDataLines", () => {
  it("parses a line: U+0000", async () => {
    const result = await collectAsync(
      parseUnicodeDataLines(["0000;<control>;Cc;0;BN;;;;;N;NULL;;;;\n"]),
    );
    expect(result).toEqual<UnicodeDataRowPair[]>([
      {
        codePointStart: 0x0000,
        codePointEnd: 0x0000,
        name: "<control>",
        generalCategory: "Cc",
      },
    ]);
  });

  it("parses a range: U+4E00..U+9FFF", async () => {
    const result = await collectAsync(
      parseUnicodeDataLines([
        "4E00;<CJK Ideograph, First>;Lo;0;L;;;;;N;;;;;\n",
        "9FFF;<CJK Ideograph, Last>;Lo;0;L;;;;;N;;;;;\n",
      ]),
    );
    expect(result).toEqual([
      {
        codePointStart: 0x4e00,
        codePointEnd: 0x9fff,
        name: "<CJK Ideograph>",
        generalCategory: "Lo",
      },
    ]);
  });
});

async function collectAsync<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const result: T[] = [];
  for await (const item of iterable) {
    result.push(item);
  }
  return result;
}
