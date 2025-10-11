/**
 * A utility to read lines from a ReadableStream<string>.
 */
export async function* lines(
  input: ReadableStream<string>,
): AsyncIterableIterator<string> {
  let buffer: string = "";
  const reader = input.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      let lineEndIndex: number;
      while ((lineEndIndex = buffer.indexOf("\n")) >= 0) {
        // Extract the line including the newline character
        const line = buffer.slice(0, lineEndIndex + 1);
        yield line;
        // Remove the extracted line from the buffer
        buffer = buffer.slice(lineEndIndex + 1);
      }
    }
    // Yield any remaining text in the buffer as the last line
    if (buffer.length > 0) {
      yield buffer;
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * A utility to read lines from a ReadableStream<BufferSource>.
 */
export function linesFromBytes(
  input: ReadableStream<BufferSource>,
): AsyncIterableIterator<string> {
  const textStream = input.pipeThrough(new TextDecoderStream());
  return lines(textStream);
}
