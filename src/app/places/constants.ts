export const STATUS_LABELS: Record<string, string> = {
  all:     "All",
  backlog: "Backlog",
  visited: "Visited",
  skipped: "Skipped",
};

export const STATUS_ICONS: Record<string, string> = {
  all:     "✦",
  backlog: "🔖",
  visited: "✅",
  skipped: "⏭️",
};

export const CATEGORIES = [
  { value: "restaurant",   label: "Restaurant" },
  { value: "bar",          label: "Bar" },
  { value: "cafe",         label: "Cafe" },
  { value: "neighborhood", label: "Neighborhood" },
  { value: "activity",     label: "Activity" },
  { value: "spot",         label: "Spot" },
];

export const SOURCES = [
  { value: "instagram", label: "Instagram" },
  { value: "reddit",    label: "Reddit" },
  { value: "friend",    label: "Friend" },
];

export const SOURCE_LABELS: Record<string, string> = {
  instagram: "Instagram",
  reddit:    "Reddit",
  friend:    "Friend",
};

export const STATUSES = [
  { value: "backlog",  label: "Backlog" },
  { value: "visited",  label: "Visited" },
  { value: "skipped",  label: "Skipped" },
];

export const RATINGS = [1, 2, 3, 4, 5];
