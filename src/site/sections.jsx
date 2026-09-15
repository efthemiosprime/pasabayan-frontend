/* Marketing page sections. Copy from pasabayan.com kept verbatim where used. */
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon.jsx";
import { Phone } from "./phone.jsx";
import { HeroDemo } from "./heroDemo.jsx";
import { HeroSearch, useListingSearch } from "./heroSearch.jsx";
import { HeroSearchResults } from "./heroSearchResults.jsx";

export function SiteNav() {
  const links = [["How it works", "#how-it-works"], ["Why Pasabayan", "#why"], ["For senders", "#app"], ["For carriers", "#carriers"], ["Trust & safety", "#trust"]];
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(255,255,255,.82)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
      <div className="wrap" style={{ display: "flex", alignItems: "center", gap: 20, height: "var(--site-nav-h)" }}>
        <a href="#top" className="plain" style={{ display: "inline-flex", alignItems: "center", gap: 9, font: "var(--weight-bold) 19px var(--font-system)", letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
          <img src="/logo.svg" alt="" style={{ height: 26, width: "auto" }} />Pasabayan
        </a>
        <div className="navLinks" style={{ flex: 1, display: "flex", gap: 22, marginLeft: 18 }}>
          {links.map(([l, href]) => <a key={l} href={href} className="plain navLink">{l}</a>)}
        </div>
        <a href="#notify" className="btnk plain" style={{ height: 42, padding: "0 18px", fontSize: 14.5, whiteSpace: "nowrap", flex: "none", marginLeft: "auto" }}>Get notified</a>
      </div>
    </nav>
  );
}

export function Hero({ scale }) {
  const search = useListingSearch();
  const resultsRef = useRef(null);
  const loading = search.state.status === "loading";

  useEffect(() => {
    const el = resultsRef.current;
    if (!loading || !el || el.getBoundingClientRect().top < window.innerHeight) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [loading]);

  return (
    <section id="top" className="wrap sec" style={{ paddingTop: "clamp(48px,6vw,88px)" }}>
      <div className="heroGrid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(0,.85fr)", gap: "clamp(24px,5vw,64px)", alignItems: "center" }}>
        <div>
          <div className="eyebrow">Peer-to-peer delivery · Canada</div>
          <h1 className="h1" style={{ marginTop: 18 }}>Send Anything, Anywhere — With Carriers Headed There.</h1>
          <p className="lede" style={{ marginTop: 20, maxWidth: "46ch" }}>Whether you need to send a package, request an errand, or earn while traveling — Pasabayan connects you.</p>
          <HeroSearch search={search} />
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 18, font: "var(--weight-medium) 13.5px var(--font-system)", color: "var(--text-secondary)" }}>
            <span>Packages</span><span>·</span><span>Grocery</span><span>·</span><span>Pharmacy</span><span>·</span><span>Food delivery</span><span>·</span><span>General errands</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Phone scale={scale}><HeroDemo /></Phone>
        </div>
      </div>
      <HeroSearchResults ref={resultsRef} state={search.state} onRetry={search.retry} />
    </section>
  );
}

