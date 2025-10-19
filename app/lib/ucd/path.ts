import path from "node:path";

const dirname = new URL(".", import.meta.url).pathname;
export const ucdTmpPath = path.join(dirname, "../../../tmp/ucd");
export const ucdNextCachePath = path.join(dirname, "../../../.next/cache/ucd");
