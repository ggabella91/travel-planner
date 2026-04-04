/**
 * Travel Planner — Full Demo
 *
 * Walks through the full user journey from account creation to a planned trip.
 * Run with: npm run demo
 * Tip: start screen recording first (Cmd+Shift+5 on macOS), then run.
 */

import { test, expect } from "@playwright/test";

async function addPlace(
  page: import("@playwright/test").Page,
  opts: { name: string; city: string; country: string }
) {
  await page.getByRole("button", { name: /add place/i }).click();
  await page.waitForTimeout(300);

  const dialog = page.getByRole("dialog", { name: "Add a place" });

  // Destination hint (search bias)
  await dialog.getByRole("textbox", { name: /destination/i }).fill(opts.city);
  await page.waitForTimeout(200);

  // Name — wait long enough for autocomplete dropdown to appear
  await dialog.getByRole("textbox", { name: /^name/i }).fill(opts.name);
  await page.waitForTimeout(900);
  await page.keyboard.press("Tab");
  await page.waitForTimeout(200);

  // City — wait for autocomplete dropdown to appear
  await dialog.getByRole("textbox", { name: /^city/i }).fill(opts.city);
  await page.waitForTimeout(700);
  await page.keyboard.press("Tab");
  await page.waitForTimeout(200);

  // Country — shorter, no autocomplete needed
  await dialog.getByRole("textbox", { name: /^country/i }).fill(opts.country);
  await page.waitForTimeout(300);
  await page.keyboard.press("Tab");
  await page.waitForTimeout(150);

  await dialog.getByRole("button", { name: /save place/i }).click();
  await expect(dialog).not.toBeVisible({ timeout: 8000 });

  // Wait for toast to appear then immediately dismiss it
  const dismiss = page.getByRole("button", { name: "Dismiss" });
  await dismiss.waitFor({ state: "visible", timeout: 2000 }).catch(() => null);
  if (await dismiss.isVisible().catch(() => false)) {
    await dismiss.click();
    await dismiss.waitFor({ state: "hidden", timeout: 1000 }).catch(() => null);
  }
  await page.waitForTimeout(150);
}

