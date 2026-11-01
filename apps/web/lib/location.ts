/**
 * Location and Geolocation Intelligence for Civic Pulse.
 * Maps Indian States/UTs to the 22 Scheduled Constitutional Languages of the 8th Schedule.
 */

export interface LocationLanguageMatch {
  code: string;
  native: string;
  english: string;
  secondaryCodes?: string[];
}

export interface ConstitutionalLanguage {
  code: string;
  english: string;
  native: string;
  scriptName: string;
}

/** The 22 Scheduled Constitutional Languages of the Republic of India (8th Schedule) + English */
export const CONSTITUTIONAL_22_LANGUAGES: ConstitutionalLanguage[] = [
  { code: "hi", english: "Hindi", native: "हिन्दी", scriptName: "हिन्दी" },
  { code: "en", english: "English", native: "English", scriptName: "English" },
  { code: "bn", english: "Bengali", native: "বাংলা", scriptName: "বাংলা" },
  { code: "te", english: "Telugu", native: "తెలుగు", scriptName: "తెలుగు" },
  { code: "mr", english: "Marathi", native: "मराठी", scriptName: "मराठी" },
  { code: "ta", english: "Tamil", native: "தமிழ்", scriptName: "தமிழ்" },
  { code: "ur", english: "Urdu", native: "اردو", scriptName: "اردو" },
  { code: "gu", english: "Gujarati", native: "ગુજરાતી", scriptName: "ગુજરાતી" },
  { code: "kn", english: "Kannada", native: "ಕನ್ನಡ", scriptName: "ಕನ್ನಡ" },
  { code: "ml", english: "Malayalam", native: "മലയാളം", scriptName: "മലയാളം" },
  { code: "or", english: "Odia", native: "ଓଡ଼ିଆ", scriptName: "ଓଡ଼ିଆ" },
  { code: "pa", english: "Punjabi", native: "ਪੰਜਾਬੀ", scriptName: "ਪੰਜਾਬੀ" },
  { code: "as", english: "Assamese", native: "অসমীয়া", scriptName: "অসমীয়া" },
  { code: "mai", english: "Maithili", native: "मैथिली", scriptName: "मैथिली" },
  { code: "sat", english: "Santali", native: "ᱥᱟᱱᱛᱟᱲᱤ", scriptName: "ᱥᱟᱱᱛᱟᱲᱤ" },
  { code: "ks", english: "Kashmiri", native: "کٲشُر", scriptName: "کٲشُر" },
  { code: "ne", english: "Nepali", native: "नेपाली", scriptName: "नेपाली" },
  { code: "kok", english: "Konkani", native: "कोंकणी", scriptName: "कोंकणी" },
  { code: "sd", english: "Sindhi", native: "سنڌي", scriptName: "सिंधी" },
  { code: "doi", english: "Dogri", native: "डोगरी", scriptName: "डोगरी" },
  { code: "mni", english: "Manipuri", native: "মৈতৈলোন্", scriptName: "মৈতৈলোন্" },
  { code: "brx", english: "Bodo", native: "बर'", scriptName: "बर'" },
  { code: "sa", english: "Sanskrit", native: "संस्कृतम्", scriptName: "संस्कृतम्" },
];

