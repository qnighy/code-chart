import { describe, expect, it } from "vitest";

import { parseUnicodeDataLine } from "./unicode-data";

describe("parseUnicodeDataLine", () => {
  it("parses a line: U+0000", () => {
    const result = parseUnicodeDataLine(
      "0000;<control>;Cc;0;BN;;;;;N;NULL;;;;",
    );
    expect(result).toEqual({ codePoint: 0x0000, name: "<control>" });
  });
});
