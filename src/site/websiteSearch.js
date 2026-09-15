/* Hero search data layer.
   VITE_WEBSITE_SEARCH_LIVE=true  → real requests: cities from the public locations API, listings from
                                    same-origin GET /api/public/website-search (docs/B39 contract).
   anything else (default)        → in-memory mock that returns the exact same shapes, with a network-like
                                    delay, the same validation, and the 12-result cap. Flip the flag once
                                    the endpoint is deployed; the UI does not change.
   Errors are thrown as SearchError with kind: "validation" | "rate_limited" | "unavailable".
   Aborts rethrow the native AbortError so callers can ignore them. */

const LIVE = import.meta.env.VITE_WEBSITE_SEARCH_LIVE === "true";

// Overridable so local dev can point at a local API through the Vite dev proxy.
const CITIES_URL = import.meta.env.VITE_LOCATIONS_API_URL || "https://api.pasabayan.com/api/locations/search";
const SEARCH_URL = "/api/public/website-search";
const MAX_RESULTS = 12;

export class SearchError extends Error {
  constructor(kind, status) {
    super(kind);
    this.name = "SearchError";
    this.kind = kind;
    this.status = status;
  }
}

export const isAbort = (e) => e?.name === "AbortError";

export function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function searchCities(q, { signal } = {}) {
  return LIVE ? liveCities(q, signal) : mockCities(q, signal);
}

export function searchListings(params, { signal } = {}) {
  return LIVE ? liveListings(params, signal) : mockListings(params, signal);
}

/* ---------------- LIVE ---------------- */

function statusToKind(status) {
  if (status === 422) return "validation";
  if (status === 429) return "rate_limited";
  return "unavailable";
}

async function getJSON(url, signal) {
  let res;
  try {
    res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  } catch (e) {
    if (isAbort(e)) throw e;
    throw new SearchError("unavailable", 0);
  }
  if (!res.ok) throw new SearchError(statusToKind(res.status), res.status);
  try {
    const json = await res.json();
    if (!json?.success) throw new Error("unsuccessful");
    return json.data;
  } catch (e) {
    if (isAbort(e)) throw e;
    throw new SearchError("unavailable", res.status);
  }
}

async function liveCities(q, signal) {
  const term = (q || "").trim();
  if (term.length < 2) return [];
  const data = await getJSON(`${CITIES_URL}?${new URLSearchParams({ q: term })}`, signal);
  return Array.isArray(data) ? data : [];
}

async function liveListings({ type, fromCityId, toCityId, date }, signal) {
  const qs = new URLSearchParams();
  for (const [k, v] of [["type", type], ["from_city_id", fromCityId], ["to_city_id", toCityId], ["date", date]]) {
    if (v != null && v !== "") qs.set(k, String(v));
  }
  const data = await getJSON(`${SEARCH_URL}?${qs}`, signal);
  const results = Array.isArray(data?.results) ? data.results.slice(0, MAX_RESULTS) : [];
  return { type: data?.type ?? type, results, has_more: Boolean(data?.has_more) };
}

/* ---------------- MOCK ---------------- */

function delay(min, max, signal) {
  return new Promise((resolve, reject) => {
    const abortErr = () => new DOMException("Aborted", "AbortError");
    if (signal?.aborted) return reject(abortErr());
    const t = setTimeout(resolve, min + Math.random() * (max - min));
    signal?.addEventListener("abort", () => { clearTimeout(t); reject(abortErr()); }, { once: true });
  });
}

const MOCK_CITIES = [
  [1001, "Toronto", "ON", 43.6532, -79.3832],
  [1002, "Montreal", "QC", 45.5019, -73.5674],
  [1003, "Vancouver", "BC", 49.2827, -123.1207],
  [1004, "Calgary", "AB", 51.0447, -114.0719],
  [1005, "Ottawa", "ON", 45.4215, -75.6972],
  [1006, "Quebec City", "QC", 46.8139, -71.208],
  [1007, "Edmonton", "AB", 53.5461, -113.4938],
  [1008, "Winnipeg", "MB", 49.8951, -97.1384],
  [1009, "Halifax", "NS", 44.6488, -63.5752],
  [1010, "Mississauga", "ON", 43.589, -79.6441],
].map(([id, name, state_code, lat, lng]) => ({
  id, name, display: `${name}, ${state_code}`, result_type: "city", state_code, country_code: "CA", lat, lng,
}));

const person = (display_name, rating, total_ratings, verification_level) => ({ display_name, rating, total_ratings, verification_level });

function trip(from, to, method, pickupIn, days, kg, pricing, price, carrier) {
  return {
    origin_city: from, origin_country: "Canada", destination_city: to, destination_country: "Canada",
    transportation_method: method, pickup_date: todayISO(pickupIn), delivery_date: todayISO(pickupIn + days),
    available_weight_kg: kg, pricing_type: pricing,
    price_per_kg: pricing === "per_kg" ? price : null, flat_trip_price: pricing === "flat" ? price : null,
    carrier,
  };
}

