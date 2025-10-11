export type UnicodeDataRow = {
  codePoint: number;
  name: string;
  generalCategory: GeneralCategoryShorthand;
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

  const generalCategory = fields[2]!;
  if (
    !GeneralCategoryShorthands.has(generalCategory as GeneralCategoryShorthand)
  ) {
    throw new SyntaxError(`Invalid General Category: ${generalCategory}`);
  }

  return {
    codePoint,
    name,
    generalCategory: generalCategory as GeneralCategoryShorthand,
  };
}

export type GeneralCategoryShorthand =
  | "Lu"
  | "Ll"
  | "Lt"
  | "Lm"
  | "Lo"
  | "Mn"
  | "Mc"
  | "Me"
  | "Nd"
  | "Nl"
  | "No"
  | "Pc"
  | "Pd"
  | "Ps"
  | "Pe"
  | "Pi"
  | "Pf"
  | "Po"
  | "Sm"
  | "Sc"
  | "Sk"
  | "So"
  | "Zs"
  | "Zl"
  | "Zp"
  | "Cc"
  | "Cf"
  | "Cs"
  | "Co"
  | "Cn";

const GeneralCategoryShorthands = new Set<GeneralCategoryShorthand>([
  "Lu",
  "Ll",
  "Lt",
  "Lm",
  "Lo",
  "Mn",
  "Mc",
  "Me",
  "Nd",
  "Nl",
  "No",
  "Pc",
  "Pd",
  "Ps",
  "Pe",
  "Pi",
  "Pf",
  "Po",
  "Sm",
  "Sc",
  "Sk",
  "So",
  "Zs",
  "Zl",
  "Zp",
  "Cc",
  "Cf",
  "Cs",
  "Co",
  "Cn",
]);
