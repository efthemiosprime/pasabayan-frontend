import { Fragment } from 'react';
import { Icon } from './Icon.jsx';
import { rev, typed, A_META, A_PRICE, Rise, ACard, RouteStrip, MetaPair, MetaCell, ScreenTitle, SearchRow, APill, ViewToggle, FilterRow, BlueBtn, BlackBtn, CardFoot, VerifiedSeal, Initial, Body } from './appKit.jsx';

/* Screens A — create-request wizard, Explore (Find Carriers / Find Packages). */

export function TripCard({ from, to, icon, pickup, delivery, weight, price, status, statusTone = "blueSoft", cta = "Request to Book" }) {
  return (
    <ACard>
      <RouteStrip from={from} to={to} icon={icon} />
      <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
      <MetaPair
        left={<MetaCell icon="calendar" label="Pickup" value={pickup} />}
        right={<MetaCell label="Delivery" value={delivery} align="right" />}
      />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 10 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, ...A_META }}>
          <span style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--success)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name="check" size={11} /></span>
          Available weight: {weight}
        </span>
        <span style={A_META}>Price: <b style={A_PRICE}>{price}</b></span>
      </div>
      <div style={{ marginTop: 10 }}><APill tone={statusTone}>{status}</APill></div>
      <CardFoot right={<BlueBtn icon="send">{cta}</BlueBtn>} />
    </ACard>
  );
}

export function PackageCard({ name = "John Doe", title, tags, from, to, pickup, delivery, weight, budget }) {
  return (
    <ACard>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Initial letter={name[0]} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, font: "var(--weight-semibold) 15px var(--font-system)" }}>{name}<VerifiedSeal /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, ...A_META }}><Icon name="star" size={12} color="var(--yellow)" />4.5 (10)</div>
        </div>
        <Icon name="chevron-right" size={18} color="var(--gray-3)" />
      </div>
      <div style={{ font: "var(--weight-semibold) 15px var(--font-system)", marginTop: 10 }}>{title}</div>
      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
        {tags.map((t) => <APill key={t.label} tone={t.tone}>{t.label}</APill>)}
      </div>
      <RouteStrip from={from} to={to} fromLabel="From" toLabel="To" icon="package" style={{ marginTop: 10 }} />
      <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
      <MetaPair
        left={<MetaCell icon="calendar" label="Pickup Date:" value={pickup} />}
        right={<MetaCell icon="calendar-check" iconColor="var(--success)" label="Delivery Needed:" value={delivery} align="right" />}
      />
      <MetaPair
        left={<MetaCell icon="weight" label="Weight:" value={weight} />}
        right={<MetaCell icon="circle-dollar-sign" iconColor="var(--price)" label="Budget:" value={budget} valueStyle={A_PRICE} align="right" />}
      />
      <CardFoot left="" right={<span style={{ font: "var(--weight-semibold) 14px var(--font-system)", color: "var(--info)" }}>Request to Carry</span>} />
    </ACard>
  );
}

/* Shipper Explore — "Find Carriers" */
export function ExploreCarriers({ p = 1 }) {
  const cards = [
    { from: "Toronto", to: "Montreal", icon: "car-front", pickup: "Dec 20, 2024", delivery: "Dec 20, 2024", weight: "50.0 kg", price: "$2.50/kg", status: "Planning", statusTone: "blueSoft" },
    { from: "Vancouver", to: "Calgary", icon: "plane", pickup: "Jan 4, 2025", delivery: "Jan 4, 2025", weight: "12.5 kg", price: "$4.00/kg", status: "Active", statusTone: "green" },
    { from: "Ottawa", to: "Quebec City", icon: "bus", pickup: "Jan 11, 2025", delivery: "Jan 11, 2025", weight: "30.0 kg", price: "$3.50/kg", status: "Active", statusTone: "green" },
  ];
  return (
    <Fragment>
      <ScreenTitle title="Find Carriers" sub="Ship packages with trusted carriers" />
      <SearchRow placeholder="Search origin or destination..." />
      <div style={{ margin: "10px 16px 0", display: "flex", background: "var(--gray-6)", borderRadius: 999, padding: 3 }}>
        {["Online now", "Top nearby"].map((s, i) => (
          <span key={s} style={{ flex: 1, textAlign: "center", padding: "6px 0", borderRadius: 999, background: i === 0 ? "#fff" : "transparent", boxShadow: i === 0 ? "0 1px 2px rgba(0,0,0,.08)" : "none", font: "var(--weight-semibold) 13px var(--font-system)" }}>{s}</span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, padding: "10px 16px", overflow: "hidden" }}>
        {[["James Lee", "0.8 km"], ["Sarah Chen", "2.3 km"], ["David R.", "3.1 km"]].map(([n, d]) => (
          <span key={n} style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid var(--border)", borderRadius: 999, padding: "6px 11px", font: "var(--weight-medium) 13px var(--font-system)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)" }} />{n}<span style={{ color: "var(--text-secondary)" }}>{d}</span>
          </span>
        ))}
      </div>
      <FilterRow><APill tone="blue">All trips</APill><APill tone="blueSoft"><Icon name="globe" size={13} />Pasabuy</APill><span style={{ flex: 1 }} /><ViewToggle /></FilterRow>
      <Body style={{ padding: "12px 16px 0" }}>
        {cards.map((c, i) => <Rise key={c.to} t={rev(p, 0.05 + i * 0.16, 0.3 + i * 0.16)}><TripCard {...c} /></Rise>)}
      </Body>
    </Fragment>
  );
}

