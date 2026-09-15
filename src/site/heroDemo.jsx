/* Hero phone: a looping walkthrough of the shipper flow, mirrored from the iOS app's SwiftUI views —
   search in Explore → Request to Book → match confirmed in Matches → Packages → Messages. */
import { Fragment, useEffect, useRef, useState } from "react";
import { Icon } from "./Icon.jsx";
import { TabBar } from "./phone.jsx";
import {
  pclamp, rev, typed, A_META, A_VAL, A_PRICE, ACard, RouteStrip, MetaPair, MetaCell, APill, ViewToggle, CardFoot, VerifiedSeal, Initial, Tap, pressScale,
} from "./appKit.jsx";

const LOOP_MS = 34000;
const STILL_T = 0.15; // reduced motion: hold on the search results

/* Normalised loop time. Pauses while offscreen or in a background tab. */
function useLoopTime(ref) {
  const [t, setT] = useState(0);
  useEffect(() => {
    // Dev only: ?heroT=0.33 freezes the loop at that point, for checking individual frames.
    const frozen = import.meta.env.DEV && new URLSearchParams(location.search).get("heroT");
    if (frozen) { setT(+frozen); return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setT(STILL_T); return; }
    let visible = true, frame = 0, last = 0, elapsed = 0;
    const tick = (now) => {
      if (last) elapsed += Math.min(now - last, 100);
      last = now;
      setT((elapsed % LOOP_MS) / LOOP_MS);
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      const run = visible && !document.hidden;
      if (run && !frame) { last = 0; frame = requestAnimationFrame(tick); }
      if (!run && frame) { cancelAnimationFrame(frame); frame = 0; }
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); });
    if (ref.current) io.observe(ref.current);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => { cancelAnimationFrame(frame); io.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, []);
  return t;
}

/* 0 → 1 over [a,b], 1 until c, 1 → 0 over [c,d]. */
const span = (t, a, b, c, d) => Math.min(rev(t, a, b), 1 - rev(t, c, d));
const ease = (x) => 1 - Math.pow(1 - pclamp(x), 3);

function Scene({ o, children, style }) {
  if (o <= 0) return null;
  // Block flow, not flex: content taller than the screen clips at the bottom like a scroll view
  // instead of squashing collapsible rows.
  return <div style={{ position: "absolute", inset: 0, opacity: o, ...style }}>{children}</div>;
}

function Caret({ on }) {
  return <span style={{ display: "inline-block", width: 1.5, height: 17, marginLeft: 1, verticalAlign: "-3px", background: "var(--info)", opacity: on ? 1 : 0 }} />;
}

function Chip({ children, count, on }) {
  return (
    <span style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 999, background: on ? "var(--primary)" : "var(--gray-6)", color: on ? "#fff" : "var(--text-primary)", font: "var(--weight-semibold) 13px var(--font-system)" }}>
      {children}{count != null && <span style={{ opacity: .85 }}>{count}</span>}
    </span>
  );
}

function StatusRow({ chips }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px 0" }}>
        <span style={{ font: "var(--weight-medium) 14px var(--font-system)", color: "var(--text-secondary)" }}>Filter by status</span>
        <Icon name="info" size={14} color="var(--gray-2)" />
        <span style={{ flex: 1 }} /><ViewToggle />
      </div>
      <div style={{ display: "flex", gap: 8, padding: "10px 16px", overflow: "hidden", borderBottom: "1px solid var(--border)" }}>{chips}</div>
    </>
  );
}

function Notice({ children }) {
  return <div style={{ margin: "2px 16px 0", background: "var(--gray-6)", borderRadius: 12, padding: "9px 14px", ...A_META, fontSize: 12.5 }}>{children}</div>;
}

/* In-app banner that slides up above the tab bar. */
function Banner({ o, icon, text, action }) {
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 12, right: 12, bottom: 10, zIndex: 8, display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 16, padding: "11px 12px", boxShadow: "0 10px 30px -8px rgba(0,0,0,.28), 0 0 0 1px rgba(0,0,0,.04)", opacity: o, transform: `translateY(${(1 - ease(o)) * 24}px)` }}>
      <Icon name={icon} size={22} />
      <span style={{ flex: 1, font: "var(--weight-semibold) 14px/1.3 var(--font-system)" }}>{text}</span>
      {action && <span style={{ background: "var(--primary)", color: "#fff", borderRadius: 999, padding: "5px 11px", font: "var(--weight-semibold) 12px var(--font-system)" }}>{action}</span>}
    </div>
  );
}

/* ---------------- 1. Explore + Request a Delivery ----------------
   Mirrors ShipperDashboardView / ShipperBrowseContent / TripCardView (card layout)
   and MatchCreationView + PackagePickerView. Times below are on the explore
   phase's own 0 → 1 clock (x). */

