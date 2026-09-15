/* Hero search: carriers / packages switch, city autocomplete, optional date, results below. */
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./Icon.jsx";
import { searchCities, searchListings, isAbort, todayISO } from "./websiteSearch.js";

const MODES = [
  { type: "trips", tab: "Find carriers", from: "From", to: "To" },
  { type: "packages", tab: "Find packages", from: "Pickup", to: "Drop-off" },
];

const EMPTY_CITY = { text: "", city: null };
/* Keeps password managers (1Password, LastPass, Dashlane…) from decorating non-credential fields. */
const NO_AUTOFILL = { autoComplete: "off", "data-1p-ignore": "", "data-lpignore": "true", "data-form-type": "other" };
const LABEL = { font: "var(--weight-medium) 11px var(--font-mono)", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--text-secondary)" };

function ModeTabs({ mode, onChange, panelId }) {
  const refs = useRef([]);
  const onKeyDown = (e) => {
    const i = MODES.findIndex((m) => m.type === mode);
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: MODES.length - 1 }[e.key];
    if (next == null) return;
    e.preventDefault();
    const j = (next + MODES.length) % MODES.length;
    onChange(MODES[j].type);
    refs.current[j]?.focus();
  };
  return (
    <div role="tablist" aria-label="Search for" onKeyDown={onKeyDown} style={{ display: "inline-flex", gap: 2, maxWidth: "100%", background: "var(--gray-6)", borderRadius: 999, padding: 3 }}>
      {MODES.map((m, i) => {
        const selected = m.type === mode;
        return (
          <button key={m.type} ref={(el) => (refs.current[i] = el)} type="button" role="tab" id={`${panelId}-${m.type}`} aria-selected={selected} aria-controls={panelId} tabIndex={selected ? 0 : -1} className="segTab" onClick={() => onChange(m.type)}>
            {m.tab}
          </button>
        );
      })}
    </div>
  );
}

