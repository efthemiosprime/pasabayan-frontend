/* Results under the hero search. Renders only fields from the website-search contract. */
import { forwardRef } from "react";
import { Icon } from "./Icon.jsx";
import { MetaPair, MetaCell, APill, A_PRICE, A_META } from "./appKit.jsx";

const NOUN = { trips: ["carrier", "carriers"], packages: ["package", "packages"] };
const TRANSPORT_ICON = { car: "car-front", bus: "bus", plane: "plane", train: "train-front" };
const ERRORS = {
  validation: "Choose a city",
  rate_limited: "Too many searches — try again in a minute",
  unavailable: "Search is unavailable right now",
};

const fmtDate = (iso) => {
  const [y, m, d] = String(iso || "").split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
const money = (n) => { const v = Number(n); return `$${Number.isInteger(v) ? v : v.toFixed(2)}`; };
const perKg = (n) => `$${Number(n).toFixed(2)}/kg`;
const kg = (n) => `${Number(n).toLocaleString("en-US", { maximumFractionDigits: 1 })} kg`;
const humanize = (s) => (s ? String(s).replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()) : null);
const place = (city, country) => (country && !["canada", "ca"].includes(String(country).toLowerCase()) ? `${city}, ${country}` : city);
const isVerified = (level) => Boolean(level) && level !== "unverified";

function tripPrice(t) {
  if (t.pricing_type === "per_kg" && t.price_per_kg != null) return perKg(t.price_per_kg);
  if (t.pricing_type === "flat" && t.flat_trip_price != null) return `${money(t.flat_trip_price)} flat`;
  if (t.price_per_kg != null) return perKg(t.price_per_kg);
  if (t.flat_trip_price != null) return `${money(t.flat_trip_price)} flat`;
  return null;
}

function Route({ icon, from, to }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
      <span style={{ width: 34, height: 34, flex: "none", borderRadius: 10, background: "var(--blue-light)", color: "var(--info)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={18} />
      </span>
      <div style={{ minWidth: 0, font: "var(--weight-bold) 17px/1.25 var(--font-system)", letterSpacing: "-.02em" }}>
        {from} <span aria-hidden="true" style={{ color: "var(--gray-1)", fontWeight: 500 }}>→</span><span className="srOnly">to</span> {to}
      </div>
    </div>
  );
}

function Person({ p }) {
  if (!p) return <span />;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, minWidth: 0, font: "var(--weight-semibold) 13.5px var(--font-system)" }}>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.display_name}</span>
      {isVerified(p.verification_level) && (
        <span title="Verified" style={{ display: "inline-flex" }}>
          <Icon name="badge-check" size={15} fill="var(--verified)" stroke="#fff" strokeWidth={2} />
          <span className="srOnly">Verified</span>
        </span>
      )}
      {/* The API sends rating 0 (never null) for an unrated user, so the count decides. */}
      {p.rating != null && p.total_ratings > 0 ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "var(--text-secondary)", fontWeight: 500, whiteSpace: "nowrap" }}>
          <Icon name="star" size={13} fill="var(--yellow)" color="var(--yellow)" />
          <span className="srOnly">Rated</span>{Number(p.rating).toFixed(1)}
          <span> ({p.total_ratings})</span>
        </span>
      ) : (
        <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>· New</span>
      )}
    </span>
  );
}

function CardShell({ children, person }) {
  return (
    <article className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      {children}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: "auto" }}>
        <Person p={person} />
        <a href="#notify" className="plain" style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: 4, font: "var(--weight-semibold) 13.5px var(--font-system)" }}>
          Get notified<Icon name="chevron-right" size={14} />
        </a>
      </div>
    </article>
  );
}

function TripCard({ t }) {
  const pickup = fmtDate(t.pickup_date);
  const delivery = fmtDate(t.delivery_date);
  const price = tripPrice(t);
  return (
    <CardShell person={t.carrier}>
      <div>
        <Route icon={TRANSPORT_ICON[t.transportation_method] || "car-front"} from={place(t.origin_city, t.origin_country)} to={place(t.destination_city, t.destination_country)} />
        {t.transportation_method && <div style={{ ...A_META, marginTop: 6, marginLeft: 44 }}>By {String(t.transportation_method).toLowerCase()}</div>}
      </div>
      <MetaPair
        left={<MetaCell icon="calendar" label="Pickup" value={pickup || "—"} />}
        right={<MetaCell icon="calendar-check" label="Delivery" value={delivery || "—"} align="right" />}
      />
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, font: "var(--weight-medium) 13.5px var(--font-system)", color: "var(--text-secondary)" }}>
          <Icon name="weight" size={14} />{t.available_weight_kg != null ? `${kg(t.available_weight_kg)} free` : "Space on request"}
        </span>
        {price && <span style={A_PRICE}>{price}</span>}
      </div>
    </CardShell>
  );
}

