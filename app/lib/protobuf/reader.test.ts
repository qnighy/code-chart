import { describe, expect, it } from "vitest";
import { ProtoReader, type ProtoField } from "./reader";

function readProto(input: Uint8Array): ProtoField[] {
  return [...new ProtoReader(input)];
}

function b(text: string): Uint8Array {
  return Uint8Array.from([...text].map((c) => c.charCodeAt(0)));
}

describe("ProtoReader", () => {
  it("reads empty message", () => {
    const input = b("");
    expect(readProto(input)).toEqual([]);
  });

  it("reads multiple fields", () => {
    const input = b("\x08\x96\x01\x10\xac\x02");
    expect(readProto(input)).toEqual([
      { number: 1, type: "Varint", value: 150 },
      { number: 2, type: "Varint", value: 300 },
    ]);
  });

  it("reads a single varint field", () => {
    const input = b("\x08\x96\x01");
    expect(readProto(input)).toEqual([
      { number: 1, type: "Varint", value: 150 },
    ]);
  });

  it("reads a varint field with 32-bit value", () => {
    const input = b("\x08\xff\xff\xff\xff\x0f");
    expect(readProto(input)).toEqual([
      { number: 1, type: "Varint", value: 4294967295 },
    ]);
  });

  it("reads a varint field with 64-bit value", () => {
    const input = b("\x08\xff\xff\xff\xff\xff\xff\xff\xff\xff\x01");
    expect(readProto(input)).toEqual([
      { number: 1, type: "Varint", value: 18446744073709551615n },
    ]);
  });

  it("reads a single length-delimited field", () => {
    const input = b("\x0a\x03foo");
    expect(readProto(input)).toEqual([
      { number: 1, type: "Len", value: b("foo") },
    ]);
  });

  it("reads a single group field", () => {
    const input = b("\x0b\x08\x96\x01\x10\xac\x02\x0c");
    expect(readProto(input)).toEqual([
      {
        number: 1,
        type: "Group",
        value: [
          { number: 1, type: "Varint", value: 150 },
          { number: 2, type: "Varint", value: 300 },
        ],
      },
    ]);
  });

  it("reads a single i32 field", () => {
    const input = b("\x15\x78\x56\x34\x12");
    expect(readProto(input)).toEqual([
      { number: 2, type: "I32", value: b("\x78\x56\x34\x12") },
    ]);
  });

  it("reads a single i64 field", () => {
    const input = b("\x09\x78\x56\x34\x12\xef\xcd\xab\x90");
    expect(readProto(input)).toEqual([
      { number: 1, type: "I64", value: b("\x78\x56\x34\x12\xef\xcd\xab\x90") },
    ]);
  });
});