const IOS_BLUE = "#007AFF";
const IOS_TEAL = "#00A699";
const IOS_SEPARATOR = "rgba(60,60,67,.29)";
const IOS_SECONDARY = "rgba(60,60,67,.6)";
const IOS_TERTIARY = "rgba(60,60,67,.3)";
const IOS_GRAY6 = "#F2F2F7";
const MIN_PRICE = "$5.00";

const sf = (weight, size, extra = "") => `${weight} ${size}px${extra} var(--font-system)`;

/* Native .segmented Picker. */
function Segmented({ items, selected = 0, width, height = 32 }) {
  return (
    <div style={{ display: "flex", width, height, padding: 2, borderRadius: 9, background: "rgba(118,118,128,.12)", flex: "none" }}>
      {items.map((item, i) => (
        <span key={i} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7, background: i === selected ? "#fff" : "transparent", boxShadow: i === selected ? "0 3px 8px rgba(0,0,0,.12), 0 0 0 .5px rgba(0,0,0,.04)" : "none", font: sf(i === selected ? 600 : 500, 13), color: "#000" }}>{item}</span>
      ))}
    </div>
  );
}

/* Collapses a block's height to zero as k goes 0 → 1. */
function Collapse({ k, max, children }) {
  return <div style={{ maxHeight: (1 - k) * max, opacity: 1 - k, overflow: "hidden" }}>{children}</div>;
}

