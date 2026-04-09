# Tags on Places: Input, Display, and Filter

**Date:** 2026-04-09
**Issue:** travel-planner-uso
**Status:** approved

## Overview

Wire up the existing `tags` column on the `places` table with a full UI layer: free-form tag input with autocomplete in the add/edit forms, chip display on place cards, and multi-select tag filtering in the backlog.

No schema migration needed — `tags text` already exists on the `places` table as a JSON string array (e.g. `'["cheap","outdoor"]'`).

## Data & API

### Schema
`places.tags` — existing column, `text`, nullable. Stores a JSON-serialized string array. Null and `'[]'` are both treated as "no tags".

### `POST /api/places`
Accept optional `tags?: string[]` in the request body. Before inserting, serialize to `JSON.stringify(tags ?? [])`. No change to existing fields.

### `PATCH /api/places/[id]`
Accept optional `tags?: string[]` in the request body. If present, serialize to `JSON.stringify(tags)` and include in the update. If absent, leave the existing value unchanged.

### `GET /api/places/tags` *(new)*
Returns all unique tags across the authenticated user's places, sorted alphabetically.

- Auth required (same pattern as other `/api/places` routes)
- Reads all places for the user, parses each `tags` JSON field, deduplicates
- Returns `string[]`
- Used exclusively by `TagInput` for autocomplete suggestions

## TagInput Component

**File:** `src/components/tag-input.tsx`

A controlled component with this interface:

```ts
interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}
```

**Behavior:**
- On mount, fetches `GET /api/places/tags` to load autocomplete suggestions
- Renders current tags as chips with a `×` remove button each
- Text input appended inline after the chips
- Typing filters the suggestions list to matching existing tags + a "Create `{value}`…" option at the bottom (only shown when the typed value doesn't exactly match an existing tag)
- Confirm a tag: click a suggestion, press Enter, or press comma
- Remove a tag: click its `×` chip, or press Backspace when the input is empty and there's at least one tag
- Duplicate tags are silently ignored (case-insensitive check)
- Dropdown closes on Escape or when input loses focus

**Usage:** Added to both `src/components/add-place-sheet.tsx` and `src/components/place-detail-sheet.tsx` as a "Tags" field positioned below the Notes field.

## Place Cards

**File:** `src/app/page.tsx`

When a place has one or more tags, render them as small chips below the notes preview and above the action buttons. When `tags` is empty or null, render nothing — no empty space or placeholder.

Chip style: matches the existing tag chips in `TagInput` (small, rounded, muted background).

## Filter Sheet

**File:** `src/components/places-filter-sheet.tsx`

Add a "Tags" section below the existing Category and City filter sections.

- Renders one chip per unique tag across all loaded places (same dynamic derivation pattern as categories and cities)
- Multi-select: tapping a chip toggles it; multiple chips can be active simultaneously
- Tapping an already-selected chip deselects it
- No explicit "All" chip needed — zero selected tags = no tag filter active
- Active chips visually highlighted (same pattern as existing active filter chips)

**Filter state:** `filterTags: string[]` (empty array = no filter) added alongside `filterStatus`, `filterCategory`, `filterCity` in `src/app/page.tsx`.

**Filter logic:** A place passes the tag filter if `filterTags` is empty, OR if the place's tags array contains at least one tag from `filterTags` (OR logic).

**Filter count badge:** Increments by 1 if `filterTags.length > 0` — not by the number of selected tags.

## Out of Scope

- Tag rename / delete across all places
- Per-tag place counts
- Tag suggestions sourced from anything other than the user's own existing tags
- Case normalization beyond duplicate prevention (tags are stored as-entered)
