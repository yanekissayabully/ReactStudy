// Runs automatically before `npm run build` (npm "prebuild" hook).
// Copies pwa/sw.template.js to public/sw.js with a fresh build version.
import { readFileSync, writeFileSync } from "node:fs";

const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);
const stamp = `${sha ? sha + "-" : ""}${Date.now().toString(36)}`;
const template = readFileSync("pwa/sw.template.js", "utf8");
writeFileSync("public/sw.js", template.replace(/const VERSION = "__BUILD_VERSION__"/, `const VERSION = "${stamp}"`));
console.log(`public/sw.js generated (version ${stamp})`);
