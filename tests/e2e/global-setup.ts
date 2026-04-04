import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";
export const DEMO_EMAIL = "demo@travelplanner.dev";
export const DEMO_PASSWORD = "DemoTravel2026";
export const DEMO_NAME = "Demo User";

export default async function globalSetup() {
  const authDir = path.join("tests/e2e/.auth");
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  // Create the demo account (ignore 409 if it already exists)
  await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD, name: DEMO_NAME }),
  });

  // Sign in via browser and save auth state for the demo spec to reuse
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', DEMO_EMAIL);
  await page.fill('input[type="password"]', DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(`${BASE_URL}/`);

  await page.context().storageState({ path: "tests/e2e/.auth/demo.json" });
  await browser.close();
}
