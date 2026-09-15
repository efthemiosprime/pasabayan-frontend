import { Icon } from './Icon.jsx';

/* Building blocks for the in-phone app mock — matched to real app screenshots. */

export const pclamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const rev = (p, s, e) => pclamp((p - s) / (e - s));
export const typed = (str, t) => str.slice(0, Math.round(str.length * pclamp(t)));

export const A_CITY = { font: "var(--weight-bold) 20px var(--font-system)", letterSpacing: "-0.02em", color: "var(--text-primary)" };
export const A_META = { font: "var(--weight-regular) 12px var(--font-system)", color: "var(--text-secondary)" };
export const A_VAL = { font: "var(--weight-bold) 14px var(--font-system)", color: "var(--text-primary)" };
export const A_PRICE = { font: "var(--weight-bold) 17px var(--font-system)", color: "var(--price)" };

export function Rise({ t = 1, dy = 14, children, style }) {
  return <div style={{ opacity: pclamp(t), transform: `translateY(${(1 - pclamp(t)) * dy}px)`, ...style }}>{children}</div>;
}

export function ACard({ children, style, pad = 14 }) {
  return <div style={{ background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", padding: pad, ...style }}>{children}</div>;
}

/* Gray route panel: country label over city, transport glyph between. */
export function RouteStrip({ from, to, fromLabel = "Canada", toLabel = "Canada", icon = "car-front", style }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, background: "var(--gray-6)", borderRadius: 14, padding: "10px 14px", ...style }}>
      <div>
        <div style={A_META}>{fromLabel}</div>
        <div style={A_CITY}>{from}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--gray-3)" }}>
        <span style={{ letterSpacing: 2, fontSize: 11 }}>‑‑‑</span>
        <Icon name={icon} size={18} color="var(--info)" />
        <span style={{ letterSpacing: 2, fontSize: 11 }}>‑‑‑</span>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={A_META}>{toLabel}</div>
        <div style={A_CITY}>{to}</div>
      </div>
    </div>
  );
}

/* Two-up meta cell grid with a hairline divider, as on trip / package cards. */
export function MetaPair({ left, right }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", gap: 12, alignItems: "center" }}>
      <div>{left}</div>
      <div style={{ alignSelf: "stretch", background: "var(--border)" }} />
      <div style={{ textAlign: "right" }}>{right}</div>
    </div>
  );
}

export function MetaCell({ icon, iconColor = "var(--info)", label, value, valueStyle, align = "left" }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: align === "right" ? "flex-end" : "flex-start", ...A_META }}>
        {icon && <Icon name={icon} size={13} color={iconColor} />}{label}
      </div>
      <div style={{ ...A_VAL, ...valueStyle, marginTop: 2 }}>{value}</div>
    </div>
  );
}

export function ScreenTitle({ title, sub }) {
  return (
    <div style={{ padding: "2px 16px 10px" }}>
      <div style={{ font: "var(--weight-bold) 24px var(--font-system)", letterSpacing: "-0.02em" }}>{title}</div>
      {sub && <div style={{ ...A_META, fontSize: 13, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export function SearchRow({ placeholder }) {
  return (
    <div style={{ margin: "0 16px", display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--border)", borderRadius: 14, padding: "6px 6px 6px 14px" }}>
      <span style={{ flex: 1, font: "var(--weight-regular) 14px var(--font-system)", color: "var(--gray-2)" }}>{placeholder}</span>
      <span style={{ width: 34, height: 34, borderRadius: 10, background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="search" size={17} /></span>
    </div>
  );
}

/* Pill: filter / status chips. tone: blue | blueSoft | dark | grey | orange | green */
export function APill({ children, tone = "grey", count }) {
  const tones = {
    blue: { background: "var(--info)", color: "#fff" },
    blueSoft: { background: "var(--blue-light)", color: "var(--info)" },
    dark: { background: "var(--primary)", color: "#fff" },
    grey: { background: "var(--gray-6)", color: "var(--text-primary)" },
    orange: { background: "var(--orange-light)", color: "var(--warning)" },
    green: { background: "var(--green-light)", color: "var(--price)" },
    greySolid: { background: "var(--gray-1)", color: "#fff" },
  };
  return (
    <span style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, font: "var(--weight-semibold) 13px var(--font-system)", ...tones[tone] }}>
      {children}{count != null && <b style={{ opacity: .8 }}>{count}</b>}
    </span>
  );
}

export function ViewToggle() {
  return (
    <div style={{ flex: "none", display: "flex", gap: 2, background: "var(--gray-6)", borderRadius: 999, padding: 4 }}>
      <span style={{ padding: "3px 9px", borderRadius: 999, display: "inline-flex" }}><Icon name="rows-2" size={16} /></span>
      <span style={{ padding: "3px 9px", borderRadius: 999, display: "inline-flex", color: "var(--text-primary)" }}><Icon name="list" size={16} /></span>
    </div>
  );
}

export function FilterRow({ children }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>{children}</div>;
}

export function BlueBtn({ children, icon, style }) {
  return <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, background: "var(--info)", color: "#fff", borderRadius: 12, padding: "10px 16px", font: "var(--weight-semibold) 14px var(--font-system)", ...style }}>{icon && <Icon name={icon} size={15} />}{children}</span>;
}

export function BlackBtn({ children, icon, style }) {
  return <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--primary)", color: "#fff", borderRadius: 14, padding: "14px 16px", font: "var(--weight-semibold) 16px var(--font-system)", ...style }}>{icon && <Icon name={icon} size={17} />}{children}</span>;
}

export function CardFoot({ left = "View Details", right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderTop: "1px solid var(--border)", marginTop: 12, paddingTop: 12 }}>
      <span style={{ font: "var(--weight-semibold) 14px var(--font-system)", color: "var(--info)" }}>{left}</span>
      {right}
    </div>
  );
}

export function VerifiedSeal({ size = 14 }) {
  return <span style={{ width: size, height: size, borderRadius: "50%", background: "var(--verified)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Icon name="check" size={size - 5} /></span>;
}

export function Initial({ letter = "J", size = 34, bg = "var(--warning)" }) {
  return <span style={{ width: size, height: size, borderRadius: "50%", background: bg, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", font: `var(--weight-semibold) ${Math.round(size * 0.44)}px var(--font-system)`, flex: "none" }}>{letter}</span>;
}

/* Simulated finger tap: a ripple over the target while t runs 0 → 1. Parent must be position: relative. */
export function Tap({ t }) {
  if (!(t > 0 && t < 1)) return null;
  return (
    <span aria-hidden="true" style={{ position: "absolute", left: "50%", top: "50%", width: 44, height: 44, marginLeft: -22, marginTop: -22, borderRadius: "50%", background: "rgba(0,0,0,.22)", boxShadow: "0 0 0 2px rgba(255,255,255,.7)", opacity: Math.sin(Math.PI * t), transform: `scale(${0.55 + 0.6 * t})`, pointerEvents: "none", zIndex: 5 }} />
  );
}

/* Press-down scale for a tapped control. */
export const pressScale = (t) => (t > 0 && t < 1 ? 1 - 0.06 * Math.sin(Math.PI * t) : 1);

/* Scrollable screen body. */
export function Body({ children, style, offset = 0 }) {
  return (
    <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
      <div style={{ transform: `translateY(${-offset}px)`, transition: "transform .5s cubic-bezier(.32,.72,0,1)", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 20, ...style }}>{children}</div>
    </div>
  );
}