function pkg(from, to, service, type, kg, urgency, pickupIn, flexible, deliverIn, budget, shipper) {
  return {
    pickup_city: from, pickup_country: "Canada", delivery_city: to, delivery_country: "Canada",
    service_type: service, package_type: type, package_weight_kg: kg, urgency_level: urgency,
    pickup_date_preferred: pickupIn == null ? null : todayISO(pickupIn), pickup_date_flexible: flexible,
    delivery_date_needed: deliverIn == null ? null : todayISO(deliverIn), max_price_budget: budget,
    shipper,
  };
}

const CORRIDOR_NAMES = [["Mark D.", 4.7, 15], ["Ana C.", 4.9, 38], ["Tom B.", 0, 0], ["Rhea V.", 4.5, 11], ["Sam O.", 4.8, 22], ["Leah P.", 5, 3], ["Ivan K.", 4.2, 8], ["Mia J.", 4.6, 19], ["Noah E.", 4.9, 64], ["Jess A.", 4.4, 6], ["Raj S.", 4.8, 29], ["Bea M.", 0, 0]];
const LEVELS = ["id_verified", "phone_verified", "unverified"];

/* Toronto → Montreal is the busy corridor: 13 trips and 13 packages, so that query returns has_more. */
function mockTrips() {
  const base = [
    trip("Toronto", "Montreal", "car", 3, 1, 50, "per_kg", 2.5, person("James L.", 4.8, 23, "id_verified")),
    trip("Vancouver", "Calgary", "plane", 5, 0, 12.5, "per_kg", 4, person("Maria S.", 4.9, 41, "id_verified")),
    trip("Ottawa", "Quebec City", "bus", 2, 1, 30, "per_kg", 3.5, person("Paolo R.", 4.6, 12, "phone_verified")),
    trip("Calgary", "Edmonton", "car", 1, 0, 80, "flat", 60, person("Sarah K.", null, 0, "unverified")),
    trip("Toronto", "Ottawa", "train", 4, 0, 20, "per_kg", 3, person("Andre M.", 4.7, 9, "id_verified")),
    trip("Montreal", "Toronto", "car", 6, 1, 40, "flat", 120, person("Chloe T.", 5, 6, "phone_verified")),
    trip("Winnipeg", "Toronto", "plane", 9, 0, 15, "per_kg", 5.5, person("Ben D.", 4.5, 18, "id_verified")),
    trip("Halifax", "Montreal", "train", 7, 1, 25, "per_kg", 3.25, person("Grace N.", 4.9, 33, "id_verified")),
    trip("Mississauga", "Montreal", "car", 3, 0, 60, "flat", 95, person("Luis F.", 4.4, 7, "unverified")),
    trip("Edmonton", "Vancouver", "plane", 12, 0, 10, "per_kg", 6, person("Nina P.", null, 0, "phone_verified")),
    trip("Toronto", "Vancouver", "plane", 14, 0, 18, "flat", 150, person("Omar H.", 4.8, 27, "id_verified")),
    trip("Quebec City", "Montreal", "bus", 2, 0, 35, "per_kg", 2, person("Julie B.", 4.3, 5, "unverified")),
    trip("Vancouver", "Toronto", "plane", 20, 0, 12, "per_kg", 5, person("Kenji W.", 4.9, 52, "id_verified")),
    trip("Ottawa", "Toronto", "car", 8, 0, 45, "flat", 80, person("Priya G.", 4.6, 14, "phone_verified")),
  ];
  const methods = ["car", "bus", "train", "car"];
  const corridor = CORRIDOR_NAMES.map(([n, r, c], i) => i % 3 === 2
    ? trip("Toronto", "Montreal", methods[i % 4], 2 * i + 1, 1, 15 + 5 * i, "flat", 70 + 5 * i, person(n, r, c, LEVELS[i % 3]))
    : trip("Toronto", "Montreal", methods[i % 4], 2 * i + 1, i % 2, 15 + 5 * i, "per_kg", 2 + 0.25 * (i % 4), person(n, r, c, LEVELS[i % 3])));
  return [...base, ...corridor];
}

