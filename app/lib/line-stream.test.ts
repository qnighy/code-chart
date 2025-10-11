import { ReadableStream as NodeReadableStream } from "node:stream/web";
import { describe, expect, it } from "vitest";
import { lines } from "./line-stream";

describe("lines", () => {
  it("should yield lines from a ReadableStream<string>", async () => {
    const input = NodeReadableStream.from([
      "abc",
      "def\nghi",
      "jkl\nmno\n",
      "pqr",
      "\nstu",
    ]) as ReadableStream<string>;
    const result: string[] = [];
    for await (const line of lines(input)) {
      result.push(line);
    }
    expect(result).toEqual(["abcdef\n", "ghijkl\n", "mno\n", "pqr\n", "stu"]);
  });
});
