import { Fragment } from 'react';
import { Icon } from './Icon.jsx';
import { rev, A_META, A_VAL, A_PRICE, Rise, ACard, RouteStrip, MetaPair, MetaCell, ScreenTitle, APill, ViewToggle, BlackBtn, CardFoot, VerifiedSeal, Initial, Body } from './appKit.jsx';
import { PackageCard } from './screensA.jsx';

/* Screens B — Matches, Booking Details (by status), Chat, Packages / My Trips, Profile. */

export function MatchesScreen({ p = 1, role = "shipper" }) {
  return (
    <Fragment>
      <div style={{ margin: "2px 16px 0", background: "var(--gray-6)", borderRadius: 12, padding: "10px 14px", textAlign: "center", ...A_META, fontSize: 13 }}>
        {role === "shipper" ? "Matches with carriers for your package requests." : "Packages you've been matched with."}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px 0" }}>
        <span style={{ font: "var(--weight-medium) 14px var(--font-system)" }}>Filter by status</span>
        <Icon name="info" size={14} color="var(--gray-2)" />
        <span style={{ flex: 1 }} /><ViewToggle />
      </div>
      <div style={{ display: "flex", gap: 8, padding: "10px 16px", overflow: "hidden", borderBottom: "1px solid var(--border)" }}>
        <APill tone="dark" count="4">All</APill>
        <APill tone="grey" count="1">Carrier Requested</APill>
        <APill tone="grey" count="0">Shipper Requested</APill>
      </div>
      <Body style={{ padding: "12px 16px 0" }}>
        <Rise t={rev(p, 0.05, 0.3)}>
          <ACard>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ font: "var(--weight-bold) 18px var(--font-system)", letterSpacing: "-0.02em" }}>Booking #301</div>
                <div style={{ ...A_META, marginTop: 1 }}>Important documents</div>
              </div>
              <APill tone="orange">Carrier requested</APill>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, paddingBottom: 8, borderBottom: "1.5px solid var(--error)" }}>
              <Icon name="circle-alert" size={14} color="var(--error)" />
              <span style={{ font: "var(--weight-semibold) 13px var(--font-system)", color: "var(--error)" }}>Pickup overdue</span>
              <span style={A_META}>· Dec 20, 2024 at 5:00 AM</span>
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
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--orange-light)", borderRadius: 12, padding: "9px 12px", marginTop: 10 }}>
              <Icon name="bell-ring" size={15} color="var(--warning)" />
              <span style={{ font: "var(--weight-medium) 13px var(--font-system)", color: "var(--warning)" }}>Carrier requested – Awaiting your response</span>
            </div>
            <CardFoot right={<span style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--info)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name="ellipsis" size={18} /></span>} />
          </ACard>
        </Rise>
        <Rise t={rev(p, 0.3, 0.6)}>
          <ACard>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ font: "var(--weight-bold) 18px var(--font-system)", letterSpacing: "-0.02em" }}>Booking #302</div>
                <div style={{ ...A_META, marginTop: 1 }}>Important documents</div>
              </div>
              <APill tone="blueSoft">Booking confirmed</APill>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 0" }}>
              <Initial letter="J" size={30} />
              <span style={{ display: "flex", alignItems: "center", gap: 5, font: "var(--weight-semibold) 15px var(--font-system)", flex: 1 }}>James Lee<VerifiedSeal /></span>
            </div>
            <RouteStrip from="Toronto" to="Montreal" />
          </ACard>
        </Rise>
      </Body>
    </Fragment>
  );
}

export const TL_STEPS = ["Shipper Requested", "Booking confirmed", "Picked up", "On the way", "Delivered"];

