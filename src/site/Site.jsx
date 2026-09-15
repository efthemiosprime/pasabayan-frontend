/* Page assembly: scroll-driven journey + interactive tab tour. */
import { Fragment, useRef, useState } from "react";
import { Phone, useScrollSteps, usePhoneScale, useIsNarrow } from "./phone.jsx";
import { CreateWizard, ExploreCarriers, ExplorePackages } from "./screensA.jsx";
import { MatchesScreen, BookingDetail, ChatScreen, PackagesScreen, TripsScreen, ProfileScreen } from "./screensB.jsx";
import { SiteNav, Hero, Comparison, EarningsSim, SendRules, Trust, Faq, SiteFooter } from "./sections.jsx";

export const JOURNEY = [
  { role: "Shipper", tab: "packages", title: "Post what you're sending", body: "Five required steps: what it is, pickup, handoff, weight, dates. Add photos, a declared value, and your budget limit — packages or errands like grocery, pharmacy and food.", tags: ["Photo upload", "Declared value", "Flexible dates"], screen: (p) => <CreateWizard p={p} /> },
  { role: "Shipper", tab: "explore", title: "Browse carriers headed your way", body: "Real trips with real dates, available weight and a price per kilo. See who's online nearby, filter to Pasabuy requests, and request to book in one tap.", tags: ["Route matching", "Online now", "$/kg pricing"], screen: (p) => <ExploreCarriers p={p} /> },
  { role: "Carrier", tab: "explore", title: "Carriers see your package too", body: "From the other side of the app the same request appears in Find Packages — category, priority, weight and budget, with the shipper's rating and verified seal.", tags: ["You choose", "No obligations", "Urgent / Fragile"], screen: (p) => <ExplorePackages p={p} /> },
  { role: "Both", tab: "matches", title: "A match appears for both of you", body: "Requests become bookings with a status you can read at a glance: carrier requested, shipper requested, confirmed. Overdue pickups surface at the top of the card.", tags: ["Status filters", "Counter-offers", "Auto-cancel guard"], screen: (p) => <MatchesScreen p={p} /> },
  { role: "Shipper", tab: "matches", title: "Confirm, then pay into escrow", body: "Trip, package, carrier and payment on one screen against your budget limit. Paying doesn't pay the carrier — it holds the money until delivery is confirmed.", tags: ["Escrow held", "Budget limit", "Progress timeline"], screen: (p) => <BookingDetail status="confirmed" p={p} /> },
  { role: "Both", tab: "messages", title: "Coordinate the handoff on the record", body: "Chat stays in the app, with system messages for every money event. One-time codes seal the pickup, so there's always proof it actually happened.", tags: ["Escrow receipts", "Handoff codes", "Fraud detection"], screen: (p) => <ChatScreen p={p} /> },
  { role: "Shipper", tab: "matches", title: "Follow it while it moves", body: "The timeline walks from requested to delivered. When the carrier arrives, the shipper generates a delivery code — or shares it straight with the receiver.", tags: ["In transit", "Delivery code", "Share with receiver"], screen: (p) => <BookingDetail status="in_transit" p={p} /> },
  { role: "Carrier", tab: "profile", title: "Delivered — and the payout releases", body: "Code confirmed, escrow released, both sides rate each other. Reputation compounds: verified ID, a gold star badge and priority in search results.", tags: ["Fast payout", "Two-sided reviews", "Verification tiers"], screen: () => <ProfileScreen role="carrier" /> },
];

export function RoleChip({ role }) {
  const tone = role === "Carrier" ? { bg: "var(--role-carrier-tint)", fg: "var(--role-carrier)" } : role === "Shipper" ? { bg: "var(--role-sender-tint)", fg: "var(--role-sender)" } : { bg: "var(--gray-6)", fg: "var(--text-secondary)" };
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: tone.bg, color: tone.fg, borderRadius: 999, padding: "5px 12px", font: "var(--weight-semibold) 12px var(--font-system)", letterSpacing: ".02em" }}>{role === "Both" ? "Both sides" : role}</span>;
}

