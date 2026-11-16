// One-off helper: renders the PWA PNG icons from an inline SVG.
// Run with: node scripts/generate-icons.mjs  (output is committed to public/icons)
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const BLUE = "#1d5fbf";

// `pad` is the safe-zone padding (maskable icons get cropped to a circle/squircle
// by the OS, so the artwork must live inside the central ~80%).
function svg({ rounded, pad }) {
  const s = 512;
  const inner = s - pad * 2;
  const k = inner / 32; // scale the 32x32 artwork
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" ${rounded ? 'rx="96"' : ""} fill="${BLUE}"/>
  <g transform="translate(${pad} ${pad}) scale(${k})" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none">
    <path d="M9 10h14M9 16h14M9 22h8"/>
  </g>
</svg>`;
}

mkdirSync("public/icons", { recursive: true });

const jobs = [
  ["icon-192.png", 192, { rounded: true, pad: 64 }],
  ["icon-512.png", 512, { rounded: true, pad: 64 }],
  ["maskable-512.png", 512, { rounded: false, pad: 112 }],
  ["apple-touch-icon.png", 180, { rounded: false, pad: 56 }],
];

for (const [file, size, opts] of jobs) {
  await sharp(Buffer.from(svg(opts))).resize(size, size).png().toFile(`public/icons/${file}`);
  console.log("wrote public/icons/" + file);
}