export function BookingDetail({ status = "confirmed", p = 1 }) {
  const cfg = {
    confirmed: { pill: "Booking confirmed", tone: "blueSoft", at: 1, cta: "Pay $60.50", ctaIcon: "credit-card" },
    in_transit: { pill: "In Transit", tone: "green", at: 3, cta: "Generate Delivery Code", ctaIcon: "key-round" },
    delivered: { pill: "Delivered", tone: "green", at: 5, cta: "Leave a review", ctaIcon: "star" },
  }[status];
  return (
    <Fragment>
      <div style={{ height: 40, display: "flex", alignItems: "center", justifyContent: "center", flex: "none", font: "var(--weight-semibold) 17px var(--font-system)" }}>Booking Details</div>
      <Body style={{ padding: "0 14px", gap: 10 }} offset={status === "confirmed" ? 0 : 60}>
        <ACard pad={12}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div style={{ font: "var(--weight-bold) 17px var(--font-system)" }}>Booking #700</div>
              <div style={{ ...A_META, fontSize: 11.5 }}>Created: Dec 19, 2024 at 5:00 AM</div>
            </div>
            <APill tone={cfg.tone}>{cfg.pill}</APill>
          </div>
        </ACard>
        <ACard pad={12}>
          <div style={{ font: "var(--weight-bold) 17px var(--font-system)", marginBottom: 8 }}>Trip Summary</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div><div style={A_META}>From city</div><div style={{ ...A_VAL, fontSize: 16 }}>Toronto</div></div>
            <Icon name="arrow-right" size={16} color="var(--info)" />
            <div style={{ textAlign: "right" }}><div style={A_META}>To city</div><div style={{ ...A_VAL, fontSize: 16 }}>Montreal</div></div>
          </div>
          {[["Pickup", "Dec 20, 2024"], ["Delivery", "Dec 20, 2024"], ["Available space", "25.0 kg"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}><span style={A_META}>{k}</span><span style={A_VAL}>{v}</span></div>
          ))}
        </ACard>
        <ACard pad={12}>
          <div style={{ font: "var(--weight-bold) 17px var(--font-system)", marginBottom: 8 }}>Package Summary</div>
          {[["Package name", "Important documents"], ["Weight:", "1.5 kg"], ["Category", "Documents"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}><span style={A_META}>{k}</span><span style={A_VAL}>{v}</span></div>
          ))}
        </ACard>
        <ACard pad={12}>
          <div style={{ font: "var(--weight-bold) 17px var(--font-system)", marginBottom: 8 }}>Payment Summary</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={A_META}>Total price</span><span style={{ ...A_PRICE, fontSize: 21 }}>$55.00</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}><span style={{ ...A_META, fontSize: 11.5 }}>Your budget limit</span><span style={{ ...A_META, fontSize: 11.5 }}>$60.00</span></div>
        </ACard>
        <div style={{ display: "flex", gap: 9, background: "rgba(255,149,0,0.12)", border: "1px solid rgba(255,149,0,0.45)", borderRadius: 12, padding: "10px 12px" }}>
          <Icon name="clock-alert" size={17} color="var(--warning)" />
          <div>
            <div style={{ font: "var(--weight-semibold) 13px var(--font-system)" }}>Auto-cancels today</div>
            <div style={{ ...A_META, fontSize: 11.5 }}>Move this match forward or it'll cancel automatically. Payment stays on hold until then.</div>
          </div>
        </div>
        <ACard pad={12}>
          <div style={{ font: "var(--weight-bold) 17px var(--font-system)", marginBottom: 10 }}>Progress Timeline</div>
          {TL_STEPS.map((s, i) => {
            const reached = i < cfg.at + Math.floor(rev(p, 0.4, 0.95) * 0.001);
            const done = i < cfg.at, current = i === cfg.at;
            return (
              <div key={s} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
                  <span style={{ width: 11, height: 11, borderRadius: "50%", background: done ? "var(--success)" : current ? "#fff" : "var(--gray-1)", border: current ? "3px solid var(--info)" : "none", marginTop: 4 }} />
                  {i < TL_STEPS.length - 1 && <span style={{ width: 2, height: 22, background: "var(--gray-5)" }} />}
                </div>
                <div style={{ flex: 1, paddingBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ font: `var(--weight-${current ? "semibold" : "medium"}) 14px var(--font-system)`, color: reached || current ? "var(--text-primary)" : "var(--text-secondary)" }}>{s}</span>
                    {done && <Icon name="circle-check-big" size={15} color="var(--success)" />}
                    {current && <span style={{ font: "var(--weight-medium) 12px var(--font-system)", color: "var(--info)" }}>Current</span>}
                  </div>
                  {i === 0 && <div style={{ ...A_META, fontSize: 11 }}>Dec 19, 2024 at 5:00 AM</div>}
                </div>
              </div>
            );
          })}
        </ACard>
      </Body>
      <div style={{ padding: "6px 14px 10px", flex: "none" }}><BlackBtn icon={cfg.ctaIcon}>{cfg.cta}</BlackBtn></div>
    </Fragment>
  );
}

export function Bubble({ side = "sys", children, meta, t = 1 }) {
  const styles = {
    sys: { background: "var(--blue-light)", color: "var(--info)", alignSelf: "stretch", textAlign: "center" },
    out: { background: "var(--info)", color: "#fff", alignSelf: "flex-end", textAlign: "right" },
    in: { background: "var(--gray-6)", color: "var(--text-primary)", alignSelf: "flex-start" },
  }[side];
  return (
    <Rise t={t} dy={10} style={{ display: "flex", flexDirection: "column", alignItems: side === "out" ? "flex-end" : side === "in" ? "flex-start" : "stretch" }}>
      <div style={{ maxWidth: side === "sys" ? "100%" : "82%", borderRadius: 16, padding: "9px 13px", font: "var(--weight-regular) 14px/1.35 var(--font-system)", ...styles }}>
        {children}
        {meta && <div style={{ fontSize: 11, opacity: .8, marginTop: 3 }}>{meta}</div>}
      </div>
    </Rise>
  );
}

