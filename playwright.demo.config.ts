import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

// Demo mode: headed browser, slow motion, mobile viewport for visual appeal.
// Usage: npm run demo
// Tip: start a screen recording before running.
export default defineConfig({
  ...base,
  use: {
    ...base.use,
    // iPhone 14 Pro — matches the app's mobile-first design
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    launchOptions: {
      headless: false,
      slowMo: 600,
    },
  },
});
