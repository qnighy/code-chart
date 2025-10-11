import {
  WIRE_END_GROUP,
  WIRE_I32,
  WIRE_I64,
  WIRE_LEN,
  WIRE_START_GROUP,
  WIRE_VARINT,
} from "./common";

export class ProtoReader implements IterableIterator<ProtoField> {
  private _buf: Uint8Array;
  private _pos: number;

  constructor(buf: Uint8Array) {
    this._buf = buf;
    this._pos = 0;
  }

  [Symbol.iterator](): IterableIterator<ProtoField> {
    return this;
  }

  next(): IteratorResult<ProtoField> {
    if (this._pos >= this._buf.length) {
      return { done: true, value: undefined };
    }

    const value = this._readField();

    if (value.type === "End") {
      throw new SyntaxError("Unexpected end group indicator");
    }

    return { done: false, value };
  }

  private _readField(): ProtoField | ProtoEndIndicator {
    const tag = this._readVarint32();
    // It is important to use logical shift here, because tags can be
    // at most 2^32 - 1.
    const number = tag >>> 3;
    if (number === 0) {
      throw new SyntaxError("Invalid field number: 0");
    }
    const wireType = tag & 0x07;

    switch (wireType) {
      case WIRE_VARINT: {
        const value = this._readVarint();
        return { number, type: "Varint", value };
      }
      case WIRE_LEN: {
        const length = this._readVarint32();
        const value = this._readBytes(length);
        return { number, type: "Len", value };
      }
      case WIRE_START_GROUP: {
        const value: ProtoField[] = [];
        while (true) {
          const field = this._readField();
          if (field.type === "End") {
            if (field.number !== number) {
              throw new SyntaxError(
                `Incorrect group nesting: opened ${number}, closed ${field.number}`,
              );
            }
            break;
          }
          value.push(field);
        }
        return { number, type: "Group", value };
      }
      case WIRE_END_GROUP: {
        return { number, type: "End" };
      }
      case WIRE_I32: {
        const value = this._readBytes(4);
        return { number, type: "I32", value };
      }
      case WIRE_I64: {
        const value = this._readBytes(8);
        return { number, type: "I64", value };
      }
      default: {
        throw new SyntaxError(`Invalid wire type: ${wireType}`);
      }
    }
  }

  private _readVarint32(): number {
    const value = this._readVarint();
    if (typeof value === "bigint") {
      throw new SyntaxError("Varint32 too large (more than 32 bits)");
    }
    return value;
  }

  private _readVarint(): number | bigint {
    let pos = this._pos;
    while (true) {
      if (pos >= this._buf.length) {
        throw new SyntaxError("Unexpected end of data");
      }
      if (this._buf[pos] < 0x80) {
        pos++;
        break;
      }
      pos++;
    }
    const len = pos - this._pos;
    const last = this._buf[pos - 1];
    if (len > 1 && last === 0) {
      throw new SyntaxError("Redundant varint encoding");
    } else if (len > 10 || (len === 10 && last > 1)) {
      // The last byte has more than 1 bit, therefore the whole varint
      // is larger than 64 bits (= 9 * 7 + 1).
      throw new SyntaxError("Varint too large (more than 64 bits)");
    } else if (len > 5 || (len === 5 && last > 0x0f)) {
      // The last byte has more than 4 bits, therefore the whole varint
      // is larger than 32 bits (= 4 * 7 + 4).
      let result = 0n;
      let shift = 0n;
      for (let i = 0; i < len; i++) {
        const byte = this._buf[this._pos + i];
        result |= BigInt(byte & 0x7f) << shift;
        shift += 7n;
      }
      this._pos += len;
      return result;
    } else {
      // Within 32 bits.
      let result = 0;
      let shift = 0;
      for (let i = 0; i < len; i++) {
        const byte = this._buf[this._pos + i];
        result |= (byte & 0x7f) << shift;
        shift += 7;
      }
      this._pos += len;
      return result >>> 0;
    }
  }

  private _readBytes(length: number): Uint8Array {
    if (this._pos + length > this._buf.length) {
      throw new SyntaxError("Unexpected end of data");
    }
    const bytes = this._buf.subarray(this._pos, this._pos + length);
    this._pos += length;
    return bytes;
  }

  private _readByte(): number {
    if (this._pos >= this._buf.length) {
      throw new SyntaxError("Unexpected end of data");
    }
    return this._buf[this._pos++];
  }
}

export type ProtoField =
  | ProtoVarintField
  | ProtoLenField
  | ProtoGroupField
  | ProtoI32Field
  | ProtoI64Field;

export type ProtoVarintField = {
  number: number;
  type: "Varint";
  value: number | bigint;
};

export type ProtoLenField = {
  number: number;
  type: "Len";
  value: Uint8Array;
};

export type ProtoGroupField = {
  number: number;
  type: "Group";
  value: ProtoField[];
};

export type ProtoEndIndicator = {
  number: number;
  type: "End";
};

export type ProtoI32Field = {
  number: number;
  type: "I32";
  value: Uint8Array;
};

export type ProtoI64Field = {
  number: number;
  type: "I64";
  value: Uint8Array;
};

export function fieldAsUint32(field: ProtoField): number {
  if (field.type !== "Varint") {
    throw new SyntaxError(`Expected Varint field, got ${field.type}`);
  }
  if (typeof field.value === "bigint") {
    throw new SyntaxError("Varint too large (more than 32 bits)");
  }
  return field.value >>> 0;
}

export type EnumValueMap<T extends string | number> = Record<
  number,
  Exclude<T, number>
>;

export function fieldAsEnum<T extends string | number>(
  field: ProtoField,
  enumValueMap: EnumValueMap<T>,
): T | number {
  if (field.type !== "Varint") {
    throw new SyntaxError(`Expected Varint field, got ${field.type}`);
  }
  if (typeof field.value === "bigint") {
    throw new SyntaxError("Varint too large (more than 32 bits)");
  }
  const value = field.value >>> 0;
  const enumValue = enumValueMap[value];
  if (enumValue == null) {
    return value;
  }
  return enumValue;
}

export type FieldAsStringOptions = {
  validate?: boolean | undefined;
};
export function fieldAsString(
  field: ProtoField,
  options: FieldAsStringOptions = {},
): string {
  const { validate = true } = options;
  if (field.type !== "Len") {
    throw new SyntaxError(`Expected Len field, got ${field.type}`);
  }
  const decoder = new TextDecoder("utf-8", { fatal: validate });
  try {
    return decoder.decode(field.value);
  } catch (e) {
    if (e instanceof TypeError) {
      throw new SyntaxError("Invalid UTF-8 string");
    }
    throw e;
  }
}

export function fieldAsSubmessage<T>(
  field: ProtoField,
  decode: (buf: Uint8Array) => T,
): T {
  if (field.type !== "Len") {
    throw new SyntaxError(`Expected Len field, got ${field.type}`);
  }
  return decode(field.value);
}