function StepCopy({ index, step }) {
  return (
    <Fragment>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ font: "var(--weight-bold) 13px var(--font-mono)", letterSpacing: ".08em" }}>{String(index + 1).padStart(2, "0")}<span style={{ color: "var(--text-tertiary)" }}> / {String(JOURNEY.length).padStart(2, "0")}</span></span>
        <RoleChip role={step.role} />
      </div>
      <h3 className="h2" style={{ marginTop: 18, fontSize: "clamp(26px,3vw,40px)" }}>{step.title}</h3>
      <p className="lede" style={{ marginTop: 16, maxWidth: "44ch" }}>{step.body}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 22 }}>
        {step.tags.map((t) => <span key={t} style={{ border: "1px solid var(--border)", borderRadius: 999, padding: "7px 13px", font: "var(--weight-medium) 13px var(--font-system)", color: "var(--text-secondary)", background: "var(--background)" }}>{t}</span>)}
      </div>
    </Fragment>
  );
}

const stepRole = (step) => (step.role === "Carrier" ? "carrier" : "shipper");

/* Phones and small tablets: a plain list of steps — a sticky screen can't fit copy plus a readable phone. */
function JourneyList({ scale }) {
  return (
    <div className="wrap" style={{ display: "flex", flexDirection: "column", gap: 56, paddingBlock: "40px clamp(64px,8vw,110px)" }}>
      {JOURNEY.map((step, k) => (
        <div key={step.title} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div><StepCopy index={k} step={step} /></div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Phone scale={scale} tab={step.tab} role={stepRole(step)}>{step.screen(1)}</Phone>
          </div>
        </div>
      ))}
    </div>
  );
}

