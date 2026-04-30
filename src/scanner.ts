import { glob } from "tinyglobby";
import { readFile } from "node:fs/promises";

export type ScannerOptions = {
  rootDir: string;
};

export interface ScanResult {
  filesFound: number;
  filesImported: number;
  filesSkipped: number;
  durationMs: number;
}

const DEFAULT_EXTENSIONS = ["ts", "mts", "cts", "js", "mjs", "cjs"];
const DEFAULT_EXCLUDE = ["**/node_modules/**", "**/*.d.ts"];
const DEFAULT_MARKERS = ["Implements", "RegisterAs"];

export async function scanFiles(options: ScannerOptions): Promise<ScanResult> {
  const startedAt = performance.now();

  const roots = Array.isArray(options.rootDir)
    ? options.rootDir
    : [options.rootDir];

  const patterns = roots.map(
    (root) => `${root}/**/*.{${DEFAULT_EXTENSIONS.join(",")}}`,
  );

  const files = await glob(patterns, {
    cwd: options.rootDir,
    ignore: DEFAULT_EXCLUDE,
    absolute: true,
  });

  const results = await Promise.all(
    files.map(async (file) => {
      const content = await readFile(file, "utf8");
      const hasMarker = DEFAULT_MARKERS.some((m) => content.includes(m));
      if (!hasMarker) return "skipped" as const;

      await import(file);
      return "imported" as const;
    }),
  );

  return {
    filesFound: files.length,
    filesImported: results.filter((r) => r === "imported").length,
    filesSkipped: results.filter((r) => r === "skipped").length,
    durationMs: performance.now() - startedAt,
  };
}
