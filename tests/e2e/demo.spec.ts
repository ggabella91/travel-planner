/**
 * Travel Planner — Full Demo
 *
 * Walks through every user journey from scratch.
 * Run with: npm run demo
 * Tip: start screen recording first (Cmd+Shift+5 on macOS), then run.
 */

import { test, expect } from "@playwright/test";

async function addPlace(
  page: import("@playwright/test").Page,
  opts: { name: string; city: string; country: string }
) {
  await page.getByRole("button", { name: /add place/i }).click();
  await page.waitForTimeout(600);

  // Destination hint (search bias — no autocomplete on this field)
  await page.locator("#near-input").fill(opts.city);
  await page.waitForTimeout(400);

  // Name — type, wait for suggestions, then Tab out to dismiss dropdown safely
  await page.locator("#name").fill(opts.name);
  await page.waitForTimeout(1200);
  await page.keyboard.press("Tab");
  await page.waitForTimeout(400);

  // City — fill, Tab out to dismiss dropdown
  await page.locator("#city").fill(opts.city);
  await page.waitForTimeout(800);
  await page.keyboard.press("Tab");
  await page.waitForTimeout(400);

  // Country — fill, Tab out
  await page.locator("#country").fill(opts.country);
  await page.waitForTimeout(600);
  await page.keyboard.press("Tab");
  await page.waitForTimeout(300);

  await page.getByRole("button", { name: /save place/i }).click();

  // Wait for sheet to fully close
  await expect(page.getByRole("button", { name: /save place/i })).not.toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(600);
}