/* Carrier Explore — "Find Packages" */
export function ExplorePackages({ p = 1 }) {
  const cards = [
    { title: "Important documents", tags: [{ label: "Documents", tone: "greySolid" }, { label: "Normal", tone: "dark" }], from: "Toronto", to: "Montreal", pickup: "Dec 20, 2024", delivery: "Dec 21, 2024", weight: "1.5 kg", budget: "$45.00" },
    { title: "Laptop + charger", tags: [{ label: "Electronics", tone: "greySolid" }, { label: "Urgent", tone: "orange" }], from: "Toronto", to: "Vancouver", pickup: "Dec 20, 2024", delivery: "Dec 21, 2024", weight: "2.0 kg", budget: "$85.00" },
  ];
  return (
    <Fragment>
      <ScreenTitle title="Find Packages" sub="Browse available packages and errands" />
      <SearchRow placeholder="Search by city, store or item..." />
      <div style={{ height: 10 }} />
      <FilterRow><APill tone="blue">All packages</APill><APill tone="blueSoft"><Icon name="globe" size={13} />Pasabuy</APill><span style={{ flex: 1 }} /><ViewToggle /></FilterRow>
      <Body style={{ padding: "12px 16px 0" }}>
        {cards.map((c, i) => <Rise key={c.title} t={rev(p, 0.05 + i * 0.2, 0.35 + i * 0.2)}><PackageCard {...c} /></Rise>)}
      </Body>
    </Fragment>
  );
}

/* Shipper create-request wizard, step 1 of 5 — "What it is" */
export function CreateWizard({ p = 1 }) {
  const steps = [["message-square", "What it is"], ["send", "Pickup"], ["navigation", "Handoff"], ["weight", "Weight"], ["calendar", "Dates"]];
  const item = typed("Important documents", rev(p, 0.32, 0.55));
  const weight = typed("1.5", rev(p, 0.55, 0.68));
  const value = typed("200", rev(p, 0.68, 0.8));
  const ready = rev(p, 0.8, 0.95);
  return (
    <Fragment>
      <div style={{ padding: "0 16px 10px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ font: "var(--weight-semibold) 14px var(--font-system)", color: "var(--text-secondary)" }}>Required Steps</span>
          <APill tone="blue">1/5</APill>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
          {steps.map(([ic, lb], i) => (
            <div key={lb} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: 62 }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: i === 0 ? "var(--info)" : "var(--gray-6)", color: i === 0 ? "#fff" : "var(--gray-1)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name={ic} size={17} /></span>
              <span style={{ font: "var(--weight-medium) 10px var(--font-system)", color: i === 0 ? "var(--info)" : "var(--text-tertiary)" }}>{lb}</span>
            </div>
          ))}
        </div>
      </div>
      <Body style={{ padding: "14px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
          {[0, 1, 2, 3].map((i) => <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i === 0 ? "var(--info)" : "var(--gray-4)" }} />)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Icon name="message-square" size={22} color="var(--info)" />
          <span style={{ font: "var(--weight-bold) 21px var(--font-system)", letterSpacing: "-0.02em" }}>What it is</span>
        </div>
        <div style={{ ...A_META, fontSize: 13, marginTop: -6 }}>Describe your package and add photos.</div>
        <div style={{ border: "1.5px dashed var(--gray-3)", borderRadius: 14, padding: "18px 14px", textAlign: "center" }}>
          <Icon name="upload" size={26} />
          <div style={{ font: "var(--weight-semibold) 15px var(--font-system)", marginTop: 6 }}>Upload photos</div>
          <div style={{ ...A_META, fontSize: 12, marginTop: 2 }}>Drag and drop or click to browse</div>
          <div style={{ marginTop: 10 }}><BlueBtn icon="image-plus">Choose Files</BlueBtn></div>
        </div>
        {[["What are you sending?", item, ""], ["Approx. weight (kg)", weight, "kg"], ["Declared value", value, "$"]].map(([label, val, unit]) => (
          <div key={label}>
            <div style={{ font: "var(--weight-semibold) 13px var(--font-system)", marginBottom: 5 }}>{label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--gray-6)", borderRadius: 12, padding: "11px 13px" }}>
              <span style={{ flex: 1, font: "var(--weight-regular) 14px var(--font-system)", color: val ? "var(--text-primary)" : "var(--gray-2)" }}>{val || label}</span>
              {unit && <span style={{ ...A_META }}>{unit}</span>}
            </div>
          </div>
        ))}
      </Body>
      <div style={{ padding: "8px 16px 10px", flex: "none" }}>
        <BlackBtn style={{ opacity: 0.35 + ready * 0.65 }}>Next</BlackBtn>
      </div>
    </Fragment>
  );
}