test("travel planner demo", async ({ page }) => {

  // ─── Scene 1: Sign up ─────────────────────────────────────────────────────
  await test.step("create an account", async () => {
    await page.goto("/signup");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(600);

    await page.getByRole("textbox", { name: /name/i }).fill("Demo User");
    await page.waitForTimeout(200);
    await page.getByRole("textbox", { name: /email/i }).fill("demo@travelplanner.dev");
    await page.waitForTimeout(200);
    await page.getByRole("textbox", { name: /^password \(min/i }).fill("DemoTravel2026");
    await page.waitForTimeout(200);
    await page.getByRole("textbox", { name: /confirm/i }).fill("DemoTravel2026");
    await page.waitForTimeout(200);

    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByRole("button", { name: /add place/i })).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(600);
  });

  // ─── Scene 2: Empty state ─────────────────────────────────────────────────
  await test.step("empty places backlog", async () => {
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);
  });

  // ─── Scene 3: Add places to backlog ───────────────────────────────────────
  await test.step("add places to backlog", async () => {
    await addPlace(page, { name: "Ichiran Ramen Shibuya", city: "Tokyo", country: "Japan" });
    await addPlace(page, { name: "Senso-ji Temple", city: "Tokyo", country: "Japan" });
    await addPlace(page, { name: "TeamLab Planets", city: "Tokyo", country: "Japan" });
    await addPlace(page, { name: "Bar Benfiddich", city: "Tokyo", country: "Japan" });
    await addPlace(page, { name: "Fuglen Tokyo", city: "Tokyo", country: "Japan" });
  });

  // ─── Scene 4: Browse the backlog ──────────────────────────────────────────
  await test.step("browse the backlog", async () => {
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(600);
    await page.mouse.wheel(0, -400);
    await page.waitForTimeout(400);

    // Show the filter sheet briefly
    await page.getByRole("button", { name: /filter places/i }).click();
    await page.waitForTimeout(700);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
  });

  // ─── Scene 5: Create a trip ───────────────────────────────────────────────
  await test.step("create a trip", async () => {
    await page.getByRole("link", { name: /trips/i }).click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(600);

    await page.getByRole("button", { name: /new trip/i }).click();
    await page.waitForTimeout(400);

    const dialog = page.getByRole("dialog", { name: "New trip" });

    await dialog.getByRole("textbox", { name: /^name/i }).fill("Tokyo Spring 2026");
    await page.waitForTimeout(300);

    await dialog.getByRole("textbox", { name: /^city/i }).fill("Tokyo");
    await page.waitForTimeout(400);
    await page.keyboard.press("Tab");
    await page.waitForTimeout(300);

    // Start date — calendar opens, pick a day
    await dialog.getByRole("button", { name: /start date/i }).click();
    await page.waitForTimeout(400);
    await page.getByRole("button", { name: "10" }).click();
    await page.waitForTimeout(300);

    // End date
    await dialog.getByRole("button", { name: /end date/i }).click();
    await page.waitForTimeout(400);
    await page.getByRole("button", { name: "17" }).click();
    await page.waitForTimeout(300);

    await dialog.getByRole("button", { name: /create trip/i }).click();
    await expect(page.getByText("Tokyo Spring 2026")).toBeVisible({ timeout: 8000 });
    await page.waitForTimeout(600);
  });

  // ─── Scene 6: Open trip and add places from backlog ───────────────────────
  await test.step("open trip and add places from backlog", async () => {
    await page.getByText("Tokyo Spring 2026").click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(600);

    await page.getByRole("button", { name: "Add places" }).click();
    await page.waitForTimeout(400);

    const sheet = page.getByRole("dialog", { name: "Add places" });

    for (const name of ["Ichiran Ramen Shibuya", "Senso-ji Temple", "TeamLab Planets", "Bar Benfiddich", "Fuglen Tokyo"]) {
      const btn = sheet.getByRole("button", { name: new RegExp(name) });
      if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(350);
      }
    }

    await sheet.getByRole("button", { name: "Close" }).click();
    await page.waitForTimeout(500);
  });

  // ─── Scene 7: Assign days ─────────────────────────────────────────────────
  await test.step("assign places to days", async () => {
    await page.getByText("Unscheduled").scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    // Assign first place to Day 1
    await page.getByRole("button", { name: "Add day" }).first().click();
    await page.waitForTimeout(300);
    await page.locator("button").filter({ hasText: /Day 1 ·/ }).first().click();
    await page.waitForTimeout(200);
    await page.locator("button").filter({ hasText: /Add \d+ day/ }).click();
    await page.waitForTimeout(500);

    // Assign second place to Day 2
    await page.getByRole("button", { name: "Add day" }).first().click();
    await page.waitForTimeout(300);
    await page.locator("button").filter({ hasText: /Day 2 ·/ }).first().click();
    await page.waitForTimeout(200);
    await page.locator("button").filter({ hasText: /Add \d+ day/ }).click();
    await page.waitForTimeout(500);

    // Assign third place to Day 3
    await page.getByRole("button", { name: "Add day" }).first().click();
    await page.waitForTimeout(300);
    await page.locator("button").filter({ hasText: /Day 3 ·/ }).first().click();
    await page.waitForTimeout(200);
    await page.locator("button").filter({ hasText: /Add \d+ day/ }).click();
    await page.waitForTimeout(500);
  });

  // ─── Scene 8: Browse the itinerary ────────────────────────────────────────
  await test.step("browse day-by-day itinerary", async () => {
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(600);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(600);
    await page.mouse.wheel(0, -1000);
    await page.waitForTimeout(500);
  });

  // ─── Scene 9: Account settings ────────────────────────────────────────────
  await test.step("view account settings", async () => {
    await page.getByRole("link", { name: /account/i }).click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);
    await expect(page.getByText(/sign-in methods/i)).toBeVisible();
    await page.waitForTimeout(800);
  });
});