export function ChatScreen({ p = 1 }) {
  return (
    <Fragment>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 14px 10px", borderBottom: "1px solid var(--border)", flex: "none" }}>
        <Icon name="chevron-left" size={22} color="var(--info)" />
        <Initial letter="J" size={30} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, font: "var(--weight-semibold) 15px var(--font-system)" }}>James Lee<VerifiedSeal /></div>
          <div style={{ ...A_META, fontSize: 11.5 }}>Booking #700 · Toronto → Montreal</div>
        </div>
      </div>
      <Body style={{ padding: "12px 14px 0", gap: 9 }}>
        <Bubble side="sys" t={rev(p, 0, .12)}><Icon name="sparkles" size={13} /> Match created — Toronto → Montreal. The sender will share the receiver's contact info and preferred pickup location to coordinate handoff.</Bubble>
        <Bubble side="sys" t={rev(p, .12, .28)}>💳 Payment captured: $55.00. Funds held in escrow until delivery.</Bubble>
        <Bubble side="in" t={rev(p, .3, .45)} meta="10m">Hi! I'll be at the pickup spot around 3pm.</Bubble>
        <Bubble side="out" t={rev(p, .45, .6)} meta="9m ✓ Delivered">Perfect, see you then.</Bubble>
        <Bubble side="out" t={rev(p, .6, .75)} meta="now ✓ Delivered">On my way 🚗</Bubble>
        <Bubble side="sys" t={rev(p, .78, .95)}>Handoff code confirmed — pickup verified. Payment stays in escrow until delivery.</Bubble>
      </Body>
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 14px 10px", flex: "none" }}>
        <div style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 999, padding: "10px 14px", ...A_META }}>Message</div>
        <span style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name="send" size={17} /></span>
      </div>
    </Fragment>
  );
}

export function PackagesScreen({ p = 1 }) {
  return (
    <Fragment>
      <ScreenTitle title="My Packages" sub="Everything you've sent or scheduled" />
      <div style={{ display: "flex", gap: 8, padding: "0 16px 10px", borderBottom: "1px solid var(--border)" }}>
        <APill tone="dark" count="3">All</APill><APill tone="grey" count="1">Open</APill><APill tone="grey" count="2">Matched</APill>
      </div>
      <Body style={{ padding: "12px 16px 0" }}>
        <Rise t={rev(p, 0, .3)}><PackageCard name="Maria Santos" title="Important documents" tags={[{ label: "Documents", tone: "greySolid" }, { label: "Normal", tone: "dark" }]} from="Toronto" to="Montreal" pickup="Dec 20, 2024" delivery="Dec 21, 2024" weight="1.5 kg" budget="$45.00" /></Rise>
        <Rise t={rev(p, .25, .55)}><PackageCard name="Maria Santos" title="Pharmacy pickup" tags={[{ label: "Errand", tone: "greySolid" }, { label: "Urgent", tone: "orange" }]} from="Toronto" to="Toronto" pickup="Dec 21, 2024" delivery="Dec 21, 2024" weight="0.4 kg" budget="$22.00" /></Rise>
      </Body>
    </Fragment>
  );
}

export function TripsScreen({ p = 1 }) {
  const trips = [
    { status: "In Transit", tone: "orange", from: "Toronto", to: "Montreal", icon: "car-front", cap: "50.0 kg", price: "$120.00", dep: "Dec 20, 2024" },
    { status: "Active", tone: "green", from: "Vancouver", to: "Calgary", icon: "plane", cap: "12.5 kg", price: "$95.00", dep: "Jan 4, 2025" },
  ];
  return (
    <Fragment>
      <ScreenTitle title="My Trips" sub="Your posted routes and capacity" />
      <div style={{ display: "flex", gap: 8, padding: "0 16px 10px", borderBottom: "1px solid var(--border)" }}>
        <APill tone="dark" count="2">All</APill><APill tone="grey">Scheduled</APill><APill tone="grey">Completed</APill>
      </div>
      <Body style={{ padding: "12px 16px 0" }}>
        {trips.map((t, i) => (
          <Rise key={t.to} t={rev(p, i * 0.25, 0.3 + i * 0.25)}>
            <ACard>
              <div style={{ display: "flex", justifyContent: "flex-end" }}><APill tone={t.tone}>{t.status}</APill></div>
              <RouteStrip from={t.from} to={t.to} icon={t.icon} style={{ marginTop: 8 }} />
              <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
              <MetaPair left={<MetaCell icon="calendar" label="Departure" value={t.dep} />} right={<MetaCell label="Arrival" value={t.dep} align="right" />} />
              <div style={{ ...A_META, marginTop: 8 }}>{i === 0 ? "1 package assigned" : "No packages assigned yet"}</div>
              <MetaPair
                left={<MetaCell icon="package" label="Available Capacity" value={t.cap} />}
                right={<MetaCell icon="circle-dollar-sign" iconColor="var(--price)" label="Price" value={t.price} valueStyle={A_PRICE} align="right" />}
              />
              <CardFoot right={<span style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--info)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name="ellipsis" size={18} /></span>} />
            </ACard>
          </Rise>
        ))}
      </Body>
    </Fragment>
  );
}

