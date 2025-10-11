import fs from "node:fs/promises";
import path from "node:path";
import AdmZip from "adm-zip";
import { downloadUCD } from "./download.ts";
import { ucdTmpPath } from "./path.ts";

export async function extractUCD(version: string): Promise<void> {
  const extractPath = path.join(ucdTmpPath, `UCD-${version}`);
  const timestampPath = path.join(extractPath, ".extracted");

  // Check if already extracted by looking for timestamp file
  try {
    await fs.access(timestampPath);
    // Timestamp file exists, extraction already done
    return;
  } catch (error) {
    // Only catch ENOENT (file doesn't exist), rethrow other errors
    if (
      !(error instanceof Error) ||
      (error as NodeJS.ErrnoException).code !== "ENOENT"
    ) {
      throw error;
    }
    // Timestamp file doesn't exist, proceed with extraction
  }

  // Download the UCD zip file
  const buffer = await downloadUCD(version);

  // Ensure the extraction directory exists
  await fs.mkdir(extractPath, { recursive: true });

  // Extract the zip file
  const zip = new AdmZip(buffer);
  zip.extractAllTo(extractPath, /* overwrite */ true);

  // Create timestamp file to mark successful extraction
  const timestamp = new Date().toISOString();
  await fs.writeFile(timestampPath, timestamp);
}

if (import.meta.main) {
  await extractUCD("16.0.0");
}
