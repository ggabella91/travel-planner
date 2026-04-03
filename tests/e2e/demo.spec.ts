/**
 * Travel Planner — Full Demo
 *
 * A single flowing walkthrough of all major features.
 * Run with: npm run demo
 *
 * For screen recording: start recording first (Cmd+Shift+5 on macOS), then run.
 */

import { test, expect } from "@playwright/test";

const DEMO_TRIP_NAME = "Tokyo Spring 2026";

test("travel planner demo", async ({ page }) => {
  // ─── Scene 1: Places Backlog ──────────────────────────────────────────────
  await test.step("browse places backlog", async () => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Confirm places are loaded
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.locator("ul li").first()).toBeVisible();

    // Scroll down to show more places
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(800);
    await page.mouse.wheel(0, -300);
    await page.waitForTimeout(600);
  });

  // ─── Scene 2: Filter by category ─────────────────────────────────────────
  await test.step("filter places by category", async () => {
    // Click "Activity" filter chip
    await page.getByRole("button", { name: /activity/i }).click();
    await page.waitForTimeout(800);

    // Back to all
    await page.getByRole("button", { name: /all/i }).click();
    await page.waitForTimeout(600);
  });

  // ─── Scene 3: Add a new place ─────────────────────────────────────────────
  await test.step("add a new place to the backlog", async () => {
    await page.getByRole("button", { name: /add place/i }).click();
    await page.waitForTimeout(400);

    // Fill in destination for search bias
    const destInput = page.getByLabel(/destination/i);
    await destInput.fill("Tokyo");
    await page.waitForTimeout(400);

    // Type the place name and pick from Foursquare autocomplete if available,
    // otherwise just fill in the details manually
    const nameInput = page.getByLabel(/name/i);
    await nameInput.fill("Koffee Mameya");
    await page.waitForTimeout(1200);

    // Try to select first autocomplete suggestion, otherwise continue
    const suggestion = page.locator('[role="listbox"] [role="option"]').first();
    if (await suggestion.isVisible({ timeout: 1500 }).catch(() => false)) {
      await suggestion.click();
    } else {
      // Fill manually
      await page.getByLabel(/city/i).fill("Tokyo");
      await page.waitForTimeout(300);
      await page.getByLabel(/country/i).fill("Japan");
      await page.waitForTimeout(300);
    }

    // Save
    await page.getByRole("button", { name: /save place/i }).click();
    await page.waitForTimeout(800);
  });

  // ─── Scene 4: View trips list ─────────────────────────────────────────────
  await test.step("navigate to trips", async () => {
    await page.getByRole("link", { name: /trips/i }).click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(600);

    // Trip card should be visible with place count
    await expect(page.getByText(DEMO_TRIP_NAME)).toBeVisible();
    await expect(page.getByText(/places/i)).toBeVisible();
  });

  // ─── Scene 5: Trip detail — day-by-day itinerary ─────────────────────────
  await test.step("open trip and browse itinerary", async () => {
    await page.getByText(DEMO_TRIP_NAME).click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(600);

    // Scroll through the day sections
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(800);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(800);
    await page.mouse.wheel(0, -800);
    await page.waitForTimeout(600);
  });

  // ─── Scene 6: Assign a day to an unscheduled place ───────────────────────
  await test.step("assign an unscheduled place to a day", async () => {
    // Scroll to the Unscheduled section
    await page.getByText("Unscheduled").scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    // Open "Add day" dropdown on the first unscheduled card
    const addDayBtn = page.getByRole("button", { name: /add day/i }).first();
    await addDayBtn.click();
    await page.waitForTimeout(400);

    // Select Day 4 from the dropdown
    const dayOption = page.getByRole("button", { name: /day 4/i }).first();
    if (await dayOption.isVisible({ timeout: 1000 }).catch(() => false)) {
      await dayOption.click();
      await page.waitForTimeout(300);

      // Confirm
      const confirmBtn = page.getByRole("button", { name: /add 1 day/i });
      if (await confirmBtn.isVisible({ timeout: 800 }).catch(() => false)) {
        await confirmBtn.click();
        await page.waitForTimeout(800);
      }
    }
  });

  // ─── Scene 7: Account settings ───────────────────────────────────────────
  await test.step("view account settings", async () => {
    await page.getByRole("link", { name: /account/i }).click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);

    await expect(page.getByText(/sign-in methods/i)).toBeVisible();
  });
});