function PackageCard({ p }) {
  const urgent = ["urgent", "high"].includes(String(p.urgency_level).toLowerCase());
  const pickup = fmtDate(p.pickup_date_preferred);
  const pickupText = pickup ? (p.pickup_date_flexible ? `${pickup} · flexible` : pickup) : "Flexible";
  const typeChip = humanize(p.package_type) || humanize(p.service_type);
  return (
    <CardShell person={p.shipper}>
      <div>
        <Route icon="package" from={place(p.pickup_city, p.pickup_country)} to={place(p.delivery_city, p.delivery_country)} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {p.service_type && p.package_type && <APill tone="grey">{humanize(p.service_type)}</APill>}
          {typeChip && <APill tone="blueSoft">{typeChip}</APill>}
          {p.urgency_level && <APill tone={urgent ? "orange" : "grey"}>{urgent && <Icon name="flame" size={13} />}{humanize(p.urgency_level)}</APill>}
        </div>
      </div>
      <MetaPair
        left={<MetaCell icon="calendar" label="Pickup" value={pickupText} />}
        right={<MetaCell icon="calendar-check" label="Deliver by" value={fmtDate(p.delivery_date_needed) || "Flexible"} align="right" />}
      />
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, font: "var(--weight-medium) 13.5px var(--font-system)", color: "var(--text-secondary)" }}>
          <Icon name="weight" size={14} />{p.package_weight_kg != null ? kg(p.package_weight_kg) : "Weight not set"}
        </span>
        <span style={{ ...A_PRICE, fontSize: 15 }}>{p.max_price_budget != null ? `Budget up to ${money(p.max_price_budget)}` : "Open to offers"}</span>
      </div>
    </CardShell>
  );
}

function SkeletonCard() {
  return (
    <div className="card" aria-hidden="true" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div className="skel" style={{ width: 34, height: 34, borderRadius: 10 }} />
        <div className="skel" style={{ height: 16, width: "60%" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="skel" style={{ height: 30, width: "35%" }} />
        <div className="skel" style={{ height: 30, width: "35%" }} />
      </div>
      <div className="skel" style={{ height: 14, width: "45%" }} />
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}><div className="skel" style={{ height: 14, width: "55%" }} /></div>
    </div>
  );
}

function Notice({ icon, title, children }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 18, borderRadius: 16, background: "var(--gray-6)" }}>
      <Icon name={icon} size={20} color="var(--text-secondary)" style={{ marginTop: 1 }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ font: "var(--weight-semibold) 16px var(--font-system)" }}>{title}</div>
        {children}
      </div>
    </div>
  );
}

export const HeroSearchResults = forwardRef(function HeroSearchResults({ state, onRetry }, ref) {
  const { status, type = "trips" } = state;
  const [one, many] = NOUN[type] || NOUN.trips;
  let body = null;

  if (status === "loading") {
    body = (
      <>
        <span className="srOnly">Searching {many}…</span>
        <div className="resultsGrid">{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <SkeletonCard key={i} />)}</div>
      </>
    );
  } else if (status === "error") {
    body = (
      <Notice icon="circle-alert" title={ERRORS[state.kind] || ERRORS.unavailable}>
        {state.kind === "unavailable" && (
          <button type="button" className="btng" onClick={onRetry} style={{ height: 38, padding: "0 14px", fontSize: 14, marginTop: 12, background: "var(--background)" }}>
            <Icon name="rotate-ccw" size={15} />Try again
          </button>
        )}
      </Notice>
    );
  } else if (status === "done") {
    const results = (state.data?.results || []).slice(0, 12);
    const Card = type === "packages" ? PackageCard : TripCard;
    body = results.length === 0 ? (
      <Notice icon="search" title={type === "packages" ? "No open packages on this route yet" : "No carriers on this route yet"}>
        <p style={{ margin: "4px 0 12px", font: "var(--weight-regular) 14.5px/1.45 var(--font-system)", color: "var(--text-secondary)" }}>Get notified when one is posted on this route.</p>
        <a href="#notify" className="btnk plain" style={{ height: 40, padding: "0 16px", fontSize: 14.5 }}><Icon name="bell" size={16} />Get notified</a>
      </Notice>
    ) : (
      <>
        <div style={{ font: "var(--weight-semibold) 14px var(--font-system)", color: "var(--text-secondary)", marginBottom: 10 }}>
          {results.length} {results.length === 1 ? one : many} found
        </div>
        <div className="resultsGrid">
          {results.map((r, i) => <Card key={i} t={r} p={r} />)}
        </div>
        {state.data.has_more && (
          <div style={{ marginTop: 14, textAlign: "center", font: "var(--weight-medium) 14.5px var(--font-system)", color: "var(--text-secondary)" }}>
            More on the app — <a href="#notify">Get notified</a>
          </div>
        )}
      </>
    );
  }

  return (
    <div ref={ref} aria-live="polite" aria-busy={status === "loading"} style={{ marginTop: body ? "clamp(32px,4vw,48px)" : 0, scrollMarginTop: 92 }}>
      {body}
    </div>
  );
});
