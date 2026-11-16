// Runs automatically after `next build` (npm "postbuild" hook).
// Lists every built JS/CSS/font file in .next/static and writes the list to
// .next/static/precache-manifest.json, which Next serves at
// /_next/static/precache-manifest.json. The service worker downloads this file
// while installing and precaches everything in it, including lazy-loaded chunks.
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const root = join(".next", "static");

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const files = walk(root)
  .map((f) => relative(root, f).split(sep).join("/"))
  .filter((f) => /\.(?:js|css|woff2?)$/.test(f))
  .map((f) => `/_next/static/${f}`)
  .sort();

writeFileSync(join(root, "precache-manifest.json"), JSON.stringify(files));
console.log(`precache-manifest.json: ${files.length} files`);