/* TripCardView card layout: CardIdentityHeader → CardRouteBox → proximity + match → dates → capacity/price → status → CardActionFooter. */
function ExploreTripCard({ trip, bookTap = 0 }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${IOS_SEPARATOR}`, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 8 }}>
        <span style={{ width: 40, height: 40, borderRadius: "50%", background: "#FF9500", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", font: sf(600, 17), flex: "none" }}>{trip.carrier[0]}</span>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: sf(600, 16) }}>{trip.carrier}<Icon name="badge-check" size={13} fill="#5AB0FF" stroke="#fff" strokeWidth={2.2} /></span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, font: sf(400, 12), color: IOS_SECONDARY }}><Icon name="star" size={10} color="#FFB400" fill="#FFB400" />{trip.rating}</span>
        </div>
        <Icon name="chevron-right" size={13} color={IOS_TERTIARY} strokeWidth={2.4} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: IOS_GRAY6, borderRadius: 12, padding: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ font: sf(400, 12), color: IOS_SECONDARY }}>Canada</span><span style={{ font: sf(700, 20) }}>{trip.from}</span></div>
        <span style={{ flex: 1 }} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 20, borderTop: `1.5px dashed ${IOS_TERTIARY}` }} /><Icon name={trip.icon} size={18} color={IOS_BLUE} /><span style={{ width: 20, borderTop: `1.5px dashed ${IOS_TERTIARY}` }} />
        </span>
        <span style={{ flex: 1 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "right" }}><span style={{ font: sf(400, 12), color: IOS_SECONDARY }}>Canada</span><span style={{ font: sf(700, 20) }}>{trip.to}</span></div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, font: sf(500, 14), color: IOS_SECONDARY }}><Icon name="navigation" size={11} color={IOS_SECONDARY} fill={IOS_SECONDARY} />Pickup {trip.km} km from you</span>
        <span style={{ flex: 1 }} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 4px", borderRadius: 4, background: "rgba(52,199,89,.1)", color: "#34C759", font: sf(500, 10) }}><Icon name="sparkles" size={10} />{trip.match}% match</span>
      </div>
      <div style={{ height: 1, background: IOS_SEPARATOR }} />
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {[["calendar", IOS_BLUE, "Pickup", trip.date, "left"], ["calendar-check", "#34C759", "Delivery", trip.date, "right"]].map(([ic, c, label, value], i) => (
          <Fragment key={label}>
            {i === 1 && <span style={{ width: 1, alignSelf: "stretch", background: IOS_SEPARATOR }} />}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: sf(400, 12), color: IOS_SECONDARY }}><Icon name={ic} size={15} color={c} />{label}</span>
              <span style={{ font: sf(600, 16) }}>{value}</span>
            </div>
          </Fragment>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, font: sf(400, 12), color: IOS_SECONDARY }}><Icon name="circle-check" size={17} fill="#34C759" stroke="#fff" strokeWidth={2.4} />Available weight: {trip.kg} kg</span>
        <span style={{ flex: 1 }} />
        <span style={{ display: "inline-flex", alignItems: "baseline", gap: 4 }}><span style={{ font: sf(400, 12), color: IOS_SECONDARY }}>Price:</span><span style={{ font: sf(500, 15), color: IOS_TEAL }}>{trip.rate}</span></span>
      </div>
      <div><span style={{ display: "inline-block", padding: "6px 8px", borderRadius: 12, background: trip.status === "Active" ? "rgba(52,199,89,.1)" : "rgba(0,122,255,.1)", color: trip.status === "Active" ? "#34C759" : IOS_BLUE, font: sf(500, 11) }}>{trip.status}</span></div>
      <div>
        <div style={{ height: 1, background: IOS_SEPARATOR, margin: "8px 0" }} />
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ font: sf(500, 16), color: IOS_BLUE }}>View Details</span>
          <span style={{ flex: 1 }} />
          <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: IOS_BLUE, color: "#fff", font: sf(500, 16), transform: `scale(${pressScale(bookTap)})` }}>
            <Icon name="send" size={14} />Request to Book<Tap t={bookTap} />
          </span>
        </div>
      </div>
    </div>
  );
}

const TRIPS = [
  { carrier: "James Lee", rating: "4.9 (87)", from: "Toronto", to: "Montreal", icon: "car", km: 8, match: 92, date: "Dec 20, 2024", kg: "50.0", rate: "$2.50/kg", status: "Planning" },
  { carrier: "Sarah Chen", rating: "4.8 (42)", from: "Vancouver", to: "Calgary", icon: "plane", km: 12, match: 85, date: "Jan 4, 2025", kg: "12.5", rate: "$4.00/kg", status: "Active" },
];

function ExploreScene({ x }) {
  const query = typed("Montreal", rev(x, 0.07, 0.17));
  const typing = x > 0.055 && x < 0.19;
  const caretOn = Math.floor(x * 1000 / 14) % 2 === 0;
  const carriersGone = ease(rev(x, 0.075, 0.11));
  const searchTap = rev(x, 0.19, 0.23);
  const filtered = ease(rev(x, 0.23, 0.29));
  return (
    <>
      {/* ExploreAvatarChip + bell, floating in the 48pt reserved row. */}
      <div style={{ height: 48, flex: "none", display: "flex", alignItems: "center", padding: "0 16px" }}>
        <span style={{ width: 32, height: 32, borderRadius: "50%", background: "#C7C7CC", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 1px rgba(60,60,67,.12)" }}><Icon name="user" size={18} fill="#fff" stroke="#fff" /></span>
        <span style={{ marginLeft: 6, display: "inline-flex", alignItems: "center", gap: 3, padding: "4px 8px", borderRadius: 999, background: "rgba(175,82,222,.15)", border: "1px solid rgba(175,82,222,.2)", color: "#AF52DE", font: sf(600, 11) }}>
          <Icon name="send" size={9} fill="#AF52DE" strokeWidth={2.6} />Sender<Icon name="arrow-left-right" size={9} strokeWidth={3} />
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ position: "relative", padding: 6, display: "inline-flex" }}>
          <Icon name="bell" size={21} color="#000" fill="#000" strokeWidth={2} />
          <span style={{ position: "absolute", top: -2, right: -4, padding: "2px 6px", borderRadius: 999, background: "#FF3B30", color: "#fff", font: sf(600, 11) }}>1</span>
        </span>
      </div>
      <div style={{ padding: "4px 16px 8px", display: "flex", flexDirection: "column", gap: 4, flex: "none" }}>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ font: sf(600, 18) }}>Find Carriers</span>
          <span style={{ flex: 1 }} />
          <span style={{ font: sf(600, 14), color: IOS_BLUE }}>New request</span>
        </div>
        <span style={{ font: sf(400, 12), color: IOS_SECONDARY }}>Ship packages with trusted carriers</span>
      </div>
      <div style={{ margin: "0 16px", display: "flex", alignItems: "center", gap: 8, padding: 10, background: "#fff", borderRadius: 8, border: `1px solid ${IOS_SEPARATOR}` }}>
        <span style={{ flex: 1, font: sf(400, 14), color: query ? "#000" : IOS_TERTIARY, whiteSpace: "nowrap" }}>
          {query || (typing ? "" : "Search origin or destination...")}{typing && <Caret on={caretOn} />}
        </span>
        {query && <Icon name="circle-x" size={17} fill={IOS_SECONDARY} stroke="#fff" strokeWidth={2.2} />}
        <span style={{ position: "relative", width: 32, height: 32, borderRadius: 8, background: "#000", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", transform: `scale(${pressScale(searchTap)})` }}>
          <Icon name="search" size={15} strokeWidth={2.6} /><Tap t={searchTap} />
        </span>
      </div>
      <Collapse k={carriersGone} max={100}>
        <div style={{ padding: "12px 16px 0", display: "flex", flexDirection: "column", gap: 8 }}>
          <Segmented items={["Online now", "Top nearby"]} />
          <div style={{ display: "flex", gap: 12, padding: "4px 0", overflow: "hidden" }}>
            {[["James Lee", "0.8 km"], ["Sarah Chen", "2.3 km"], ["David Park", "3.1 km"]].map(([n, d]) => (
              <span key={n} style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 10, border: `1px solid ${IOS_SEPARATOR}`, font: sf(400, 12) }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34C759" }} />{n}<span style={{ color: IOS_SECONDARY }}>{d}</span>
              </span>
            ))}
          </div>
        </div>
      </Collapse>
      <div style={{ height: 1, background: IOS_SEPARATOR, marginTop: 12 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px 0" }}>
        <span style={{ padding: "6px 8px", borderRadius: 999, background: IOS_BLUE, color: "#fff", font: sf(600, 12) }}>All trips</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 8px", borderRadius: 999, background: "rgba(0,122,255,.12)", color: IOS_BLUE, font: sf(600, 12) }}><Icon name="globe" size={12} strokeWidth={2.2} />Pasabuy</span>
        <span style={{ flex: 1 }} />
        <Segmented width={96} height={28} items={[<Icon key="g" name="rows-2" size={15} strokeWidth={2} />, <Icon key="l" name="list" size={15} strokeWidth={2} />]} />
      </div>
      <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column" }}>
        <ExploreTripCard trip={TRIPS[0]} bookTap={rev(x, 0.305, 0.34)} />
        <Collapse k={filtered} max={420}>
          <div style={{ paddingTop: 12 }}><ExploreTripCard trip={TRIPS[1]} /></div>
        </Collapse>
      </div>
    </>
  );
}

/* Native inline navigation bar inside a sheet. */
function SheetNavBar({ title }) {
  return (
    <div style={{ position: "relative", height: 56, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
      <span style={{ position: "absolute", left: 16, font: sf(400, 17), color: IOS_BLUE }}>Cancel</span>
      <span style={{ font: sf(600, 17) }}>{title}</span>
    </div>
  );
}

function SectionCard({ title, children, pad = 16 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ font: sf(700, 14), color: IOS_SECONDARY, textTransform: "uppercase" }}>{title}</span>
      <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${IOS_SEPARATOR}`, padding: pad }}>{children}</div>
    </div>
  );
}

