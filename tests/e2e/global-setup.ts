import { chromium, type Page } from "@playwright/test";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";
export const DEMO_EMAIL = "demo@travelplanner.dev";
export const DEMO_PASSWORD = "DemoTravel2026";
export const DEMO_NAME = "Demo User";

const DEMO_PLACES = [
  { name: "Ichiran Ramen Shibuya", city: "Tokyo", country: "Japan", category: "restaurant" },
  { name: "TeamLab Planets", city: "Tokyo", country: "Japan", category: "activity" },
  { name: "Senso-ji Temple", city: "Tokyo", country: "Japan", category: "activity" },
  { name: "Bar Benfiddich", city: "Tokyo", country: "Japan", category: "bar" },
  { name: "Fuglen Tokyo", city: "Tokyo", country: "Japan", category: "cafe" },
  { name: "Shibuya Sky", city: "Tokyo", country: "Japan", category: "activity" },
];

const DEMO_TRIP = {
  name: "Tokyo Spring 2026",
  city: "Tokyo",
  startDate: "2026-04-10",
  endDate: "2026-04-17",
};

// Places assigned to trip days. Others remain unscheduled.
const DEMO_TRIP_PLACES: { name: string; days: number[] }[] = [
  { name: "Senso-ji Temple", days: [1] },
  { name: "TeamLab Planets", days: [2] },
  { name: "Ichiran Ramen Shibuya", days: [2] },
  { name: "Bar Benfiddich", days: [3] },
  { name: "Fuglen Tokyo", days: [] },
  { name: "Shibuya Sky", days: [] },
];

async function seedDemoData(page: Page) {
  // Fetch existing places
  const placesRes = await page.request.get(`${BASE_URL}/api/places`);
  const existingPlaces: { id: string; name: string }[] = placesRes.ok() ? await placesRes.json() : [];
  const placeIds: Record<string, string> = {};

  for (const p of existingPlaces) {
    placeIds[p.name] = p.id;
  }

  // Create any missing demo places
  for (const demo of DEMO_PLACES) {
    if (!placeIds[demo.name]) {
      const res = await page.request.post(`${BASE_URL}/api/places`, { data: demo });
      if (res.ok()) {
        const created = await res.json();
        placeIds[demo.name] = created.id;
      }
    }
  }

  // Fetch existing trips
  const tripsRes = await page.request.get(`${BASE_URL}/api/trips`);
  const existingTrips: { id: string; name: string }[] = tripsRes.ok() ? await tripsRes.json() : [];
  let tripId = existingTrips.find((t) => t.name === DEMO_TRIP.name)?.id;

  if (!tripId) {
    const res = await page.request.post(`${BASE_URL}/api/trips`, { data: DEMO_TRIP });
    if (res.ok()) {
      const created = await res.json();
      tripId = created.id;
    }
  }

  if (!tripId) return;

  // Add places to trip (409 = already added, fine)
  for (const { name, days } of DEMO_TRIP_PLACES) {
    const placeId = placeIds[name];
    if (!placeId) continue;

    await page.request.post(`${BASE_URL}/api/trips/${tripId}/places`, {
      data: { placeId },
    });

    if (days.length > 0) {
      await page.request.patch(`${BASE_URL}/api/trips/${tripId}/places/${placeId}`, {
        data: { days },
      });
    }
  }
}

export default async function globalSetup() {
  // Ensure the auth dir exists
  const authDir = path.join("tests/e2e/.auth");
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  // Create the demo account (ignore 409 if it already exists)
  await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD, name: DEMO_NAME }),
  });

  // Sign in via browser to get a real session
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', DEMO_EMAIL);
  await page.fill('input[type="password"]', DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(`${BASE_URL}/`);

  // Seed demo data using the authenticated session
  await seedDemoData(page);

  // Save auth state for tests to reuse
  await page.context().storageState({ path: "tests/e2e/.auth/demo.json" });
  await browser.close();
}
