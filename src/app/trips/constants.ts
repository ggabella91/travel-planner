export const STATUS_COLORS: Record<string, string> = {
  planning: "bg-sky-100 text-sky-700 border-sky-200",
  active:   "bg-emerald-100 text-emerald-700 border-emerald-200",
  done:     "bg-muted text-muted-foreground border-border",
};

export const STATUS_LABELS: Record<string, string> = {
  planning: "Planning",
  active:   "Active",
  done:     "Done",
};

export const STATUS_ICONS: Record<string, string> = {
  all:      "✦",
  planning: "✈️",
  active:   "🌍",
  done:     "✅",
};

export const STATUS_CARD_ACCENT: Record<string, string> = {
  planning: "border-l-sky-400",
  active:   "border-l-emerald-400",
  done:     "border-l-border",
};

export const STATUSES = [
  { value: "planning", label: "Planning" },
  { value: "active",   label: "Active" },
  { value: "done",     label: "Done" },
];