test("travel planner demo", async ({ page }) => {

  // ─── Scene 1: Sign up ─────────────────────────────────────────────────────
  await test.step("create an account", async () => {
    await page.goto("/signup");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);

    await page.fill('input[placeholder="Name (optional)"]', "Demo User");
    await page.waitForTimeout(400);
    await page.fill('input[type="email"]', "demo@travelplanner.dev");
    await page.waitForTimeout(400);
    await page.fill('input[placeholder="Password (min. 8 characters)"]', "DemoTravel2026");
    await page.waitForTimeout(400);
    await page.fill('input[placeholder="Confirm password"]', "DemoTravel2026");
    await page.waitForTimeout(400);

    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByRole("button", { name: /add place/i })).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(800);
  });

  // ─── Scene 2: Empty state ─────────────────────────────────────────────────
  await test.step("empty places backlog", async () => {
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1200);
  });

  // ─── Scene 3: Add places to backlog ───────────────────────────────────────
  await test.step("add places to backlog", async () => {
    await addPlace(page, { name: "Ichiran Ramen Shibuya", city: "Tokyo", country: "Japan" });
    await addPlace(page, { name: "Senso-ji Temple", city: "Tokyo", country: "Japan" });
    await addPlace(page, { name: "TeamLab Planets", city: "Tokyo", country: "Japan" });
    await addPlace(page, { name: "Bar Benfiddich", city: "Tokyo", country: "Japan" });
    await addPlace(page, { name: "Fuglen Tokyo", city: "Tokyo", country: "Japan" });
  });

  // ─── Scene 4: Scroll and browse the backlog ───────────────────────────────
  await test.step("browse the backlog", async () => {
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(800);
    await page.mouse.wheel(0, -400);
    await page.waitForTimeout(600);

    // Filter by status
    const visitedBtn = page.getByRole("button", { name: /visited/i }).first();
    if (await visitedBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await visitedBtn.click();
      await page.waitForTimeout(800);
      await page.getByRole("button", { name: /all/i }).first().click();
      await page.waitForTimeout(600);
    }
  });

  // ─── Scene 5: Create a trip ───────────────────────────────────────────────
  await test.step("create a trip", async () => {
    await page.getByRole("link", { name: /trips/i }).click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);

    await page.getByRole("button", { name: /new trip/i }).click();
    await page.waitForTimeout(600);

    await page.locator("#trip-name").fill("Tokyo Spring 2026");
    await page.waitForTimeout(400);

    await page.locator("#trip-city").fill("Tokyo");
    await page.waitForTimeout(800);
    await page.keyboard.press("Tab");
    await page.waitForTimeout(400);

    // Pick dates
    await page.locator("#trip-start").click();
    await page.waitForTimeout(400);
    await page.getByRole("button", { name: "10" }).first().click();
    await page.waitForTimeout(400);

    await page.locator("#trip-end").click();
    await page.waitForTimeout(400);
    await page.getByRole("button", { name: "17" }).first().click();
    await page.waitForTimeout(400);

    await page.getByRole("button", { name: /create trip/i }).click();
    await expect(page.getByText("Tokyo Spring 2026")).toBeVisible({ timeout: 8000 });
    await page.waitForTimeout(800);
  });

  // ─── Scene 6: Open trip and add places from backlog ───────────────────────
  await test.step("open trip and add places from backlog", async () => {
    await page.getByText("Tokyo Spring 2026").click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);

    // Add from backlog — FAB with aria-label="Add places"
    await page.getByRole("button", { name: "Add places" }).click();
    await page.waitForTimeout(600);

    // Toggle places — each click immediately adds to the trip
    for (const name of ["Ichiran Ramen Shibuya", "Senso-ji Temple", "TeamLab Planets", "Bar Benfiddich", "Fuglen Tokyo"]) {
      const item = page.getByText(name).first();
      if (await item.isVisible({ timeout: 1500 }).catch(() => false)) {
        await item.click();
        await page.waitForTimeout(500);
      }
    }

    // Close the sheet with the built-in close button
    await page.keyboard.press("Escape");
    await page.waitForTimeout(800);
  });

  // ─── Scene 7: Assign days ─────────────────────────────────────────────────
  await test.step("assign places to days", async () => {
    // Scroll to unscheduled section
    await page.getByText("Unscheduled").scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    // Assign first unscheduled place to Day 1
    const firstAddDay = page.getByRole("button", { name: /add day/i }).first();
    await firstAddDay.click();
    await page.waitForTimeout(500);

    const day1 = page.getByRole("button", { name: /day 1/i }).first();
    if (await day1.isVisible({ timeout: 1000 }).catch(() => false)) {
      await day1.click();
      await page.waitForTimeout(300);
      const confirm = page.getByRole("button", { name: /add 1 day/i });
      if (await confirm.isVisible({ timeout: 800 }).catch(() => false)) {
        await confirm.click();
        await page.waitForTimeout(800);
      }
    }

    // Assign second unscheduled place to Day 2
    const secondAddDay = page.getByRole("button", { name: /add day/i }).first();
    if (await secondAddDay.isVisible({ timeout: 1500 }).catch(() => false)) {
      await secondAddDay.click();
      await page.waitForTimeout(500);
      const day2 = page.getByRole("button", { name: /day 2/i }).first();
      if (await day2.isVisible({ timeout: 1000 }).catch(() => false)) {
        await day2.click();
        await page.waitForTimeout(300);
        const confirm2 = page.getByRole("button", { name: /add 1 day/i });
        if (await confirm2.isVisible({ timeout: 800 }).catch(() => false)) {
          await confirm2.click();
          await page.waitForTimeout(800);
        }
      }
    }
  });

  // ─── Scene 8: Browse the itinerary ────────────────────────────────────────
  await test.step("browse day-by-day itinerary", async () => {
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(800);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(800);
    await page.mouse.wheel(0, -1000);
    await page.waitForTimeout(600);
  });

  // ─── Scene 9: Account settings ────────────────────────────────────────────
  await test.step("view account settings", async () => {
    await page.getByRole("link", { name: /account/i }).click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page.getByText(/sign-in methods/i)).toBeVisible();
    await page.waitForTimeout(1000);
  });
});
