import { AustralianState } from "@propure/mcp-shared";

type GeocodeResult = {
  lat: number;
  lng: number;
  placeId?: string;
  bbounds?: {
    northeast: { lat: number; lng: number },
    southwest: { lat: number; lng: number }
  };
};

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY!;

type SearchCategory = "transport" | "commercial" | "education" | "health" | "retail";

const SEARCH_CATEGORIES: Record<SearchCategory, string[]> = {
  transport: [
    "subway_station",
    "train_station",
    "bus_station",
    "transit_station",
    "airport"
  ],
  commercial: [
    "office",
    "industrial_estate",
    "business_park",
    "corporate_office",
  ],
  education: [
    "school",
    "university",
  ],
  health: [
    "hospital",
    "medical_center",
  ],
  retail: [
    "shopping_mall",
    "supermarket",
    "movie_theater",
    "park",
  ]
}

const CATEGORY_WEIGHTS: Record<SearchCategory, number> = {
  transport: 3,
  commercial: 2.5,
  education: 2,
  health: 1.5,
  retail: 1,
};

const STATE_CBD_MAP: Record<AustralianState, string[]> = {
  NSW: [
    "Sydney CBD NSW",
    "Parramatta NSW",
    "North Sydney NSW",
    "Liverpool NSW",
    "Newcastle NSW",
    "Wollongong NSW"
  ],

  VIC: [
    "Melbourne CBD VIC",
    "Docklands VIC",
    "Box Hill VIC",
    "Dandenong VIC",
    "Geelong VIC"
  ],

  QLD: [
    "Brisbane CBD QLD",
    "Fortitude Valley QLD",
    "South Brisbane QLD",
    "Gold Coast QLD",
    "Surfers Paradise QLD",
    "Sunshine Coast QLD",
    "Townsville QLD",
    "Cairns QLD"
  ],

  WA: [
    "Perth CBD WA",
    "Subiaco WA",
    "Joondalup WA",
    "Fremantle WA"
  ],

  SA: [
    "Adelaide CBD SA",
    "North Adelaide SA"
  ],

  TAS: [
    "Hobart CBD TAS",
    "Launceston TAS"
  ],

  ACT: [
    "Canberra CBD ACT",
    "Belconnen ACT",
    "Woden ACT"
  ],

  NT: [
    "Darwin CBD NT",
    "Palmerston NT"
  ],
};


export const addressToCoordinatesGoogle = async (
  address: string
): Promise<GeocodeResult | null> => {
  try {
    const q = address.trim();
    if (!q) return null;

    const url =
      "https://maps.googleapis.com/maps/api/geocode/json?" +
      new URLSearchParams({ address: q, key: GOOGLE_MAPS_API_KEY });

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Google geocoding failed (${res.status})`);

    const data: {
      status: string;
      results: Array<{
        place_id: string;
        geometry: {
          location: { lat: number; lng: number },
          bounds: {
            northeast: { lat: number; lng: number },
            southwest: { lat: number; lng: number }
          },
          viewport: {
            northeast: { lat: number; lng: number },
            southwest: { lat: number; lng: number }
          }
        };
      }>;
      error_message?: string;
    } = await res.json() as any;

    if (data.status !== "OK" || !data.results.length) return null;

    const loc = data.results[0].geometry.location;
    const bounds = data.results[0].geometry.bounds || data.results[0].geometry.viewport;
    const place_id = data.results[0].place_id;
    return {
      lat: loc.lat,
      lng: loc.lng,
      placeId: place_id,
      bbounds: bounds
    };
  } catch (error) {
    console.error("addressToCoordinatesGoogle error:", error);
    return null;
  }
};

// ---------- DEMAND INFRASTRUCTURE SCORING ----------
async function fetchCategoryPlaces(
  lat: number,
  lng: number,
  type: string,
  radius: number
) {
  const url =
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json?" +
    new URLSearchParams({
      location: `${lat},${lng}`,
      radius: radius.toString(),
      type,
      key: GOOGLE_MAPS_API_KEY,
    });

  const res = await fetch(url);
  const data = await res.json() as any;

  return data.results ?? [];
}

async function fetchAllInfrastructure(lat: number, lng: number) {
  const categoryCounts: Record<SearchCategory, number> = {
    transport: 0,
    commercial: 0,
    education: 0,
    health: 0,
    retail: 0,
  };

  const promises = [];

  for (const category of Object.keys(SEARCH_CATEGORIES) as SearchCategory[]) {
    for (const type of SEARCH_CATEGORIES[category]) {
      promises.push(
        fetchCategoryPlaces(lat, lng, type, 5000).then(places => {
          categoryCounts[category] += places.length;
        })
      );
    }
  }

  await Promise.all(promises);

  return categoryCounts;
}

export const calculateDemandInfrastructureScore = async (suburb: string, population: number, radius: number = 5000) => {
  try {
    const geocode = await addressToCoordinatesGoogle(suburb);
    if (!geocode) {
      throw new Error(`Failed to geocode suburb: ${suburb}`);
    };
    const { lat, lng } = geocode;
    const categoryCounts = await fetchAllInfrastructure(lat, lng);

    let score = 0;
    for (const category of Object.keys(categoryCounts) as SearchCategory[]) {
      score += categoryCounts[category] * CATEGORY_WEIGHTS[category];
    }

    const perCapitaScore = score / population;
    const lowestScore = 0.00005; // based on observed data, to prevent extreme outliers
    const highestScore = 0.0035; // based on observed data, to prevent extreme outliers
    const clamped = Math.min(Math.max(perCapitaScore, lowestScore), highestScore);

    const normalized =
    ((clamped - lowestScore) / (highestScore - lowestScore)) *
      (10 - 0) +
    0;

    return normalized;
  } catch (error) {
    console.error("Error calculating demand infrastructure score:", error);
    return null;
  }
}

// ---------- CBD PROXIMITY ----------
async function getDistanceToCBDs(
  suburb: string, // format "Suburb VIC 1234" 
  state: AustralianState,
) {
  const cbds = STATE_CBD_MAP[state];
  if (!cbds?.length) return null;

  const destinations = cbds.join("|");

  const url =
    "https://maps.googleapis.com/maps/api/distancematrix/json?" +
    new URLSearchParams({
      origins: suburb,
      destinations,
      mode: "driving",
      key: GOOGLE_MAPS_API_KEY,
    });

  const res = await fetch(url);
  const data = await res.json() as any;

  const elements = data?.rows?.[0]?.elements;
  if (!elements?.length) return null;

  const distancesKm = elements
    .filter((e: any) => e.status === "OK")
    .map((e: any) => e.distance.value / 1000); // meters → km

  if (!distancesKm.length) return null;

  return Math.min(...distancesKm); // nearest CBD
}

function calculateCBDProximityScore(distanceKm: number) {
  if (distanceKm == null) return null;

  const maxDistance = 50;

  const clamped = Math.min(distanceKm, maxDistance);

  const score = ((maxDistance - clamped) / maxDistance) * 100;

  return Math.round(score);
}

export async function calculateSuburbCBDScore(
  suburb: string,
  state: AustralianState,
) {
  const distanceKm = await getDistanceToCBDs(
    suburb,
    state,
  );

  if (distanceKm == null) return null;

  const score = calculateCBDProximityScore(distanceKm);

  return score;
}
