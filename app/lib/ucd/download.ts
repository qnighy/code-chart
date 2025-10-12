import fs from "node:fs/promises";
import path from "node:path";
import { ucdTmpPath } from "./path.ts";

export async function downloadUCD(version: string): Promise<Buffer> {
  const destPath = path.join(ucdTmpPath, `UCD-${version}.zip`);
  const tempPath = path.join(ucdTmpPath, `UCD-${version}.zip.tmp`);

  // Bail early if the file already exists
  try {
    await fs.access(destPath);
    // File exists, read and return it
    return await fs.readFile(destPath);
  } catch (error) {
    // Only catch ENOENT (file doesn't exist), rethrow other errors
    if (
      !(error instanceof Error) ||
      (error as NodeJS.ErrnoException).code !== "ENOENT"
    ) {
      throw error;
    }
    // File doesn't exist, proceed with download
  }

  // Ensure the directory exists
  await fs.mkdir(ucdTmpPath, { recursive: true });

  // Download the UCD zip file
  const url = `https://www.unicode.org/Public/${version}/ucd/UCD.zip`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to download UCD ${version}: ${response.status} ${response.statusText}`,
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  // Write to temporary file
  await fs.writeFile(tempPath, buffer);

  // Rename to final destination
  await fs.rename(tempPath, destPath);

  return buffer;
}
