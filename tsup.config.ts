// tsup.config.ts
import { defineConfig } from "tsup";
import type { Plugin } from "esbuild";
import { readFileSync } from "fs";

const dynamicImportToRequire: Plugin = {
  name: "dynamic-import-to-require",
  setup(build) {
    if (build.initialOptions.format !== "cjs") return;

    build.onLoad({ filter: /scanner\.ts$/ }, (args) => {
      const source = readFileSync(args.path, "utf8");
      const transformed = source.replace(
        /await import\(pathToFileURL\(file\)\.href\)/g,
        "require(file)",
      );
      return { contents: transformed, loader: "ts" };
    });
  },
};

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  esbuildPlugins: [dynamicImportToRequire],
});