export function PopularRoutes() {
  const routes = [
    { from: "Toronto", to: "Montreal", icon: "car-front", kg: "50.0 kg free", rate: "$2.50/kg", n: 12 },
    { from: "Vancouver", to: "Calgary", icon: "plane", kg: "12.5 kg free", rate: "$4.00/kg", n: 7 },
    { from: "Ottawa", to: "Quebec City", icon: "bus", kg: "30.0 kg free", rate: "$3.50/kg", n: 5 },
    { from: "Toronto", to: "Manila", icon: "plane", kg: "18.0 kg free", rate: "$6.00/kg", n: 9 },
  ];
  return (
    <div id="routes" className="wrap sec">
      <div className="eyebrow">Popular routes</div>
      <h2 className="h2" style={{ marginTop: 14, maxWidth: "20ch" }}>Carriers are already going your way.</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(240px,100%),1fr))", gap: 16, marginTop: 32 }}>
        {routes.map((r) => (
          <div key={r.from + r.to} className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--info)" }}><Icon name={r.icon} size={18} /><span style={{ font: "var(--weight-medium) 12.5px var(--font-system)", color: "var(--text-secondary)" }}>{r.n} carriers this week</span></div>
            <div style={{ font: "var(--weight-bold) 22px var(--font-system)", letterSpacing: "-.02em", marginTop: 12 }}>{r.from}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--gray-3)" }}><Icon name="arrow-down" size={15} /></div>
            <div style={{ font: "var(--weight-bold) 22px var(--font-system)", letterSpacing: "-.02em" }}>{r.to}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              <span style={{ font: "var(--weight-medium) 13px var(--font-system)", color: "var(--text-secondary)" }}>{r.kg}</span>
              <span style={{ font: "var(--weight-bold) 17px var(--font-system)", color: "var(--price)" }}>{r.rate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Comparison() {
  const today = ["Strangers you can't verify", "Pay up front and hope it arrives", "Requests buried in comment threads", "No proof it was actually delivered", "Little recourse when something goes wrong"];
  const ours = ["Verified identities on every account", "Payment held in escrow until delivery is confirmed", "Structured requests matched to real travelers", "One-time codes confirm every pickup and delivery", "In-app chat, refunds, and disputes if plans change"];
  return (
    <div id="why" style={{ background: "var(--gray-6)" }}>
      <div className="wrap sec">
        <div className="eyebrow">Why Pasabayan</div>
        <h2 className="h2" style={{ marginTop: 14, maxWidth: "26ch" }}>Rooted in Filipino tradition. Built for everyone.</h2>
        <p className="lede" style={{ marginTop: 20, maxWidth: "62ch" }}>Its roots are Filipino: for generations, families have sent things home through whoever was making the trip — the <i>balikbayan</i> box, the <i>padala</i> entrusted to a friend, the <i>pasabay</i> handed to someone going the same direction. We inherited the tradition; we built it for all of us.</p>
        <div className="grid2" style={{ marginTop: 44 }}>
          {[["How it happens today", "Scattered across Facebook groups and chat threads", today, false], ["How Pasabayan does it", "The same kindness, made safe for both sides", ours, true]].map(([t, s, list, good]) => (
            <div key={t} style={{ background: good ? "var(--background)" : "transparent", border: good ? "1px solid var(--border)" : "1px dashed var(--gray-4)", borderRadius: 20, padding: "clamp(20px,3vw,32px)" }}>
              <h3 className="h3">{t}</h3>
              <p style={{ font: "var(--weight-medium) 14px var(--font-system)", color: "var(--text-secondary)", margin: "6px 0 20px" }}>{s}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {list.map((l) => (
                  <div key={l} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Icon name={good ? "check" : "x"} size={17} color={good ? "var(--success)" : "var(--gray-2)"} style={{ marginTop: 2 }} />
                    <span style={{ font: "var(--weight-regular) 15.5px/1.45 var(--font-system)", color: good ? "var(--text-primary)" : "var(--text-secondary)" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Trust() {
  const items = [
    ["shield-check", "Tiered Verification", "Accounts are verified in steps — email, then phone, with optional government-ID review. The more verified a user is, the more you can trust the handoff."],
    ["lock", "Escrow Protection", "Your payment is held securely and only released to the carrier once delivery is confirmed — never before."],
    ["key-round", "Confirmed Handoff Codes", "Every pickup and delivery is sealed with a one-time code. No matching code, no handoff — so there's always proof it actually happened."],
    ["message-square", "On-Platform Chat & Fraud Detection", "Coordinate through in-app chat that stays on the record. We flag attempts to move payment off-platform, because staying on Pasabayan is what keeps you protected."],
    ["star", "Two-Sided Reviews", "Carriers and senders rate each other after every delivery. Good behavior builds a reputation; bad actors become visible to everyone."],
    ["rotate-ccw", "Refunds & Disputes", "If a delivery goes wrong, structured refund and dispute resolution gives you a clear path to recourse — with our team reviewing the case."],
  ];
  return (
    <div id="trust" className="wrap sec">
      <div className="eyebrow">Trust &amp; safety</div>
      <h2 className="h2" style={{ marginTop: 14, maxWidth: "24ch" }}>Built for Trust &amp; Safety</h2>
      <p className="lede" style={{ marginTop: 18, maxWidth: "56ch" }}>Every delivery is backed by safeguards an informal arrangement can't give you.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(280px,100%),1fr))", gap: 1, marginTop: 40, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>
        {items.map(([ic, t, b]) => (
          <div key={t} style={{ background: "var(--background)", padding: "clamp(20px,2.4vw,30px)" }}>
            <Icon name={ic} size={22} color="var(--info)" />
            <h3 style={{ font: "var(--weight-semibold) 18px var(--font-system)", margin: "14px 0 8px", letterSpacing: "-.01em" }}>{t}</h3>
            <p style={{ font: "var(--weight-regular) 14.5px/1.5 var(--font-system)", color: "var(--text-secondary)", margin: 0 }}>{b}</p>
          </div>
        ))}
      </div>
      <p style={{ font: "var(--weight-regular) 12.5px/1.5 var(--font-system)", color: "var(--text-secondary)", marginTop: 20, maxWidth: "80ch" }}>Pasabayan is not an insurance provider. Any declared package value is informational only and helps carriers decide what they're comfortable carrying; it does not represent coverage. Carrier responsibility is defined in our <a href="/terms-of-service/">Terms</a>.</p>
    </div>
  );
}

export function SendRules() {
  const allowed = [["file-text", "Documents"], ["smartphone", "Electronics"], ["shirt", "Clothing"], ["sparkles", "Cosmetics"], ["pill", "Pharmacy items"], ["gift", "Gifts"], ["shopping-basket", "Dry groceries"], ["utensils", "Food delivery"]];
  const forbidden = [["spray-can", "Aerosols"], ["flame", "Flammable materials"], ["battery-warning", "Lithium batteries"], ["ban", "Weapons"], ["flask-conical", "Chemicals"], ["circle-slash", "Narcotics"], ["banknote", "Undeclared cash"]];
  return (
    <div style={{ background: "var(--gray-6)" }}>
      <div className="wrap sec">
        <div className="eyebrow">Clear rules</div>
        <h2 className="h2" style={{ marginTop: 14 }}>What you can send</h2>
        <p className="lede" style={{ marginTop: 18, maxWidth: "56ch" }}>What the community sends most often, and what's off-limits so every handoff stays safe.</p>
        <div className="grid2" style={{ marginTop: 40, gap: 32 }}>
          {[["Allowed", allowed, "var(--success)", "check"], ["Forbidden", forbidden, "var(--error)", "x"]].map(([title, list, color, mark]) => (
            <div key={title}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name={mark} size={14} /></span>
                <h3 className="h3">{title}</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(150px,100%),1fr))", gap: 10, marginTop: 18 }}>
                {list.map(([ic, l]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--background)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 14px" }}>
                    <Icon name={ic} size={17} color={color} />
                    <span style={{ font: "var(--weight-medium) 14px var(--font-system)" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const MIN_RATE = 5;

export function EarningsSim() {
  const routes = [{ label: "Toronto → Montreal", rate: 2.5 }, { label: "Vancouver → Calgary", rate: 4 }, { label: "Ottawa → Quebec City", rate: 3.5 }, { label: "Toronto → Manila", rate: 6 }];
  const [kg, setKg] = useState(12);
  const [ri, setRi] = useState(0);
  const [rate, setRate] = useState(Math.max(MIN_RATE, routes[0].rate));
  const pickRoute = (i) => { setRi(i); setRate(Math.max(MIN_RATE, routes[i].rate)); };
  const effRate = Math.max(MIN_RATE, +rate || 0);
  const gross = kg * effRate;
  const fee = gross * 0.12;
  const net = gross - fee;
  const money = (n) => "$" + n.toFixed(2);
  return (
    <div id="carriers" className="wrap sec">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(300px,100%),1fr))", gap: "clamp(24px,5vw,64px)", alignItems: "center" }}>
        <div>
          <div className="eyebrow">For carriers</div>
          <h2 className="h2" style={{ marginTop: 14, maxWidth: "20ch" }}>Turn your trip into extra income.</h2>
          <p className="lede" style={{ marginTop: 18, maxWidth: "48ch" }}>Post where you're going, set your available space and price, and accept only what fits your schedule. Payout is released once the delivery code is confirmed.</p>
          <div style={{ marginTop: 28 }}>
            <div style={{ font: "var(--weight-semibold) 14px var(--font-system)", marginBottom: 10 }}>Your route</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {routes.map((r, i) => (
                <button key={r.label} onClick={() => pickRoute(i)} style={{ border: "1px solid " + (i === ri ? "var(--primary)" : "var(--border)"), background: i === ri ? "var(--primary)" : "transparent", color: i === ri ? "#fff" : "var(--text-primary)", borderRadius: 999, padding: "9px 15px", font: "var(--weight-semibold) 13.5px var(--font-system)", cursor: "pointer" }}>{r.label}</button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginTop: 26 }}>
              <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                <div style={{ font: "var(--weight-semibold) 14px var(--font-system)", marginBottom: 8 }}>Your price per kg</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--border)", borderRadius: 14, padding: "0 14px", height: 52 }}>
                  <span style={{ font: "var(--weight-semibold) 18px var(--font-system)", color: "var(--text-secondary)" }}>$</span>
                  <input type="number" min={MIN_RATE} step="0.25" value={rate} aria-label="Your price per kg" onChange={(e) => setRate(e.target.value === "" ? "" : Math.max(0, +e.target.value))} onBlur={() => setRate(effRate)}
                    style={{ flex: 1, minWidth: 0, width: "100%", border: "none", outline: "none", background: "transparent", font: "var(--weight-bold) 18px var(--font-system)", color: "var(--text-primary)" }} />
                  <span style={{ font: "var(--weight-medium) 14px var(--font-system)", color: "var(--text-secondary)" }}>/ kg</span>
                </div>
              </div>
              <div style={{ font: "var(--weight-regular) 13px/1.4 var(--font-system)", color: "var(--text-secondary)", flex: "1 1 160px", paddingBottom: 6 }}>
                Carriers set their own rate (minimum {money(MIN_RATE)}/kg). Typical on this route: <b style={{ color: "var(--text-primary)" }}>{money(routes[ri].rate)}/kg</b>.
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "26px 0 8px" }}>
              <span style={{ font: "var(--weight-semibold) 14px var(--font-system)" }}>Spare luggage space</span>
              <span style={{ font: "var(--weight-bold) 14px var(--font-mono)" }}>{kg.toFixed(1)} kg</span>
            </div>
            <input type="range" min="1" max="50" step="0.5" value={kg} onChange={(e) => setKg(+e.target.value)} aria-label="Spare luggage space in kg" style={{ width: "100%", display: "block", margin: 0 }} />
          </div>
        </div>
        <div className="card" style={{ padding: "clamp(22px,3vw,34px)", boxShadow: "0 24px 60px -30px rgba(0,0,0,.4)" }}>
          <div className="eyebrow">Estimated payout</div>
          <div style={{ font: "var(--weight-bold) clamp(40px,5vw,64px) var(--font-system)", letterSpacing: "-.04em", color: "var(--price)", marginTop: 10, lineHeight: 1 }}>{money(net)}</div>
          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
            {[[`${kg.toFixed(1)} kg × ${money(effRate)}/kg`, money(gross)], ["Platform fee (12%)", "−" + money(fee)], ["Released after delivery code", money(net)]].map(([k, v], i) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, paddingTop: i === 2 ? 12 : 0, borderTop: i === 2 ? "1px solid var(--border)" : "none" }}>
                <span style={{ font: "var(--weight-regular) 14.5px var(--font-system)", color: "var(--text-secondary)" }}>{k}</span>
                <span style={{ font: `var(--weight-${i === 2 ? "bold" : "semibold"}) 14.5px var(--font-system)` }}>{v}</span>
              </div>
            ))}
          </div>
          <a href="#notify" className="btnk plain" style={{ width: "100%", marginTop: 24, justifyContent: "center" }}>Post a trip</a>
        </div>
      </div>
    </div>
  );
}

export function Faq() {
  const qs = [
    ["How does payment work?", "You pay when a booking is confirmed. Pasabayan holds the funds in escrow and releases them to the carrier only after the delivery code is confirmed. Eligible cancellations are refunded."],
    ["How do I get verified?", "Verification happens in tiers: email, then phone, with an optional government-ID review. Higher tiers get a premium badge and priority in search results."],
    ["What are handoff codes?", "Every pickup and delivery is sealed with a one-time code shared between sender and carrier. No matching code, no handoff — so there's always proof it happened."],
    ["Can I send errands instead of packages?", "Yes. Alongside packages you can request grocery, pharmacy, food delivery or general errands. Carriers submit receipts and expenses in-chat for your approval."],
    ["What happens if something goes wrong?", "Open the payment details to request a refund. Structured refund and dispute resolution gives you a clear path to recourse, with our team reviewing the case."],
  ];
  return (
    <div id="faq" className="wrap sec">
      <div className="eyebrow">FAQ</div>
      <h2 className="h2" style={{ marginTop: 14, maxWidth: "24ch" }}>Questions people ask before their first send.</h2>
      <div style={{ marginTop: 34, borderBottom: "1px solid var(--border)" }}>
        {qs.map(([q, a], i) => (
          <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>
        ))}
      </div>
    </div>
  );
}

const WAITLIST_URL = "https://api.pasabayan.com/api/waitlist";

function WaitlistForm() {
  const [state, setState] = useState({ status: "idle", message: "" });
  const busy = state.status === "submitting";

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState({ status: "submitting", message: "" });
    try {
      const res = await fetch(WAITLIST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), website: form.get("website") }),
      });
      const data = await res.json();
      if (res.ok) {
        setState({ status: "done", message: data.message || "Thanks for signing up! We'll notify you as soon as Pasabayan is ready to launch." });
      } else {
        setState({ status: "error", message: data.message || data.errors?.email?.[0] || "Something went wrong." });
      }
    } catch {
      setState({ status: "error", message: "Network error. Please try again." });
    }
  };

  if (state.status === "done") {
    return (
      <div role="status" style={{ display: "flex", gap: 12, alignItems: "flex-start", marginTop: 26, maxWidth: 520, border: "1px solid rgba(255,255,255,.28)", borderRadius: 14, padding: "16px 18px" }}>
        <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--success)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Icon name="check" size={15} /></span>
        <div>
          <div style={{ font: "var(--weight-semibold) 17px var(--font-system)" }}>You're on the list!</div>
          <div style={{ font: "var(--weight-regular) 15px/1.5 var(--font-system)", color: "rgba(255,255,255,.72)", marginTop: 4 }}>{state.message} Keep an eye on your inbox for updates.</div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ marginTop: 26, maxWidth: 520 }}>
      {/* Honeypot - hidden from real users */}
      <input type="text" name="website" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <input type="email" name="email" required disabled={busy} placeholder="you@email.com" aria-label="Email address" className="notifyInput" style={{ flex: "1 1 220px", height: 52, borderRadius: 14, border: "1px solid rgba(255,255,255,.28)", background: "transparent", color: "#fff", padding: "0 16px", font: "var(--weight-regular) 16px var(--font-system)" }} />
        <button type="submit" disabled={busy} className="btnk" style={{ background: "#fff", color: "var(--primary)" }}>{busy ? "Submitting..." : "Notify me"}</button>
      </div>
      {state.status === "error" && <p role="alert" style={{ font: "var(--weight-medium) 14px var(--font-system)", color: "#ff8a80", margin: "12px 0 0" }}>{state.message}</p>}
    </form>
  );
}

export function SiteFooter() {
  const social = [
    ["Facebook", "https://www.facebook.com/people/Pasabayan-Technology-Inc/61584644877767/", "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"],
    ["LinkedIn", "https://www.linkedin.com/company/pasabayan-technologies-inc/", "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"],
  ];
  return (
    <footer id="notify" style={{ background: "var(--primary)", color: "#fff" }}>
      <div className="wrap" style={{ paddingBlock: "clamp(56px,7vw,96px)" }}>
        <h2 className="h2" style={{ maxWidth: "22ch" }}>Be the first to know.</h2>
        <p style={{ font: "var(--weight-regular) 17px/1.5 var(--font-system)", color: "rgba(255,255,255,.72)", marginTop: 16, maxWidth: "46ch" }}>Pasabayan is launching soon. Sign up to get notified when the app is available.</p>
        <WaitlistForm />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between", alignItems: "center", marginTop: "clamp(48px,6vw,80px)", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,.18)", font: "var(--weight-regular) 13.5px var(--font-system)", color: "rgba(255,255,255,.62)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 9, color: "#fff", font: "var(--weight-bold) 17px var(--font-system)", letterSpacing: "-.03em" }}>
            <img src="/logo-white.svg" alt="" style={{ height: 22, width: "auto" }} />Pasabayan
          </span>
          <span>Connecting senders with travelers, one package at a time.</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 16 }}>
            © 2026 Pasabayan. All rights reserved.
            {social.map(([label, href, d]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="plain" style={{ color: "rgba(255,255,255,.62)", display: "inline-flex" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d={d} /></svg>
              </a>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}