/* MatchCreationView — "Request a Delivery". */
function RequestSheet({ x, dim }) {
  const chooseTap = rev(x, 0.44, 0.48);
  const selected = x >= 0.6;
  const offer = typed("45", rev(x, 0.69, 0.74));
  const offerTyping = x > 0.66 && x < 0.77;
  const valid = selected && offer === "45";
  const sendTap = rev(x, 0.78, 0.81);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#fff" }}>
      <SheetNavBar title="Request a Delivery" />
      <div style={{ flex: 1, overflow: "hidden", padding: "12px 16px 0", display: "flex", flexDirection: "column", gap: 20 }}>
        <SectionCard title="Choose a Package">
          <div style={{ position: "relative", display: "flex", alignItems: "center", transform: `scale(${pressScale(chooseTap)})` }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ font: sf(400, 12), color: IOS_TERTIARY }}>Package to Send</span>
              <span style={{ font: sf(500, 16), color: selected ? "#000" : IOS_TERTIARY }}>{selected ? "Important documents" : "Choose your package"}</span>
            </div>
            <Icon name="chevron-right" size={14} color={IOS_TERTIARY} strokeWidth={2.2} />
            <Tap t={chooseTap} />
          </div>
          {selected && (
            <div style={{ opacity: ease(rev(x, 0.6, 0.64)) }}>
              <div style={{ height: 1, background: IOS_SEPARATOR, margin: "12px 0" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 4, font: sf(400, 12), color: IOS_SECONDARY }}>
                <span>Signed contract and ID copies</span><span>Toronto → Montreal</span><span>1.5 kg</span>
              </div>
            </div>
          )}
        </SectionCard>
        <SectionCard title="Don't have a package yet?">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ font: sf(400, 14), color: IOS_SECONDARY }}>We'll pre-fill the trip route for you. Just add the package details.</span>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", borderRadius: 12, background: IOS_BLUE, color: "#fff", font: sf(600, 16) }}><Icon name="plus" size={14} strokeWidth={2.6} />Create Package for This Trip</span>
          </div>
        </SectionCard>
        <SectionCard title="Your Offer (Optional)">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ font: sf(600, 16), color: IOS_SECONDARY }}>$</span>
              <span style={{ font: sf(500, 16), color: offer ? "#000" : "rgba(60,60,67,.3)" }}>{offer || (offerTyping ? "" : "Enter your offer")}{offerTyping && <Caret on={Math.floor(x * 1000 / 14) % 2 === 0} />}</span>
            </div>
            {offer === "45"
              ? <span style={{ font: sf(400, 12), color: IOS_TERTIARY }}>Minimum price is {MIN_PRICE}</span>
              : <span style={{ font: sf(400, 12), color: "#FF3B30" }}>Price must be at least {MIN_PRICE}</span>}
          </div>
        </SectionCard>
        <SectionCard title="Note to Carrier (Optional)" pad={0}>
          <div style={{ padding: 12, minHeight: 64, font: sf(400, 14), color: IOS_TERTIARY }}>Add a personal message to introduce yourself or explain why you're the right carrier for this package...</div>
        </SectionCard>
      </div>
      <div style={{ borderTop: `1px solid ${IOS_SEPARATOR}`, padding: "12px 16px 14px", background: "#fff" }}>
        <div style={{ position: "relative", padding: "16px 0", borderRadius: 16, textAlign: "center", background: valid ? IOS_BLUE : "#D1D1D6", color: "#fff", font: sf(700, 18), transform: `scale(${pressScale(sendTap)})`, transition: "background .2s" }}>
          Send Request<Tap t={sendTap} />
        </div>
      </div>
      {dim > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${0.18 * dim})`, borderRadius: "inherit" }} />}
    </div>
  );
}

const MY_PACKAGES = [["Important documents", "Toronto → Montreal", "1.5"], ["Laptop charger", "Toronto → Montreal", "0.4"], ["Birthday gift", "Toronto → Ottawa", "1.2"]];

/* PackagePickerView — inset-grouped List, green check on the selected row, dismisses on tap. */
function PackagePicker({ x }) {
  const pickTap = rev(x, 0.565, 0.595);
  const picked = x >= 0.585;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: IOS_GRAY6 }}>
      <SheetNavBar title="Select Package" />
      <div style={{ margin: "8px 16px 0", background: "#fff", borderRadius: 10, overflow: "hidden" }}>
        {MY_PACKAGES.map(([name, route, kg], i) => (
          <div key={name} style={{ position: "relative", display: "flex", alignItems: "center", padding: "11px 16px", background: i === 0 && pickTap > 0 && pickTap < 1 ? "#E5E5EA" : "#fff" }}>
            {i > 0 && <span style={{ position: "absolute", top: 0, left: 16, right: 0, height: 1, background: IOS_SEPARATOR }} />}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ font: sf(600, 17) }}>{name}</span>
              <span style={{ font: sf(400, 12), color: IOS_SECONDARY }}>📍 {route}</span>
              <span style={{ font: sf(400, 12), color: IOS_SECONDARY }}>⚖️ {kg} kg</span>
            </div>
            {i === 0 && picked && <Icon name="circle-check" size={22} fill="#34C759" stroke="#fff" strokeWidth={2.4} />}
            {i === 0 && <Tap t={pickTap} />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Native .alert shown after a successful submit. */
function SuccessAlert({ x }) {
  const o = ease(span(x, 0.815, 0.845, 0.925, 0.95));
  const okTap = rev(x, 0.89, 0.925);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", background: `rgba(0,0,0,${0.2 * o})` }}>
      <div style={{ width: 270, borderRadius: 14, overflow: "hidden", background: "rgba(242,242,247,.96)", textAlign: "center", opacity: o, transform: `scale(${1.12 - 0.12 * o})` }}>
        <div style={{ padding: "19px 16px 18px" }}>
          <div style={{ font: sf(600, 17) }}>Request Sent Successfully!</div>
          <div style={{ font: sf(400, 13, "/1.35"), marginTop: 4 }}>Your booking request has been sent to the carrier. You'll be notified once they respond.</div>
        </div>
        <div style={{ position: "relative", borderTop: "1px solid rgba(60,60,67,.29)", height: 44, display: "flex", alignItems: "center", justifyContent: "center", font: sf(600, 17), color: IOS_BLUE, background: okTap > 0 && okTap < 1 ? "rgba(0,0,0,.06)" : "transparent" }}>
          OK<Tap t={okTap} />
        </div>
      </div>
    </div>
  );
}

/* iOS page sheet: slides up from the bottom, pushes the presenter back. */
function PageSheet({ open, top, children }) {
  if (open <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, top, zIndex: 10, borderRadius: "12px 12px 0 0", overflow: "hidden", transform: `translateY(${(1 - open) * 105}%)`, boxShadow: "0 -2px 20px rgba(0,0,0,.15)" }}>
      {children}
    </div>
  );
}

/* ---------------- 2. Matches: request → booking confirmed ---------------- */

function MatchesScene({ t }) {
  const confirmed = t >= 0.51;
  const flip = ease(rev(t, 0.51, 0.535));
  return (
    <>
      <Notice>Matches with carriers for your package requests.</Notice>
      <StatusRow chips={<><Chip on count={1}>All</Chip><Chip count={confirmed ? 0 : 1}>Sender Requested</Chip><Chip count={confirmed ? 1 : 0}>Booking Confirmed</Chip></>} />
      <div style={{ padding: "12px 16px 0" }}>
        <ACard style={{ opacity: ease(rev(t, 0.445, 0.475)), transform: `translateY(${(1 - ease(rev(t, 0.445, 0.475))) * 14}px)` }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div style={{ font: "var(--weight-bold) 18px var(--font-system)", letterSpacing: "-0.02em" }}>Booking #301</div>
              <div style={{ ...A_META, marginTop: 1 }}>Important documents</div>
            </div>
            <span style={{ transform: `scale(${confirmed ? 0.9 + 0.1 * flip : 1})`, display: "inline-flex" }}>
              {confirmed ? <APill tone="blueSoft">Booking confirmed</APill> : <APill tone="orange">Sender requested</APill>}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 0" }}>
            <Initial letter="J" size={30} />
            <span style={{ display: "flex", alignItems: "center", gap: 5, font: "var(--weight-semibold) 15px var(--font-system)", flex: 1 }}>James Lee<VerifiedSeal /></span>
            <Icon name="chevron-right" size={17} color="var(--gray-3)" />
          </div>
          <RouteStrip from="Toronto" to="Montreal" />
          <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
          <MetaPair
            left={<MetaCell icon="calendar" label="Pickup Date:" value="Dec 20, 2024" />}
            right={<MetaCell icon="calendar-check" iconColor="var(--success)" label="Delivery Date:" value="Dec 20, 2024" align="right" />}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--weight-semibold) 15px var(--font-system)" }}><Icon name="circle-dollar-sign" size={16} color="var(--price)" />Price</span>
            <span style={{ ...A_PRICE, fontSize: 19 }}>$45.00</span>
          </div>
          {confirmed ? (
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--green-light)", borderRadius: 12, padding: "9px 12px", marginTop: 10, opacity: flip }}>
              <Icon name="circle-check-big" size={15} color="var(--price)" />
              <span style={{ font: "var(--weight-medium) 13px var(--font-system)", color: "var(--price)" }}>Booking confirmed – Pay into escrow</span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--orange-light)", borderRadius: 12, padding: "9px 12px", marginTop: 10 }}>
              <Icon name="bell-ring" size={15} color="var(--warning)" />
              <span style={{ font: "var(--weight-medium) 13px var(--font-system)", color: "var(--warning)" }}>Waiting for James Lee to accept</span>
            </div>
          )}
          <CardFoot right={<span style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--info)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name="ellipsis" size={18} /></span>} />
        </ACard>
      </div>
      <Banner o={span(t, 0.515, 0.535, 0.585, 0.6)} icon="badge-check" text="James Lee confirmed your booking" action="View" />
    </>
  );
}

/* ---------------- 3. Packages ---------------- */

function PackageRow({ status, statusStyle, category, name, kg, t }) {
  const o = ease(t);
  return (
    <ACard style={{ opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ borderRadius: 6, padding: "2px 7px", font: "var(--weight-semibold) 11.5px var(--font-system)", ...statusStyle }}>{status}</span>
        <span style={{ borderRadius: 999, padding: "4px 11px", background: "var(--purple-light)", color: "var(--purple)", font: "var(--weight-semibold) 12.5px var(--font-system)" }}>{category}</span>
      </div>
      <div style={{ font: "var(--weight-bold) 20px var(--font-system)", letterSpacing: "-0.02em", marginTop: 8 }}>{name}</div>
      <div style={{ ...A_META, fontSize: 13 }}>{kg}</div>
      <div style={{ background: "var(--gray-6)", borderRadius: 14, padding: "10px 12px", marginTop: 10 }}>
        {[["package", "var(--purple)", "Pickup", "123 Main St", "Toronto"], ["map-pin", "var(--info)", "Delivery", "456 Oak Ave", "Montreal"]].map(([ic, c, label, street, city], i) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: i ? 8 : 0, marginTop: i ? 8 : 0, borderTop: i ? "1px solid var(--border)" : "none" }}>
            <Icon name={ic} size={18} color={c} />
            <div>
              <div style={A_META}>{label}</div>
              <div style={A_VAL}>{street}</div>
              <div style={{ ...A_META, fontSize: 11.5 }}>{city}</div>
            </div>
          </div>
        ))}
      </div>
    </ACard>
  );
}

function PackagesScene({ t }) {
  return (
    <>
      <Notice>Packages you created. Matches are shown in the Matches tab.</Notice>
      <StatusRow chips={<><Chip on count="(2)">All</Chip><Chip count="(1)">Open Requests</Chip><Chip count="(1)">Matched</Chip></>} />
      <div style={{ padding: "12px 16px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        <PackageRow t={rev(t, 0.615, 0.645)} status="Matched" statusStyle={{ background: "var(--purple-light)", color: "var(--purple)" }} category="Documents" name="Important documents" kg="1.5 kg" />
        <PackageRow t={rev(t, 0.64, 0.67)} status="Pending" statusStyle={{ background: "var(--yellow-light)", color: "var(--yellow)" }} category="Electronics" name="Laptop charger" kg="0.4 kg" />
      </div>
    </>
  );
}

/* ---------------- 4. Messages: inbox → thread ---------------- */

function Bubble({ side, t, children, meta }) {
  const o = ease(t);
  if (o <= 0) return null;
  const tone = side === "out"
    ? { background: "var(--info)", color: "#fff", alignSelf: "flex-end" }
    : { background: "var(--gray-6)", color: "var(--text-primary)", alignSelf: "flex-start" };
  return (
    <div style={{ maxWidth: "82%", borderRadius: 16, padding: "9px 13px", font: "var(--weight-regular) 14px/1.35 var(--font-system)", opacity: o, transform: `translateY(${(1 - o) * 10}px)`, ...tone }}>
      {children}
      {meta && <div style={{ fontSize: 11, opacity: .8, marginTop: 3, textAlign: side === "out" ? "right" : "left" }}>{meta}</div>}
    </div>
  );
}

function MessagesScene({ t }) {
  const rowTap = rev(t, 0.825, 0.85);
  const thread = ease(rev(t, 0.85, 0.875));
  const reply = "Perfect, see you then.";
  const draft = t < 0.945 ? typed(reply, rev(t, 0.9, 0.93)) : "";
  const sendTap = rev(t, 0.93, 0.95);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - thread, padding: "4px 16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ font: "var(--weight-bold) 24px var(--font-system)", letterSpacing: "-0.02em", marginBottom: 4 }}>Messages</div>
        {[["JL", "James Lee", "Just now", 1, "Toronto → Montreal"], ["SC", "Sarah Chen", "1 day ago", 0, "Vancouver → Calgary"]].map(([ini, name, when, unread, route], i) => (
          <ACard key={name} pad={12} style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, transform: i === 0 ? `scale(${pressScale(rowTap)})` : "none" }}>
            <Initial letter={ini} size={42} bg="var(--gray-1)" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, font: "var(--weight-semibold) 15px var(--font-system)" }}>
                {name}<VerifiedSeal /><span style={{ flex: 1 }} /><span style={{ ...A_META }}>{when}</span>
                {unread > 0 && <span style={{ minWidth: 18, height: 18, borderRadius: 9, background: "var(--error)", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{unread}</span>}
              </div>
              <div style={{ ...A_META, marginTop: 2 }}>{route}</div>
              <div style={{ ...A_META, fontSize: 13, marginTop: 1 }}>Active</div>
            </div>
            <Icon name="chevron-right" size={16} color="var(--gray-3)" />
            {i === 0 && <Tap t={rowTap} />}
          </ACard>
        ))}
      </div>
      {thread > 0 && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: "var(--background)", opacity: thread, transform: `translateX(${(1 - thread) * 30}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 14px 10px", borderBottom: "1px solid var(--border)" }}>
            <Icon name="chevron-left" size={22} color="var(--info)" />
            <Initial letter="J" size={30} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, font: "var(--weight-semibold) 15px var(--font-system)" }}>James Lee<VerifiedSeal /></div>
              <div style={{ ...A_META, fontSize: 11.5 }}>Booking #301 · Toronto → Montreal</div>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9, padding: "12px 14px 0" }}>
            <div style={{ display: "flex", gap: 6, ...A_META, fontSize: 12.5, lineHeight: 1.4, textAlign: "center", padding: "0 6px" }}>
              <Icon name="sparkles" size={13} style={{ marginTop: 2 }} />
              <span>Match created — Toronto → Montreal. The sender will share the receiver's contact info and preferred pickup location to coordinate handoff.</span>
            </div>
            <ACard pad={12} style={{ display: "flex", alignItems: "center", gap: 10, boxShadow: "0 2px 10px rgba(0,0,0,.06)" }}>
              <span style={{ width: 30, height: 30, borderRadius: 9, background: "var(--blue-light)", color: "var(--info)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Icon name="badge-check" size={17} /></span>
              <span style={{ font: "var(--weight-regular) 13.5px/1.35 var(--font-system)" }}>Booking confirmed at <b style={{ color: "var(--price)" }}>$45.00</b>. Pay into escrow to lock it in.</span>
            </ACard>
            <div style={{ ...A_META, fontSize: 11.5, marginTop: 2, opacity: ease(rev(t, 0.875, 0.895)) }}>James Lee</div>
            <Bubble side="in" t={rev(t, 0.875, 0.895)} meta="Just now">Hi! I'll be at the pickup spot around 3pm.</Bubble>
            <Bubble side="out" t={rev(t, 0.945, 0.965)} meta="Just now ✓ Read">{reply}</Bubble>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 14px 10px" }}>
            <div style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 999, padding: "10px 14px", font: "var(--weight-regular) 14px var(--font-system)", color: draft ? "var(--text-primary)" : "var(--gray-2)" }}>
              {draft || "Message"}{t > 0.895 && t < 0.945 && <Caret on={Math.floor(t * LOOP_MS / 450) % 2 === 0} />}
            </div>
            <span style={{ position: "relative", width: 38, height: 38, borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", transform: `scale(${pressScale(sendTap)})` }}>
              <Icon name="send" size={17} /><Tap t={sendTap} />
            </span>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------- Assembly ---------------- */

// The loop's first half is the explore + request flow on its own clock (x); the rest
// replays the Matches → Packages → Messages timeline (authored on the old 0.42 → 1 range).
const EXPLORE_END = 0.5;
const laterTime = (t) => 0.42 + (t - EXPLORE_END) * (0.58 / (1 - EXPLORE_END));

const TAB_SWITCHES = [
  { id: "packages", tap: [0.595, 0.62] },
  { id: "messages", tap: [0.775, 0.8] },
];

export function HeroDemo() {
  const ref = useRef(null);
  const t = useLoopTime(ref);
  const inExplore = t < EXPLORE_END;
  const x = inExplore ? t / EXPLORE_END : 1;
  const later = inExplore ? 0 : laterTime(t);
  const active = inExplore ? "explore" : later < 0.61 ? "matches" : later < 0.79 ? "packages" : "messages";

  const tabTap = inExplore
    ? (x > 0.95 ? { id: "matches", t: rev(x, 0.95, 0.995) } : null)
    : (() => { const s = TAB_SWITCHES.find((w) => later > w.tap[0] && later < w.tap[1]); return s ? { id: s.id, t: rev(later, s.tap[0], s.tap[1]) } : null; })();

  // Sheet stack: request sheet over Explore, package picker over the request sheet.
  const sheet = inExplore ? ease(span(x, 0.34, 0.4, 0.92, 0.96)) : 0;
  const picker = inExplore ? ease(span(x, 0.48, 0.53, 0.6, 0.645)) : 0;

  // Fade the screen out at the end of the loop and back in at the start.
  const screenOpacity = Math.min(0.15 + 0.85 * rev(t, 0, 0.012), 1 - 0.85 * rev(t, 0.98, 1));
  return (
    <div ref={ref} aria-hidden="true" style={{ flex: 1, position: "relative", minHeight: 0, overflow: "hidden", background: "#000" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: "var(--background)", borderRadius: 12 * sheet, transform: `translateY(${sheet * 6}px) scale(${1 - 0.07 * sheet})`, transformOrigin: "50% 0" }}>
        <div style={{ flex: 1, position: "relative", overflow: "hidden", opacity: screenOpacity }}>
          <Scene o={active === "explore" ? 1 : 0}><ExploreScene x={x} /></Scene>
          <Scene o={active === "matches" ? 1 : 0}><MatchesScene t={later} /></Scene>
          <Scene o={active === "packages" ? 1 : 0}><PackagesScene t={later} /></Scene>
          <Scene o={active === "messages" ? 1 : 0}><MessagesScene t={later} /></Scene>
        </div>
        <TabBar active={active} role="shipper" tap={tabTap} />
        {sheet > 0 && <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", background: `rgba(0,0,0,${0.25 * sheet})` }} />}
      </div>
      <PageSheet open={sheet} top={14}>
        <div style={{ height: "100%", transform: `translateY(${picker * 6}px) scale(${1 - 0.06 * picker})`, transformOrigin: "50% 0", borderRadius: 12 * picker, overflow: "hidden", position: "relative" }}>
          <RequestSheet x={x} dim={picker} />
        </div>
      </PageSheet>
      <PageSheet open={picker} top={26}><PackagePicker x={x} /></PageSheet>
      {inExplore && <SuccessAlert x={x} />}
    </div>
  );
}
