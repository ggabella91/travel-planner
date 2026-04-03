import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  email: text("email").primaryKey(),
  name: text("name"),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const places = pgTable("places", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  name: text("name").notNull(),
  city: text("city").notNull(),
  state: text("state"),
  country: text("country").notNull(),
  category: text("category"), // 'restaurant' | 'neighborhood' | 'activity' | 'spot' | 'bar' | 'cafe'
  notes: text("notes"),
  source: text("source"), // 'instagram' | 'reddit' | 'friend' | freeform
  url: text("url"),
  status: text("status").notNull().default("backlog"), // 'backlog' | 'visited' | 'skipped'
  rating: integer("rating"), // 1-5, nullable, only after visited
  tags: text("tags"), // JSON array string e.g. '["cheap","outdoor"]'
  externalId: text("external_id"), // e.g. Foursquare fsq_id
  externalSource: text("external_source"), // e.g. 'foursquare'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const trips = pgTable("trips", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  name: text("name").notNull(),
  cities: text("cities").notNull(), // JSON array of city strings
  startDate: text("start_date"), // nullable ISO date string
  endDate: text("end_date"), // nullable ISO date string
  status: text("status").notNull().default("planning"), // 'planning' | 'active' | 'done'
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tripPlaces = pgTable("trip_places", {
  id: text("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  placeId: text("place_id")
    .notNull()
    .references(() => places.id, { onDelete: "cascade" }),
  days: text("days"), // JSON int array e.g. '[1,3]' — which days of the trip; null/empty = unscheduled
  order: integer("order"), // sort order within a day or unscheduled list
  note: text("note"), // trip-specific note, separate from the place's global notes
});

export type Place = typeof places.$inferSelect;
export type NewPlace = typeof places.$inferInsert;
export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;
export type TripPlace = typeof tripPlaces.$inferSelect;
export type NewTripPlace = typeof tripPlaces.$inferInsert;
