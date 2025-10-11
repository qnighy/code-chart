import {
  WIRE_END_GROUP,
  WIRE_I32,
  WIRE_I64,
  WIRE_LEN,
  WIRE_START_GROUP,
  WIRE_VARINT,
} from "./common";

export class ProtoWriter {
  private _buf: Uint8Array<ArrayBuffer> = new Uint8Array(16);
  private _pos: number = 0;

  toUint8Array(): Uint8Array {
    return this._buf.subarray(0, this._pos);
  }

  writeVarintField(fieldNumber: number, value: number | bigint): void {
    const tag = (fieldNumber << 3) | WIRE_VARINT;
    this._writeVarint(tag);
    this._writeVarint(value);
  }

  writeLenField(fieldNumber: number, value: Uint8Array): void {
    const tag = (fieldNumber << 3) | WIRE_LEN;
    this._writeVarint(tag);
    this._writeVarint(value.length);
    this._writeBytes(value);
  }

  writeGroup(fieldNumber: number, callback: () => void): void {
    const startTag = (fieldNumber << 3) | WIRE_START_GROUP;
    this._writeVarint(startTag);
    callback();
    const endTag = (fieldNumber << 3) | WIRE_END_GROUP;
    this._writeVarint(endTag);
  }

  writeI32Field(fieldNumber: number, value: Uint8Array): void {
    const tag = (fieldNumber << 3) | WIRE_I32;
    this._writeVarint(tag);
    if (value.length !== 4) {
      throw new RangeError("I32 field must be exactly 4 bytes");
    }
    this._writeBytes(value);
  }

  writeI64Field(fieldNumber: number, value: Uint8Array): void {
    const tag = (fieldNumber << 3) | WIRE_I64;
    this._writeVarint(tag);
    if (value.length !== 8) {
      throw new RangeError("I64 field must be exactly 8 bytes");
    }
    this._writeBytes(value);
  }

  private _writeVarint(value: number | bigint): void {
    if (typeof value === "number") {
      let v = value >>> 0;
      while (v >= 0x80) {
        this._writeByte((v & 0x7f) | 0x80);
        v >>>= 7;
      }
      this._writeByte(v);
    } else {
      let v = value;
      while (v >= 0x80n) {
        this._writeByte(Number((v & 0x7fn) | 0x80n));
        v >>= 7n;
      }
      this._writeByte(Number(v));
    }
  }

  private _writeBytes(bytes: Uint8Array): void {
    this._reserve(this._pos + bytes.length);
    this._buf.set(bytes, this._pos);
    this._pos += bytes.length;
  }

  private _writeByte(byte: number): void {
    this._reserve(this._pos + 1);
    this._buf[this._pos++] = byte;
  }

  private _reserve(demand: number): void {
    if (demand <= this._buf.length) {
      return;
    }
    const newSize = Math.max(this._buf.length * 2, demand);
    if (typeof ArrayBuffer.prototype.transfer === "function") {
      this._buf = new Uint8Array(this._buf.buffer.transfer(newSize));
    } else {
      const newBuf = new Uint8Array(newSize);
      newBuf.set(this._buf);
      this._buf = newBuf;
    }
  }
}
