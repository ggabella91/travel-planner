// Generates PWA icons from an SVG source using sharp.
// Run: node scripts/generate-icons.mjs

import sharp from "sharp";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../public/icons");

// Map pin icon SVG — matches the app's primary color (#5046e4 ≈ oklch(0.52 0.22 264))
function makeSvg(size) {
  const pad = size * 0.15;
  const inner = size - pad * 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#5046e4"/>

  <!-- Map pin -->
  <g transform="translate(${pad}, ${pad}) scale(${inner / 100})">
    <!-- Pin body -->
    <path d="M50 8 C33 8 20 21 20 37 C20 57 50 88 50 88 C50 88 80 57 80 37 C80 21 67 8 50 8 Z"
      fill="white" fill-opacity="0.95"/>
    <!-- Pin hole -->
    <circle cx="50" cy="37" r="12" fill="#5046e4"/>
  </g>
</svg>`;
}

const sizes = [192, 512];

for (const size of sizes) {
  const svg = Buffer.from(makeSvg(size));
  const outPath = join(outDir, `icon-${size}.png`);

  await sharp(svg).png().toFile(outPath);
  console.log(`✓ ${outPath}`);
}

// Also generate apple-touch-icon (180×180)
const appleSvg = Buffer.from(makeSvg(180));
const applePath = join(__dirname, "../public/apple-touch-icon.png");
await sharp(appleSvg).png().toFile(applePath);
console.log(`✓ ${applePath}`);

console.log("Done.");
