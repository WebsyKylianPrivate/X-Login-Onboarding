import { build } from "esbuild";
import { readFileSync } from "fs";
import { resolve } from "path";

const tsconfig = JSON.parse(readFileSync("./tsconfig.json", "utf-8"));

const alias = Object.entries(tsconfig.compilerOptions.paths || {}).reduce(
  (acc, [key, [value]]) => {
    const aliasKey = key.replace("/*", "");
    const aliasValue = resolve(process.cwd(), value.replace("/*", ""));
    acc[aliasKey] = aliasValue;
    return acc;
  },
  {}
);

build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/index.js",
  platform: "node",
  target: "node18",
  format: "esm",
  sourcemap: true,
  alias,
  external: ["express"],
}).catch(() => process.exit(1));