export function ProfileScreen({ role = "shipper" }) {
  return (
    <Fragment>
      <Body style={{ padding: "6px 14px 0", gap: 10 }}>
        <ACard pad={12}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--gray-2)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name="user" size={30} /></span>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, font: "var(--weight-bold) 19px var(--font-system)" }}>Maria Santos<VerifiedSeal size={16} /></div>
              <div style={{ ...A_META }}>maria@example.com</div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 5, background: "var(--blue-light)", color: "var(--info)", borderRadius: 999, padding: "4px 10px", font: "var(--weight-semibold) 12px var(--font-system)" }}>
                <Icon name={role === "shipper" ? "send" : "box"} size={12} />{role === "shipper" ? "Shipper" : "Carrier"}<Icon name="chevron-down" size={12} />
              </span>
            </div>
          </div>
        </ACard>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[["12", "Packages", null], ["4.8", "Rating", "star"], ["11", "Delivered", "circle-check-big"]].map(([v, l, ic]) => (
            <ACard key={l} pad={10} style={{ textAlign: "center" }}>
              {ic && <Icon name={ic} size={16} color={ic === "star" ? "var(--yellow)" : "var(--success)"} />}
              <div style={{ font: "var(--weight-bold) 18px var(--font-system)" }}>{v}</div>
              <div style={{ ...A_META, fontSize: 11.5 }}>{l}</div>
            </ACard>
          ))}
        </div>
        <div style={{ font: "var(--weight-bold) 19px var(--font-system)" }}>Verification Status</div>
        <div style={{ display: "flex", alignItems: "center", gap: 11, background: "var(--gray-6)", borderRadius: 14, padding: 12 }}>
          <span style={{ width: 38, height: 38, borderRadius: 12, background: "var(--blue-light)", color: "var(--info)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name="shield-check" size={20} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ font: "var(--weight-semibold) 15px var(--font-system)" }}>Phone Verified</div>
            <div style={{ ...A_META, fontSize: 12 }}>Your phone number is verified</div>
          </div>
          <Icon name="circle-check-big" size={19} color="var(--success)" />
        </div>
        <div style={{ background: "rgba(0,122,255,0.06)", borderRadius: 14, padding: 14 }}>
          <div style={{ display: "flex", gap: 11 }}>
            <span style={{ width: 34, height: 34, borderRadius: 11, background: "var(--blue-light)", color: "var(--info)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Icon name="shield" size={18} /></span>
            <div>
              <div style={{ font: "var(--weight-bold) 16px var(--font-system)" }}>Complete Your Verification</div>
              <div style={{ ...A_META, fontSize: 12 }}>Add government ID verification to build trust and get greater visibility.</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "10px 0" }}>
            {[["star", "var(--yellow)", "Gold star premium badge"], ["search", "var(--info)", "Priority in search results"], ["shield-check", "var(--success)", "Verified government ID on file"]].map(([ic, c, t]) => (
              <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 8, font: "var(--weight-regular) 13px var(--font-system)" }}><Icon name={ic} size={14} color={c} />{t}</span>
            ))}
          </div>
          <span style={{ display: "inline-flex", background: "var(--primary)", color: "#fff", borderRadius: 12, padding: "11px 16px", font: "var(--weight-semibold) 14px var(--font-system)" }}>Verify My Identity</span>
        </div>
        <div style={{ font: "var(--weight-bold) 19px var(--font-system)" }}>Account</div>
        <ACard pad={0}>
          {[["circle-user-round", "Personal Information", "Edit your profile and contact details"], ["badge-check", "Verification", "Manage your verification status"], ["navigation", "Shipping Addresses", "Manage pickup and delivery addresses"]].map(([ic, t, s], i) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderTop: i ? "1px solid var(--border)" : "none" }}>
              <Icon name={ic} size={19} color="var(--info)" />
              <div style={{ flex: 1 }}>
                <div style={{ font: "var(--weight-semibold) 14px var(--font-system)" }}>{t}</div>
                <div style={{ ...A_META, fontSize: 11.5 }}>{s}</div>
              </div>
              <Icon name="chevron-right" size={17} color="var(--gray-3)" />
            </div>
          ))}
        </ACard>
      </Body>
    </Fragment>
  );
}