export const STATE_LANGUAGE_MAP: Record<string, LocationLanguageMatch> = {
  "Bihar": { code: "hi", native: "हिंदी", english: "Hindi", secondaryCodes: ["mai", "ur", "en", "bn"] },
  "Uttar Pradesh": { code: "hi", native: "हिंदी", english: "Hindi", secondaryCodes: ["ur", "en"] },
  "West Bengal": { code: "bn", native: "বাংলা", english: "Bengali", secondaryCodes: ["hi", "en", "sat", "ne", "or"] },
  "Maharashtra": { code: "mr", native: "मराठी", english: "Marathi", secondaryCodes: ["hi", "en", "gu", "kok"] },
  "Tamil Nadu": { code: "ta", native: "தமிழ்", english: "Tamil", secondaryCodes: ["en", "te", "ml", "hi"] },
  "Andhra Pradesh": { code: "te", native: "తెలుగు", english: "Telugu", secondaryCodes: ["en", "ur", "hi", "ta"] },
  "Telangana": { code: "te", native: "తెలుగు", english: "Telugu", secondaryCodes: ["en", "ur", "hi", "mr"] },
  "Karnataka": { code: "kn", native: "ಕನ್ನಡ", english: "Kannada", secondaryCodes: ["en", "hi", "te", "ta", "mr"] },
  "Gujarat": { code: "gu", native: "ગુજરાતી", english: "Gujarati", secondaryCodes: ["hi", "en", "mr", "sd"] },
  "Kerala": { code: "ml", native: "മലയാളം", english: "Malayalam", secondaryCodes: ["en", "ta", "hi"] },
  "Punjab": { code: "pa", native: "ਪੰਜਾਬੀ", english: "Punjabi", secondaryCodes: ["hi", "en", "ur"] },
  "Odisha": { code: "or", native: "ଓଡ଼ିଆ", english: "Odia", secondaryCodes: ["hi", "en", "bn", "te"] },
  "Assam": { code: "as", native: "অসমীয়া", english: "Assamese", secondaryCodes: ["bn", "en", "hi", "brx"] },
  "Rajasthan": { code: "hi", native: "हिंदी", english: "Hindi", secondaryCodes: ["en", "ur", "pa"] },
  "Madhya Pradesh": { code: "hi", native: "हिंदी", english: "Hindi", secondaryCodes: ["en", "ur"] },
  "Haryana": { code: "hi", native: "हिंदी", english: "Hindi", secondaryCodes: ["pa", "en", "ur"] },
  "Delhi": { code: "hi", native: "हिंदी", english: "Hindi", secondaryCodes: ["en", "pa", "ur"] },
  "Jharkhand": { code: "hi", native: "हिंदी", english: "Hindi", secondaryCodes: ["bn", "sat", "ur", "en"] },
  "Chhattisgarh": { code: "hi", native: "हिंदी", english: "Hindi", secondaryCodes: ["en", "ur", "or"] },
  "Uttarakhand": { code: "hi", native: "हिंदी", english: "Hindi", secondaryCodes: ["en", "ur", "pa"] },
  "Himachal Pradesh": { code: "hi", native: "हिंदी", english: "Hindi", secondaryCodes: ["doi", "en", "pa"] },
  "Jammu and Kashmir": { code: "ks", native: "کٲشُر", english: "Kashmiri", secondaryCodes: ["ur", "doi", "hi", "en"] },
  "Goa": { code: "kok", native: "कोंकणी", english: "Konkani", secondaryCodes: ["mr", "en", "hi"] },
  "Manipur": { code: "mni", native: "মৈতৈলোন্", english: "Manipuri", secondaryCodes: ["en", "bn", "hi"] },
  "Tripura": { code: "bn", native: "বাংলা", english: "Bengali", secondaryCodes: ["en", "hi", "kok"] },
  "Sikkim": { code: "ne", native: "नेपाली", english: "Nepali", secondaryCodes: ["en", "hi", "bn"] },
  "Arunachal Pradesh": { code: "en", native: "English", english: "English", secondaryCodes: ["hi", "as", "bn"] },
  "Meghalaya": { code: "en", native: "English", english: "English", secondaryCodes: ["hi", "bn", "as"] },
  "Mizoram": { code: "en", native: "English", english: "English", secondaryCodes: ["hi", "bn"] },
  "Nagaland": { code: "en", native: "English", english: "English", secondaryCodes: ["hi", "as"] },
  "Ladakh": { code: "hi", native: "हिंदी", english: "Hindi", secondaryCodes: ["ur", "en"] },
  "Puducherry": { code: "ta", native: "தமிழ்", english: "Tamil", secondaryCodes: ["en", "te", "ml", "fr"] },
  "Chandigarh": { code: "pa", native: "ਪੰਜਾਬੀ", english: "Punjabi", secondaryCodes: ["hi", "en"] },
};