function CityField({ label, name, value, onChange, className = "" }) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [active, setActive] = useState(-1);
  const query = value.text.trim();

  useEffect(() => {
    if (value.city || query.length < 2) {
      setOptions([]);
      setStatus("idle");
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      setStatus("loading");
      searchCities(query, { signal: ctrl.signal })
        .then((list) => { setOptions(list); setActive(-1); setStatus("done"); })
        .catch((e) => { if (!isAbort(e)) { setOptions([]); setStatus("error"); } });
    }, 250);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [query, value.city]);

  const select = (city) => {
    onChange({ text: city.display, city });
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!options.length) return;
      e.preventDefault();
      setOpen(true);
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (a + step + options.length) % options.length);
    } else if (e.key === "Enter" && open && options.length) {
      e.preventDefault();
      select(options[Math.max(active, 0)]);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
    }
  };

  const showList = open && !value.city && query.length >= 2 && status !== "idle";
  const rowStyle = { padding: "10px 12px", font: "var(--weight-medium) 14px var(--font-system)", color: "var(--text-secondary)" };

  return (
    <div className={`searchField ${className}`}>
      <label htmlFor={id} style={{ ...LABEL, display: "block" }}>{label}</label>
      <input
        id={id}
        name={name}
        className="searchInput"
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList && options.length > 0}
        aria-controls={listId}
        aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
        {...NO_AUTOFILL}
        spellCheck={false}
        placeholder="City"
        value={value.text}
        onChange={(e) => { onChange({ text: e.target.value, city: null }); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        style={{ paddingRight: value.text ? 26 : 0 }}
      />
      {value.text && (
        <button type="button" aria-label={`Clear ${label}`} onClick={() => { onChange(EMPTY_CITY); document.getElementById(id)?.focus(); }}
          style={{ position: "absolute", right: 10, bottom: 12, width: 24, height: 24, border: "none", borderRadius: "50%", background: "var(--gray-5)", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
          <Icon name="x" size={14} strokeWidth={2.25} />
        </button>
      )}
      <ul id={listId} role="listbox" aria-label={`${label} cities`} hidden={!showList}
        style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, minWidth: "min(240px, calc(100vw - 48px))", zIndex: 30, margin: 0, padding: 6, listStyle: "none", background: "var(--background)", border: "1px solid var(--border)", borderRadius: 14, boxShadow: "0 16px 40px -16px rgba(0,0,0,.3)" }}>
        {status === "loading" && !options.length && <li role="presentation" style={rowStyle}>Searching…</li>}
        {status === "done" && !options.length && <li role="presentation" style={rowStyle}>No matching cities</li>}
        {status === "error" && <li role="presentation" style={rowStyle}>Cities are unavailable right now</li>}
        {options.map((c, i) => (
          <li key={c.id} id={`${listId}-${i}`} role="option" aria-selected={i === active} className="searchOption"
            onMouseDown={(e) => e.preventDefault()} onMouseEnter={() => setActive(i)} onClick={() => select(c)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer", font: "var(--weight-semibold) 15px var(--font-system)" }}>
            <Icon name="map-pin" size={16} color="var(--text-secondary)" />
            <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.display}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Search request state, lifted so Hero can render results below its two-column grid. */
export function useListingSearch() {
  const [state, setState] = useState({ status: "idle" }); // idle | loading | error{kind} | done{data}
  const ctrlRef = useRef(null);
  const lastRef = useRef(null);

  useEffect(() => () => ctrlRef.current?.abort(), []);

  const run = (params) => {
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    lastRef.current = params;
    setState({ status: "loading", type: params.type });
    searchListings(params, { signal: ctrl.signal })
      .then((data) => setState({ status: "done", type: params.type, data }))
      .catch((e) => {
        if (isAbort(e)) return;
        setState({ status: "error", type: params.type, kind: e?.kind || "unavailable" });
      });
  };

  return { state, run, lastRef, retry: () => lastRef.current && run(lastRef.current) };
}

export function HeroSearch({ search }) {
  const panelId = useId();
  const [mode, setMode] = useState("trips");
  const [from, setFrom] = useState(EMPTY_CITY);
  const [to, setTo] = useState(EMPTY_CITY);
  const [date, setDate] = useState("");
  const [formError, setFormError] = useState("");
  const m = MODES.find((x) => x.type === mode);

  const onSubmit = (e) => {
    e.preventDefault();
    const unpicked = (f) => f.text.trim() && !f.city;
    if ((!from.city && !to.city) || unpicked(from) || unpicked(to)) return setFormError("Choose a city");
    if (date && date < todayISO()) return setFormError("Pick today or a later date");
    setFormError("");
    search.run({ type: mode, fromCityId: from.city?.id, toCityId: to.city?.id, date });
  };

  const onMode = (type) => {
    if (type === mode) return;
    setMode(type);
    if (search.lastRef.current && search.state.status !== "idle") search.run({ ...search.lastRef.current, type });
  };

  return (
    <div style={{ marginTop: 26 }}>
      <ModeTabs mode={mode} onChange={onMode} panelId={panelId} />
      <div id={panelId} role="tabpanel" aria-labelledby={`${panelId}-${mode}`} className="heroSearchWrap" style={{ marginTop: 10 }}>
        <form role="search" className="heroSearch" onSubmit={onSubmit} noValidate autoComplete="off" data-form-type="other" aria-describedby={formError ? `${panelId}-err` : undefined}>
          <CityField label={m.from} name="origin-city" value={from} onChange={(v) => { setFrom(v); setFormError(""); }} />
          <CityField label={m.to} name="destination-city" value={to} onChange={(v) => { setTo(v); setFormError(""); }} />
          <div className="searchField sfWhen">
            <label htmlFor={`${panelId}-date`} style={{ ...LABEL, display: "block" }}>When</label>
            <input id={`${panelId}-date`} name="travel-date" className="searchInput" type="date" min={todayISO()} value={date} onChange={(e) => { setDate(e.target.value); setFormError(""); }} {...NO_AUTOFILL} />
          </div>
          <button type="submit" className="btnk heroSearchBtn"><Icon name="search" size={17} />{m.tab}</button>
        </form>
      </div>
      {formError && (
        <div id={`${panelId}-err`} role="alert" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, font: "var(--weight-medium) 14px var(--font-system)", color: "var(--error)" }}>
          <Icon name="circle-alert" size={16} />{formError}
        </div>
      )}
    </div>
  );
}
