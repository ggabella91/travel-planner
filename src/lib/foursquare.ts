// Foursquare Places API helpers

export interface FoursquareSuggestion {
  fsqId: string;
  name: string;
  city: string;
  state: string;
  country: string;
  category: string; // mapped to our 6 categories
  categoryIcon: string;
  categoryLabel: string; // raw Foursquare label for display
}

// Map Foursquare top-level category name → our simplified category
const FSQ_CATEGORY_MAP: Record<string, string> = {
  "Dining and Drinking": "restaurant", // refined below by subcategory
  "Arts and Entertainment": "activity",
  "Outdoors and Recreation": "activity",
  "Sports": "activity",
  "Landmarks and Outdoors": "spot",
  "Retail": "spot",
  "Travel and Transportation": "spot",
  "Community and Government": "spot",
  "Health and Medicine": "spot",
  "Business and Professional Services": "spot",
};

const FSQ_BAR_KEYWORDS = ["bar", "nightlife", "pub", "brewery", "cocktail", "lounge", "club"];
const FSQ_CAFE_KEYWORDS = ["café", "cafe", "coffee", "tea", "bakery", "patisserie"];

export function mapFoursquareCategory(categories: Array<{ name: string; short_name?: string }> | undefined): string {
  if (!categories || categories.length === 0) return "spot";

  const primary = categories[0];
  const nameLower = primary.name.toLowerCase();

  // Check for bar/nightlife keywords
  if (FSQ_BAR_KEYWORDS.some((k) => nameLower.includes(k))) return "bar";
  // Check for cafe keywords
  if (FSQ_CAFE_KEYWORDS.some((k) => nameLower.includes(k))) return "cafe";

  // Check top-level breadcrumb via the full name
  for (const [fsqTop, ourCategory] of Object.entries(FSQ_CATEGORY_MAP)) {
    if (nameLower.includes(fsqTop.toLowerCase()) || primary.name.startsWith(fsqTop)) {
      return ourCategory;
    }
  }

  // Fallback: if it has "restaurant" or food-like in name
  if (nameLower.includes("restaurant") || nameLower.includes("food") || nameLower.includes("diner")) {
    return "restaurant";
  }

  return "spot";
}

// ISO 3166-1 alpha-2 → full country name for the most common travel destinations
const COUNTRY_CODES: Record<string, string> = {
  US: "United States", GB: "United Kingdom", FR: "France", DE: "Germany",
  IT: "Italy", ES: "Spain", JP: "Japan", CN: "China", KR: "South Korea",
  TH: "Thailand", VN: "Vietnam", ID: "Indonesia", MY: "Malaysia",
  SG: "Singapore", PH: "Philippines", IN: "India", MX: "Mexico",
  BR: "Brazil", AR: "Argentina", CO: "Colombia", PE: "Peru",
  PT: "Portugal", NL: "Netherlands", BE: "Belgium", CH: "Switzerland",
  AT: "Austria", SE: "Sweden", NO: "Norway", DK: "Denmark", FI: "Finland",
  PL: "Poland", CZ: "Czech Republic", HU: "Hungary", GR: "Greece",
  TR: "Turkey", EG: "Egypt", MA: "Morocco", ZA: "South Africa",
  AU: "Australia", NZ: "New Zealand", CA: "Canada", AE: "United Arab Emirates",
  IL: "Israel", NG: "Nigeria", KE: "Kenya", TZ: "Tanzania",
  GH: "Ghana", CL: "Chile", UY: "Uruguay", EC: "Ecuador",
  CR: "Costa Rica", PA: "Panama", CU: "Cuba", DO: "Dominican Republic",
  JM: "Jamaica", TT: "Trinidad and Tobago", HK: "Hong Kong", TW: "Taiwan",
  MO: "Macao", MM: "Myanmar", KH: "Cambodia", LA: "Laos",
  BD: "Bangladesh", PK: "Pakistan", LK: "Sri Lanka", NP: "Nepal",
  UA: "Ukraine", RO: "Romania", RS: "Serbia", HR: "Croatia", SI: "Slovenia",
  SK: "Slovakia", BG: "Bulgaria", LT: "Lithuania", LV: "Latvia", EE: "Estonia",
  IS: "Iceland", IE: "Ireland", CY: "Cyprus", MT: "Malta",
  RU: "Russia", KZ: "Kazakhstan", UZ: "Uzbekistan",
};

export function resolveCountryCode(code: string | undefined): string {
  if (!code) return "";
  return COUNTRY_CODES[code.toUpperCase()] ?? code;
}