// Coordinate bounding boxes for Indian regions
const STATE_BOUNDS: { state: string; minLat: number; maxLat: number; minLng: number; maxLng: number }[] = [
  { state: "Bihar", minLat: 24.2, maxLat: 27.6, minLng: 83.2, maxLng: 88.3 },
  { state: "West Bengal", minLat: 21.4, maxLat: 27.3, minLng: 85.8, maxLng: 89.9 },
  { state: "Maharashtra", minLat: 15.6, maxLat: 22.1, minLng: 72.5, maxLng: 80.9 },
  { state: "Tamil Nadu", minLat: 8.0, maxLat: 13.6, minLng: 76.2, maxLng: 80.4 },
  { state: "Karnataka", minLat: 11.5, maxLat: 18.5, minLng: 74.0, maxLng: 78.6 },
  { state: "Gujarat", minLat: 20.1, maxLat: 24.7, minLng: 68.1, maxLng: 74.5 },
  { state: "Kerala", minLat: 8.2, maxLat: 12.9, minLng: 74.8, maxLng: 77.5 },
  { state: "Punjab", minLat: 29.5, maxLat: 32.6, minLng: 73.8, maxLng: 76.9 },
  { state: "Uttar Pradesh", minLat: 23.8, maxLat: 30.5, minLng: 77.0, maxLng: 84.7 },
  { state: "Delhi", minLat: 28.3, maxLat: 28.9, minLng: 76.8, maxLng: 77.4 },
  { state: "Rajasthan", minLat: 23.0, maxLat: 30.2, minLng: 69.5, maxLng: 78.3 },
  { state: "Andhra Pradesh", minLat: 12.5, maxLat: 19.9, minLng: 76.8, maxLng: 84.8 },
  { state: "Telangana", minLat: 15.8, maxLat: 19.9, minLng: 77.2, maxLng: 81.8 },
  { state: "Odisha", minLat: 17.8, maxLat: 22.6, minLng: 81.4, maxLng: 87.5 },
  { state: "Assam", minLat: 24.0, maxLat: 28.2, minLng: 89.7, maxLng: 96.0 },
  { state: "Madhya Pradesh", minLat: 21.0, maxLat: 26.9, minLng: 74.0, maxLng: 82.8 },
  { state: "Arunachal Pradesh", minLat: 26.6, maxLat: 29.5, minLng: 91.5, maxLng: 97.5 },
];

export function getRecommendedLanguageForState(stateName: string): LocationLanguageMatch {
  if (!stateName) {
    return { code: "hi", native: "हिंदी", english: "Hindi", secondaryCodes: ["en", "bn", "te"] };
  }
  const clean = stateName.trim();
  for (const [sKey, match] of Object.entries(STATE_LANGUAGE_MAP)) {
    if (clean.toLowerCase().includes(sKey.toLowerCase()) || sKey.toLowerCase().includes(clean.toLowerCase())) {
      return match;
    }
  }
  return { code: "hi", native: "हिंदी", english: "Hindi", secondaryCodes: ["en", "bn", "te"] };
}

/**
 * Returns prioritized primary regional language chips tailored to the citizen's location,
 * along with the complete 22 Constitutional Languages catalogue.
 */
export function getLanguagesForState(stateName?: string): {
  primary: ConstitutionalLanguage[];
  all: ConstitutionalLanguage[];
} {
  const all = CONSTITUTIONAL_22_LANGUAGES;
  if (!stateName || stateName.toLowerCase().includes("all india") || stateName === "-") {
    // Default national priority: Hindi, English, Bengali, Tamil, Telugu, Marathi
    const defaultCodes = ["hi", "en", "bn", "ta", "te", "mr", "gu"];
    const primary = defaultCodes
      .map((c) => all.find((item) => item.code === c))
      .filter((x): x is ConstitutionalLanguage => Boolean(x));
    return { primary, all };
  }

  const match = getRecommendedLanguageForState(stateName);
  const prioritizedCodes = [match.code, ...(match.secondaryCodes || [])];

  // Guarantee English and Hindi are always accessible in quick chips
  if (!prioritizedCodes.includes("en")) prioritizedCodes.push("en");
  if (!prioritizedCodes.includes("hi")) prioritizedCodes.push("hi");

  const primary: ConstitutionalLanguage[] = [];
  for (const code of prioritizedCodes) {
    const found = all.find((item) => item.code === code);
    if (found && !primary.some((p) => p.code === found.code)) {
      primary.push(found);
    }
    if (primary.length >= 6) break;
  }

  return { primary, all };
}

export function detectStateFromCoordinates(latitude: number, longitude: number): string | null {
  for (const bound of STATE_BOUNDS) {
    if (
      latitude >= bound.minLat &&
      latitude <= bound.maxLat &&
      longitude >= bound.minLng &&
      longitude <= bound.maxLng
    ) {
      return bound.state;
    }
  }
  return null;
}

export async function detectUserLocation(): Promise<{
  state: string;
  language: LocationLanguageMatch;
} | null> {
  if (typeof window === "undefined") return null;

  // 1. Try Browser Geolocation API if granted
  if ("geolocation" in navigator) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000, maximumAge: 300000 });
      });
      const state = detectStateFromCoordinates(pos.coords.latitude, pos.coords.longitude);
      if (state) {
        return { state, language: getRecommendedLanguageForState(state) };
      }
    } catch {
      // User denied permission or timeout, gracefully fall back
    }
  }

  // 2. Fallback to Timezone / Locale heuristics
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && tz.includes("Kolkata")) {
      return { state: "Bihar", language: getRecommendedLanguageForState("Bihar") };
    }
  } catch {
    // ignore
  }

  return { state: "All India", language: { code: "hi", native: "हिंदी", english: "Hindi" } };
}