function JourneySticky({ scale }) {
  const ref = useRef(null);
  const { i, p } = useScrollSteps(ref, JOURNEY.length);
  const step = JOURNEY[i];
  return (
      <div ref={ref} style={{ height: `${JOURNEY.length * 100}vh`, position: "relative" }}>
        <div style={{ position: "sticky", top: "var(--site-nav-h)", height: "calc(100vh - var(--site-nav-h))" }}>
          <div className="wrap journey">
            <div className="copyCol">
              <StepCopy index={i} step={step} />
              <div style={{ display: "flex", gap: 5, marginTop: 30 }}>
                {JOURNEY.map((s, k) => (
                  <span key={k} style={{ height: 3, flex: 1, maxWidth: 46, borderRadius: 2, background: k < i ? "var(--primary)" : k === i ? "var(--gray-4)" : "var(--gray-5)", position: "relative", overflow: "hidden" }}>
                    {k === i && <span style={{ position: "absolute", inset: 0, width: `${p * 100}%`, background: "var(--primary)" }} />}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Phone scale={scale} tab={step.tab} role={stepRole(step)}>{step.screen(p)}</Phone>
            </div>
          </div>
        </div>
      </div>
  );
}

export function Journey() {
  const narrow = useIsNarrow();
  const scale = usePhoneScale(0.92);
  return (
    <section id="how-it-works" style={{ background: "var(--gray-6)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="wrap" style={{ paddingTop: "clamp(64px,8vw,110px)" }}>
        <div className="eyebrow">How it works</div>
        <h2 className="h2" style={{ marginTop: 14, maxWidth: "26ch" }}>One package, start to finish — in the actual app.</h2>
        <p className="lede" style={{ marginTop: 18, maxWidth: "52ch" }}>Scroll. The screens are the real ones: create request, explore, matches, booking details, chat.</p>
      </div>
      {narrow ? <JourneyList scale={scale} /> : <JourneySticky scale={scale} />}
    </section>
  );
}

export const TABS = [
  { id: "explore", label: "Explore" },
  { id: "matches", label: "Matches" },
  { id: "packages", label: "Packages" },
  { id: "messages", label: "Messages" },
  { id: "profile", label: "Profile" },
];

export function TabTour() {
  const [tab, setTab] = useState("explore");
  const [role, setRole] = useState("shipper");
  const scale = usePhoneScale(0.86);
  const carrier = role === "carrier";
  const screens = {
    explore: carrier ? <ExplorePackages p={1} /> : <ExploreCarriers p={1} />,
    matches: <MatchesScreen p={1} role={role} />,
    packages: carrier ? <TripsScreen p={1} /> : <PackagesScreen p={1} />,
    messages: <ChatScreen p={1} />,
    profile: <ProfileScreen role={role} />,
  };
  const notes = {
    explore: carrier ? "Find Packages — browse requests along your route, filter to Pasabuy errands." : "Find Carriers — trips with dates, free weight and a price per kilo.",
    matches: "Every booking with its live status, overdue flags and counter-offers.",
    packages: carrier ? "My Trips — posted routes, capacity and assigned packages." : "My Packages — what you've sent, open or matched.",
    messages: "On-record chat with escrow receipts, expense approvals and handoff codes.",
    profile: "Verification tiers, payouts, ratings and account settings.",
  };
  return (
    <section id="app" className="wrap sec">
      <div className="eyebrow">The app</div>
      <h2 className="h2" style={{ marginTop: 14, maxWidth: "24ch" }}>Two roles, one app. Tap around.</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(300px,100%),1fr))", gap: "clamp(24px,5vw,64px)", alignItems: "center", marginTop: 36 }}>
        <div>
          <div style={{ display: "inline-flex", background: "var(--gray-6)", borderRadius: 999, padding: 4 }}>
            {[["shipper", "Shipper"], ["carrier", "Carrier"]].map(([id, l]) => (
              <button key={id} type="button" aria-pressed={role === id} onClick={() => setRole(id)} style={{ border: "none", background: role === id ? "var(--background)" : "transparent", boxShadow: role === id ? "0 1px 3px rgba(0,0,0,.12)" : "none", borderRadius: 999, padding: "9px 20px", font: "var(--weight-semibold) 14px var(--font-system)", cursor: "pointer", color: "var(--text-primary)" }}>{l}</button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 24 }}>
            {TABS.map((t) => {
              const on = t.id === tab;
              const label = t.id === "packages" && carrier ? "My Trips" : t.label;
              return (
                <button key={t.id} type="button" aria-pressed={on} onClick={() => setTab(t.id)} style={{ textAlign: "left", border: "none", background: on ? "var(--background)" : "transparent", boxShadow: on ? "0 1px 3px rgba(0,0,0,.08)" : "none", borderLeft: `2px solid ${on ? "var(--info)" : "transparent"}`, borderRadius: on ? 12 : 0, padding: "14px 16px", cursor: "pointer" }}>
                  <div style={{ font: "var(--weight-semibold) 17px var(--font-system)", color: on ? "var(--text-primary)" : "var(--text-secondary)" }}>{label}</div>
                  {on && <div style={{ font: "var(--weight-regular) 14px/1.45 var(--font-system)", color: "var(--text-secondary)", marginTop: 4, maxWidth: "42ch" }}>{notes[t.id]}</div>}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Phone scale={scale} tab={tab} onTab={setTab} role={role}>{screens[tab]}</Phone>
        </div>
      </div>
    </section>
  );
}

export function Site() {
  const heroScale = usePhoneScale(0.78);
  return (
    <Fragment>
      <SiteNav />
      <main>
      <Hero scale={heroScale} />
      {/* <PopularRoutes /> hidden until there is real route data. */}
      <Journey />
      <TabTour />
      <Comparison />
      <EarningsSim />
      <SendRules />
      <Trust />
      <Faq />
      </main>
      <SiteFooter />
    </Fragment>
  );
}

