import { describe, expect, it } from "vitest";
import { ProtoWriter } from "./writer";

function writeProto(callback: (writer: ProtoWriter) => void): Uint8Array {
  const writer = new ProtoWriter();
  callback(writer);
  return writer.toUint8Array();
}

function b(text: string): Uint8Array {
  return Uint8Array.from([...text].map((c) => c.charCodeAt(0)));
}

describe("ProtoWriter", () => {
  it("writes empty message", () => {
    const output = writeProto(() => {});
    expect(output).toEqual(b(""));
  });

  it("writes multiple fields", () => {
    const output = writeProto((writer) => {
      writer.writeVarintField(1, 150);
      writer.writeVarintField(2, 300);
    });
    expect(output).toEqual(b("\x08\x96\x01\x10\xac\x02"));
  });

  it("writes a single varint field", () => {
    const output = writeProto((writer) => {
      writer.writeVarintField(1, 150);
    });
    expect(output).toEqual(b("\x08\x96\x01"));
  });

  it("writes a varint field with 32-bit value", () => {
    const output = writeProto((writer) => {
      writer.writeVarintField(1, 4294967295);
    });
    expect(output).toEqual(b("\x08\xff\xff\xff\xff\x0f"));
  });

  it("writes a varint field with 64-bit value", () => {
    const output = writeProto((writer) => {
      writer.writeVarintField(1, 18446744073709551615n);
    });
    expect(output).toEqual(b("\x08\xff\xff\xff\xff\xff\xff\xff\xff\xff\x01"));
  });

  it("writes a single length-delimited field", () => {
    const output = writeProto((writer) => {
      writer.writeLenField(1, b("foo"));
    });
    expect(output).toEqual(b("\x0a\x03foo"));
  });

  it("writes a single group field", () => {
    const output = writeProto((writer) => {
      writer.writeGroup(1, () => {
        writer.writeVarintField(1, 150);
        writer.writeVarintField(2, 300);
      });
    });
    expect(output).toEqual(b("\x0b\x08\x96\x01\x10\xac\x02\x0c"));
  });

  it("writes a single i32 field", () => {
    const output = writeProto((writer) => {
      writer.writeI32Field(2, b("\x78\x56\x34\x12"));
    });
    expect(output).toEqual(b("\x15\x78\x56\x34\x12"));
  });

  it("writes a single i64 field", () => {
    const output = writeProto((writer) => {
      writer.writeI64Field(1, b("\x78\x56\x34\x12\xef\xcd\xab\x90"));
    });
    expect(output).toEqual(b("\x09\x78\x56\x34\x12\xef\xcd\xab\x90"));
  });
});
