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

export const STATE_LANGUAGE_MAP: Record<string, LocationLanguageMatch> = {
  "Bihar": { code: "hi", native: "हिंदी", english: "Hindi", secondaryCodes: ["mai", "ur"] },
  "Uttar Pradesh": { code: "hi", native: "हिंदी", english: "Hindi", secondaryCodes: ["ur"] },
  "West Bengal": { code: "bn", native: "বাংলা", english: "Bengali", secondaryCodes: ["sat", "ne"] },
  "Maharashtra": { code: "mr", native: "मराठी", english: "Marathi", secondaryCodes: ["kok", "hi"] },
  "Tamil Nadu": { code: "ta", native: "தமிழ்", english: "Tamil", secondaryCodes: ["en"] },
  "Andhra Pradesh": { code: "te", native: "తెలుగు", english: "Telugu", secondaryCodes: ["ur"] },
  "Telangana": { code: "te", native: "తెలుగు", english: "Telugu", secondaryCodes: ["ur"] },
  "Karnataka": { code: "kn", native: "ಕನ್ನಡ", english: "Kannada", secondaryCodes: ["kok"] },
  "Gujarat": { code: "gu", native: "ગુજરાતી", english: "Gujarati", secondaryCodes: ["sd"] },
  "Kerala": { code: "ml", native: "മലയാളം", english: "Malayalam", secondaryCodes: ["en"] },
  "Punjab": { code: "pa", native: "ਪੰਜਾਬੀ", english: "Punjabi", secondaryCodes: ["hi"] },
  "Odisha": { code: "or", native: "ଓଡ଼ିଆ", english: "Odia", secondaryCodes: ["sat"] },
  "Assam": { code: "as", native: "অসমীয়া", english: "Assamese", secondaryCodes: ["brx", "bn"] },
  "Rajasthan": { code: "hi", native: "हिंदी", english: "Hindi", secondaryCodes: ["ur"] },
  "Madhya Pradesh": { code: "hi", native: "हिंदी", english: "Hindi", secondaryCodes: ["ur"] },
  "Haryana": { code: "hi", native: "हिंदी", english: "Hindi", secondaryCodes: ["pa"] },
  "Delhi": { code: "hi", native: "हिंदी", english: "Hindi", secondaryCodes: ["ur", "pa"] },
  "Jharkhand": { code: "hi", native: "हिंदी", english: "Hindi", secondaryCodes: ["sat", "ur"] },
  "Chhattisgarh": { code: "hi", native: "हिंदी", english: "Hindi", secondaryCodes: ["ur"] },
  "Uttarakhand": { code: "hi", native: "हिंदी", english: "Hindi", secondaryCodes: ["ur"] },
  "Himachal Pradesh": { code: "hi", native: "हिंदी", english: "Hindi", secondaryCodes: ["doi"] },
  "Jammu and Kashmir": { code: "ks", native: "کٲشُر", english: "Kashmiri", secondaryCodes: ["doi", "ur"] },
  "Goa": { code: "kok", native: "कोंकणी", english: "Konkani", secondaryCodes: ["mr"] },
  "Manipur": { code: "mni", native: "মৈতৈলোন্", english: "Manipuri", secondaryCodes: ["en"] },
  "Tripura": { code: "bn", native: "বাংলা", english: "Bengali", secondaryCodes: ["kok"] },
  "Sikkim": { code: "ne", native: "नेपाली", english: "Nepali", secondaryCodes: ["en"] },
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
];

export function getRecommendedLanguageForState(stateName: string): LocationLanguageMatch {
  if (!stateName) {
    return { code: "hi", native: "हिंदी", english: "Hindi" };
  }
  const clean = stateName.trim();
  for (const [sKey, match] of Object.entries(STATE_LANGUAGE_MAP)) {
    if (clean.toLowerCase().includes(sKey.toLowerCase()) || sKey.toLowerCase().includes(clean.toLowerCase())) {
      return match;
    }
  }
  return { code: "hi", native: "हिंदी", english: "Hindi" };
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
      // Default to Bihar / All-India Hindi
      return { state: "Bihar", language: getRecommendedLanguageForState("Bihar") };
    }
  } catch {
    // ignore
  }

  return { state: "All India", language: { code: "hi", native: "हिंदी", english: "Hindi" } };
}