function mockPackages() {
  const base = [
    pkg("Toronto", "Montreal", "package_delivery", "small_box", 2.5, "normal", 4, true, 10, 45, person("Rosa D.", 4.9, 17, "id_verified")),
    pkg("Vancouver", "Calgary", "package_delivery", "documents", 0.5, "urgent", 1, false, 3, 60, person("Kevin T.", 4.7, 8, "phone_verified")),
    pkg("Ottawa", "Montreal", "grocery", "food", 6, "normal", null, true, null, 35, person("Liza M.", null, 0, "unverified")),
    pkg("Calgary", "Vancouver", "package_delivery", "electronics", 1.8, "high", 5, false, 9, 90, person("Daniel W.", 4.8, 30, "id_verified")),
    pkg("Montreal", "Quebec City", "pharmacy", "small_box", 0.8, "urgent", 2, false, 3, 40, person("Elise F.", 4.6, 4, "phone_verified")),
    pkg("Toronto", "Halifax", "package_delivery", "clothing", 4, "low", 10, true, 25, 70, person("Marco A.", 4.5, 12, "id_verified")),
    pkg("Winnipeg", "Calgary", "package_delivery", "medium_box", 8, "normal", 7, true, 18, null, person("Hana Y.", null, 0, "unverified")),
    pkg("Edmonton", "Calgary", "food_delivery", "food", 3, "urgent", 1, false, 1, 30, person("Chris L.", 4.9, 45, "id_verified")),
    pkg("Halifax", "Toronto", "package_delivery", "documents", 0.3, "normal", 6, false, 14, 25, person("Dana R.", 4.4, 9, "phone_verified")),
    pkg("Mississauga", "Ottawa", "errand", "small_box", 1.2, "normal", null, true, 12, 50, person("Felix G.", 4.7, 21, "id_verified")),
    pkg("Montreal", "Toronto", "package_delivery", "electronics", 2.2, "high", 3, false, 6, 80, person("Ines B.", 5, 2, "phone_verified")),
    pkg("Quebec City", "Ottawa", "package_delivery", "medium_box", 5.5, "low", 15, true, null, 55, person("Yves C.", 4.3, 6, "unverified")),
    pkg("Vancouver", "Edmonton", "grocery", "food", 7, "normal", 9, true, 16, 40, person("Aiko N.", 4.8, 13, "id_verified")),
    pkg("Calgary", "Winnipeg", "package_delivery", "clothing", 3.5, "normal", 11, false, 20, 65, person("Grant H.", 4.6, 10, "phone_verified")),
  ];
  const services = [["package_delivery", "small_box"], ["grocery", "food"], ["package_delivery", "documents"], ["pharmacy", "small_box"], ["package_delivery", "electronics"], ["errand", "medium_box"]];
  const urgencies = ["normal", "urgent", "low", "high"];
  const corridor = CORRIDOR_NAMES.map(([n, r, c], i) => {
    const [service, type] = services[i % services.length];
    const flexible = i % 3 === 0;
    return pkg("Toronto", "Montreal", service, type, 0.5 + 1.5 * (i % 5), urgencies[i % 4], i % 4 === 3 ? null : 2 * i + 1, flexible, i % 5 === 4 ? null : 2 * i + 7, i % 6 === 5 ? null : 20 + 10 * (i % 5), person(n, r, c, LEVELS[(i + 1) % 3]));
  });
  return [...base, ...corridor];
}

/* Dev-only: ?searchError=422|429|500 forces an error so each UI state can be checked. */
function forcedError() {
  if (!import.meta.env.DEV || typeof location === "undefined") return null;
  const code = Number(new URLSearchParams(location.search).get("searchError"));
  return code ? new SearchError(statusToKind(code), code) : null;
}

async function mockCities(q, signal) {
  const term = (q || "").trim().toLowerCase();
  if (term.length < 2) return [];
  await delay(300, 500, signal);
  return MOCK_CITIES.filter((c) => c.name.toLowerCase().includes(term) || c.display.toLowerCase().includes(term)).slice(0, 20);
}

async function mockListings({ type, fromCityId, toCityId, date }, signal) {
  await delay(300, 700, signal);
  const forced = forcedError();
  if (forced) throw forced;

  const cityName = (id) => (id == null || id === "" ? null : MOCK_CITIES.find((c) => String(c.id) === String(id))?.name ?? "\u0000");
  const from = cityName(fromCityId);
  const to = cityName(toCityId);
  if (!["trips", "packages"].includes(type) || (!from && !to)) throw new SearchError("validation", 422);
  if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < todayISO())) throw new SearchError("validation", 422);

  const trips = type === "trips";
  const matches = (trips ? mockTrips() : mockPackages())
    .filter((r) => {
      const [o, d] = trips ? [r.origin_city, r.destination_city] : [r.pickup_city, r.delivery_city];
      if (from && o !== from) return false;
      if (to && d !== to) return false;
      if (!date) return true;
      return trips ? r.pickup_date >= date : r.pickup_date_flexible || !r.pickup_date_preferred || r.pickup_date_preferred >= date;
    })
    .sort((a, b) => {
      const da = (trips ? a.pickup_date : a.pickup_date_preferred) || "9999";
      const db = (trips ? b.pickup_date : b.pickup_date_preferred) || "9999";
      return da < db ? -1 : da > db ? 1 : 0;
    });

  return { type, results: matches.slice(0, MAX_RESULTS), has_more: matches.length > MAX_RESULTS };
}
