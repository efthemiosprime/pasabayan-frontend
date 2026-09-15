/* Device frame, in-app status/tab bars, and scroll-progress hooks. */
import { useEffect, useState } from 'react';
import { Icon } from './Icon.jsx';
import { pclamp, Tap } from './appKit.jsx';

function StatusBar() {
  return (
    <div style={{ height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px 0 28px", flex: "none", color: "#000" }}>
      <span style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-system)" }}>11:39</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ letterSpacing: 1, fontSize: 13 }}>••••</span>
        <Icon name="wifi" size={17} />
        <Icon name="battery-full" size={24} />
      </div>
    </div>
  );
}

export function TabBar({ active, onChange, role, tap }) {
  const tabs = [
    { id: "explore", label: "Explore", icon: "search" },
    { id: "matches", label: "Matches", icon: "users" },
    { id: "packages", label: role === "carrier" ? "My Trips" : "Packages", icon: "package" },
    { id: "messages", label: "Messages", icon: "message-square" },
    { id: "profile", label: "Profile", icon: "circle-user-round", badge: 1 },
  ];
  return (
    <div style={{ height: 64, display: "flex", flex: "none", paddingBottom: 12, borderTop: "1px solid var(--border)", background: "rgba(255,255,255,0.94)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button key={t.id} type="button" tabIndex={onChange ? 0 : -1} onClick={() => onChange?.(t.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, border: "none", background: "transparent", cursor: onChange ? "pointer" : "default", color: on ? "var(--info)" : "var(--gray-1)", WebkitTapHighlightColor: "transparent", position: "relative" }}>
            <div style={{ position: "relative" }}>
              <Icon name={t.icon} size={24} />
              {tap?.id === t.id && <Tap t={tap.t} />}
              {t.badge && <span style={{ position: "absolute", top: -4, right: -8, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 8, background: "var(--error)", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{t.badge}</span>}
            </div>
            <span style={{ fontSize: 10, fontWeight: on ? 600 : 500, fontFamily: "var(--font-system)" }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Phone({ children, tab, onTab, role = "shipper", scale = 1, style }) {
  return (
    <div style={{ width: 390 * scale, height: 844 * scale, flex: "none", ...style }}>
      <div style={{ width: 390, height: 844, transform: `scale(${scale})`, transformOrigin: "top left", position: "relative", borderRadius: 54, background: "#0b0b0c", padding: 11, boxShadow: "0 40px 80px -24px rgba(0,0,0,.42), 0 0 0 1px rgba(0,0,0,.35)" }}>
        <div style={{ position: "absolute", inset: 11, borderRadius: 44, overflow: "hidden", background: "var(--background)", display: "flex", flexDirection: "column" }}>
          <StatusBar />
          <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 104, height: 30, borderRadius: 999, background: "#0b0b0c" }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>{children}</div>
          {tab && <TabBar active={tab} onChange={onTab} role={role} />}
        </div>
      </div>
    </div>
  );
}

/* Maps a tall section's scroll range onto {i, p} over `count` steps. */
export function useScrollSteps(ref, count) {
  const [s, setS] = useState({ i: 0, p: 0, t: 0 });
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const total = Math.max(r.height - window.innerHeight, 1);
      const t = pclamp(-r.top / total);
      const x = t * count;
      const i = Math.min(count - 1, Math.floor(x));
      setS({ i, p: pclamp(x - i), t });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [count]);
  return s;
}

export const NARROW_QUERY = "(max-width: 900px)";

export function useIsNarrow() {
  const [narrow, setNarrow] = useState(() => window.matchMedia(NARROW_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(NARROW_QUERY);
    const on = () => setNarrow(mq.matches);
    on(); mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return narrow;
}

export function usePhoneScale(max = 1) {
  const [s, setS] = useState(max);
  useEffect(() => {
    const on = () => {
      // Stacked (phone/tablet) layouts: the phone scrolls in normal flow, so only the
      // column width matters. Fitting it to the viewport height as well shrank it to
      // ~62% of the screen on phones, whose visible height is ~650px with browser bars.
      if (window.matchMedia(NARROW_QUERY).matches) {
        setS(Math.min(1, (window.innerWidth * 0.8) / 390)); // 80% of the screen width
        return;
      }
      // Side-by-side layouts share the width with copy and must fit one screen.
      const byHeight = (window.innerHeight - 140) / 844;
      const byWidth = (Math.min(window.innerWidth, 1240) * 0.42) / 390;
      setS(Math.min(max, byHeight, byWidth));
    };
    on(); window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, [max]);
  return Math.max(0.42, s);
}
