export type UnicodeDataRow = {
  codePoint: number;
  name: string;
};

export function parseUnicodeDataLine(line: string): UnicodeDataRow {
  const fields = line.trim().split(";");
  if (fields.length < 2) {
    throw new Error(`Invalid UnicodeData line: ${line}`);
  }

  const codePointText = fields[0]!;
  if (!/^([1-F]|10)?[0-9A-F]{4}$/.test(codePointText)) {
    throw new SyntaxError(`Invalid code point: ${codePointText}`);
  }
  const codePoint = parseInt(codePointText, 16);

  const name = fields[1]!;

  return { codePoint, name };
}
