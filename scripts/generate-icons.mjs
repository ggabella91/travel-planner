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

// Generate OG image (1200×630)
const ogSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <!-- Background -->
  <rect width="1200" height="630" fill="#0f0e1a"/>

  <!-- Subtle radial glow -->
  <radialGradient id="glow" cx="40%" cy="50%" r="60%">
    <stop offset="0%" stop-color="#5046e4" stop-opacity="0.25"/>
    <stop offset="100%" stop-color="#0f0e1a" stop-opacity="0"/>
  </radialGradient>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- Map pin icon -->
  <g transform="translate(500, 170)">
    <path d="M100 0 C66 0 40 26 40 58 C40 94 100 160 100 160 C100 160 160 94 160 58 C160 26 134 0 100 0 Z"
      fill="#5046e4" opacity="0.9"/>
    <circle cx="100" cy="58" r="24" fill="#0f0e1a" opacity="0.6"/>
  </g>

  <!-- App name -->
  <text x="600" y="400" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="700" fill="white" opacity="0.95">Travel Planner</text>

  <!-- Tagline -->
  <text x="600" y="460" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="400" fill="white" opacity="0.45">Your personal places backlog &amp; trip planner</text>
</svg>`);

const ogPath = join(__dirname, "../public/og-image.png");
await sharp(ogSvg).png().toFile(ogPath);
console.log(`✓ ${ogPath}`);

console.log("Done.");
