import { useState, useEffect, useMemo, useCallback } from "react";

/*
 * ============================================================
 *  CONFIG — Edit this section to customize for any mosque
 * ============================================================
 */
const CONFIG = {
  mosque: {
    line1: "ISLAMSKA ZAJEDNICA BOŠNJAKA U NJEMAČKOJ",
    line2: "MEDŽLIS ISLAMSKE ZAJEDNICE BAYERN",
    line3: "Džemat Tevhid",
    welcome1: "Islamska zajednica Bošnjaka u Njemačkoj",
    welcome2: "Dobrodošli u džemat Tevhid",
  },
  location: { lat: 48.1351, lng: 11.5650 },
  api: { method: 99, methodSettings: "18,null,17", school: 0 },
  colors: {
    primary: "#1f7a5c",
    primaryDark: "#16614a",
    primaryLight: "#28956e",
    text: "#1a1a1a",
    textMuted: "#6b7280",
    textLight: "#9ca3af",
    card: "#ffffff",
    accent: "#f0fdf4",
  },
};

/*
 * ============================================================
 *  HIJRI CALENDAR
 * ============================================================
 */
function toHijri(d) {
  const gd = d.getDate(), gm = d.getMonth() + 1, gy = d.getFullYear();
  let jd = Math.floor((1461 * (gy + 4800 + Math.floor((gm - 14) / 12))) / 4) +
    Math.floor((367 * (gm - 2 - 12 * Math.floor((gm - 14) / 12))) / 12) -
    Math.floor((3 * Math.floor((gy + 4900 + Math.floor((gm - 14) / 12)) / 100)) / 4) + gd - 32075;
  const l = jd - 1948440 + 10632, n = Math.floor((l - 1) / 10631), lp = l - 10631 * n + 354;
  const j = Math.floor((10985 - lp) / 5316) * Math.floor((50 * lp) / 17719) +
    Math.floor(lp / 5670) * Math.floor((43 * lp) / 15238);
  const lpp = lp - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const hm = Math.floor((24 * lpp) / 709), hd = lpp - Math.floor((709 * hm) / 24), hy = 30 * n + j - 30;
  const names = ["Muharrem", "Safer", "Rebi'u-l-evvel", "Rebi'u-l-ahir",
    "Džumade-l-ula", "Džumade-l-ahira", "Redžeb", "Ša'ban",
    "Ramazan", "Ševval", "Zu-l-ka'de", "Zu-l-hidždže"];
  return { day: hd, month: hm, monthName: names[hm - 1] || "", year: hy };
}

/*
 * ============================================================
 *  LOCAL PRAYER CALCULATION (fallback)
 * ============================================================
 */
function localCalc(date, lat, lng) {
  const D = Math.PI / 180, R = 180 / Math.PI;
  const s = d => Math.sin(d * D), c = d => Math.cos(d * D), t = d => Math.tan(d * D);
  const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
  const ay = m <= 2 ? y - 1 : y, am = m <= 2 ? m + 12 : m;
  const A = Math.floor(ay / 100), B = 2 - A + Math.floor(A / 4);
  const jd = Math.floor(365.25 * (ay + 4716)) + Math.floor(30.6001 * (am + 1)) + d + B - 1524.5;
  const DD = jd - 2451545, g = (357.529 + .98560028 * DD) % 360, q = (280.459 + .98564736 * DD) % 360;
  const L = (q + 1.915 * s(g) + .02 * s(2 * g)) % 360, e = 23.439 - .00000036 * DD;
  const RA = Math.atan2(c(e) * s(L), c(L)) * R / 15, decl = Math.asin(s(e) * s(L)) * R;
  let EqT = q / 15 - ((RA + 360) % 24); if (EqT > 12) EqT -= 24;
  const tz = new Date().getTimezoneOffset() / -60, dh = 12 + tz - lng / 15 - EqT;
  const ha = a => { const v = (s(a) - s(lat) * s(decl)) / (c(lat) * c(decl)); return v > 1 || v < -1 ? NaN : Math.acos(v) * R / 15; };
  const f = h => { if (isNaN(h)) return "--:--"; let hr = Math.floor(h), mn = Math.round((h - hr) * 60); if (mn >= 60) { hr++; mn = 0; } if (hr >= 24) hr -= 24; return `${String(hr).padStart(2, "0")}:${String(mn).padStart(2, "0")}`; };
  return { Fajr: f(dh - ha(-18)), Sunrise: f(dh - ha(-.833)), Dhuhr: f(dh), Asr: f(dh + ha(R * Math.atan(1 / (1 + t(Math.abs(lat - decl)))))), Maghrib: f(dh + ha(-.833)), Isha: f(dh + ha(-17)) };
}

/*
 * ============================================================
 *  UTILITIES
 * ============================================================
 */
const clean = t => t ? t.replace(/\s*\(.*\)/, "") : "--:--";
const toMin = t => { if (!t || t === "--:--") return 0; const [h, m] = clean(t).split(":").map(Number); return h * 60 + m; };

const MONTHS_DE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const DAYS = ["N", "P", "U", "S", "Č", "P", "S"];

const { primary, primaryDark, primaryLight, text, textMuted, textLight, card, accent } = CONFIG.colors;

/*
 * ============================================================
 *  COMPONENTS
 * ============================================================
 */

/* --- Crescent + Star --- */
function CrescentStar({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" style={{ flexShrink: 0 }}>
      <circle cx="20" cy="25" r="14.5" fill="none" stroke={primaryDark} strokeWidth="2" />
      <circle cx="27" cy="25" r="13" fill="#ddd8c8" />
      <polygon points="40,11 41.6,15.2 46,15.2 42.5,18 43.8,22.5 40,19.8 36.2,22.5 37.5,18 34,15.2 38.4,15.2" fill={primaryDark} />
    </svg>
  );
}

/* --- Header --- */
function Header() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
      <CrescentStar />
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: primaryDark, letterSpacing: ".04em", lineHeight: 1.4 }}>
          {CONFIG.mosque.line1}
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: textMuted, letterSpacing: ".02em", lineHeight: 1.4 }}>
          {CONFIG.mosque.line2}
        </div>
        <div style={{ fontSize: 15, fontWeight: 500, color: primary, fontStyle: "italic", marginTop: 3 }}>
          {CONFIG.mosque.line3}
        </div>
      </div>
    </div>
  );
}

/* --- Clock --- */
function Clock({ hours, minutes, seconds }) {
  return (
    <div style={{
      background: card, borderRadius: 16, padding: "28px 0", textAlign: "center",
      boxShadow: "0 2px 16px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)",
      border: "1px solid rgba(0,0,0,0.04)",
    }}>
      <span style={{
        fontSize: 82, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
        color: text, letterSpacing: "-0.04em", lineHeight: 1,
      }}>
        {hours}:{minutes}
      </span>
      <span style={{
        fontSize: 48, fontWeight: 400, fontFamily: "'JetBrains Mono', monospace",
        color: textMuted, letterSpacing: "-0.02em",
      }}>
        {seconds}
      </span>
    </div>
  );
}

/* --- Weekday Selector --- */
function WeekdaySelector({ todayIndex }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
      {DAYS.map((d, i) => {
        const isToday = i === todayIndex;
        return (
          <div key={i} style={{
            width: 40, height: 40, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: isToday ? 800 : 500,
            fontFamily: "'Outfit', sans-serif",
            background: isToday ? primary : "transparent",
            color: isToday ? "#fff" : textLight,
            border: isToday ? "none" : "1.5px solid rgba(0,0,0,0.07)",
            boxShadow: isToday ? `0 3px 10px rgba(31,122,92,0.35)` : "none",
            transition: "all 0.3s ease",
          }}>{d}</div>
        );
      })}
    </div>
  );
}

/* --- Date Display --- */
function DateDisplay({ gregorian, hijriDay, hijriMonth, hijriYear }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
      <div style={{
        background: primary, color: "#fff", borderRadius: 12,
        padding: "11px 26px", fontSize: 15, fontWeight: 700,
        boxShadow: `0 3px 10px rgba(31,122,92,0.3)`,
        letterSpacing: ".01em",
      }}>{gregorian}</div>
      <div style={{
        background: card, borderRadius: 12,
        padding: "11px 26px", fontSize: 15, fontWeight: 700, color: text,
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.05)",
        textAlign: "center", lineHeight: 1.3,
      }}>{hijriDay}. {hijriMonth}<br />{hijriYear}.</div>
    </div>
  );
}

/* --- Countdown --- */
function Countdown({ label, time }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 15, fontWeight: 500, color: textMuted, marginBottom: 6 }}>{label}</div>
      <div style={{
        fontSize: 58, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
        color: primary, letterSpacing: "-0.03em", lineHeight: 1,
        animation: "countPulse 2s ease-in-out infinite",
      }}>{time}</div>
    </div>
  );
}

/* --- Prayer Card --- */
function PrayerCard({ name, time, arabic, isActive, isLast }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", padding: "0 32px",
      flex: 1, minHeight: 0,
      borderBottom: isLast ? "none" : "1px solid rgba(0,0,0,0.05)",
      background: isActive ? accent : "transparent",
      transition: "background 0.4s ease",
    }}>
      <div style={{
        width: 100, fontSize: 17, fontWeight: isActive ? 700 : 500,
        color: isActive ? primary : "#444",
      }}>{name}</div>
      <div style={{ flex: 1, textAlign: "center" }}>
        <span style={{
          fontSize: 44, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
          color: isActive ? primaryDark : text, letterSpacing: "-0.02em",
        }}>{time}</span>
      </div>
      <div style={{
        width: 75, textAlign: "right", fontSize: 22,
        fontFamily: "'Amiri', serif", color: isActive ? textMuted : textLight,
        direction: "rtl",
      }}>{arabic}</div>
    </div>
  );
}

/* --- Prayer List --- */
function PrayerList({ prayers, activePrayer }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${primaryDark}, ${primaryLight})`,
        borderRadius: "16px 16px 0 0", padding: "16px 32px", textAlign: "center",
        boxShadow: `0 4px 12px rgba(31,122,92,0.25)`,
      }}>
        <div style={{ fontSize: 21, fontWeight: 800, color: "#fff", letterSpacing: ".12em" }}>
          VRIJEME NAMAZA
        </div>
      </div>
      {/* Cards */}
      <div style={{
        background: card, borderRadius: "0 0 16px 16px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)",
        border: "1px solid rgba(0,0,0,0.04)", borderTop: "none",
        flex: 1, display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {prayers.map((p, i) => (
          <PrayerCard
            key={p.key}
            name={p.bs}
            time={p.time}
            arabic={p.ar}
            isActive={activePrayer === p.key}
            isLast={i === prayers.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

/* --- Footer Banner --- */
function FooterBanner() {
  return (
    <div style={{
      background: primary, borderRadius: 14, padding: "14px 32px",
      textAlign: "center", boxShadow: `0 3px 12px rgba(31,122,92,0.3)`,
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", lineHeight: 1.6 }}>
        {CONFIG.mosque.welcome1}
        <br />
        {CONFIG.mosque.welcome2}
      </div>
    </div>
  );
}

/*
 * ============================================================
 *  MAIN APP
 * ============================================================
 */
export default function App() {
  const [now, setNow] = useState(new Date());
  const [times, setTimes] = useState(null);
  const lastFetch = useCallback(() => { }, []);

  // Tick every second
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch prayer times once per day
  useEffect(() => {
    const key = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    if (lastFetch.current === key && times) return;
    const { lat, lng } = CONFIG.location;
    const { method, methodSettings, school } = CONFIG.api;
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    (async () => {
      try {
        const r = await fetch(`https://api.aladhan.com/v1/timings/${dd}-${mm}-${now.getFullYear()}?latitude=${lat}&longitude=${lng}&method=${method}&methodSettings=${methodSettings}&school=${school}`);
        const d = await r.json();
        if (d.code === 200) {
          const t = d.data.timings;
          setTimes({ Fajr: t.Fajr, Sunrise: t.Sunrise, Dhuhr: t.Dhuhr, Asr: t.Asr, Maghrib: t.Maghrib, Isha: t.Isha });
          lastFetch.current = key;
        } else throw new Error();
      } catch {
        setTimes(localCalc(now, lat, lng));
        lastFetch.current = key;
      }
    })();
  }, [now.getDate()]);

  // Computed
  const hijri = useMemo(() => toHijri(now), [now.getDate()]);
  const nowM = now.getHours() * 60 + now.getMinutes();

  const nextPrayer = useMemo(() => {
    if (!times) return { name: "...", cd: "--:--:--" };
    const seq = [
      { k: "Fajr", n: "Sabah-namaz" }, { k: "Sunrise", n: "Izlazak sunca" },
      { k: "Dhuhr", n: "Podne-namaz" }, { k: "Asr", n: "Ikindija-namaz" },
      { k: "Maghrib", n: "Akšam-namaz" }, { k: "Isha", n: "Jacija-namaz" },
    ];
    for (const p of seq) {
      const m = toMin(times[p.k]);
      if (m > nowM) {
        const diff = m - nowM;
        const totalSec = diff * 60 - now.getSeconds();
        const h = Math.floor(totalSec / 3600);
        const min = Math.floor((totalSec % 3600) / 60);
        const sec = totalSec % 60;
        return {
          name: p.n,
          cd: `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(Math.max(0, sec)).padStart(2, "0")}`,
        };
      }
    }
    return { name: "Sabah-namaz", cd: "--:--:--" };
  }, [now, times]);

  const activePrayer = useMemo(() => {
    if (!times) return "Isha";
    let a = "Isha";
    for (const k of ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]) {
      if (nowM < toMin(times[k])) break;
      a = k;
    }
    return a;
  }, [now, times]);

  const prayers = times ? [
    { key: "Fajr", bs: "Zora", ar: "إمساك", time: clean(times.Fajr) },
    { key: "Sunrise", bs: "Iz. sunca", ar: "الشروق", time: clean(times.Sunrise) },
    { key: "Dhuhr", bs: "Podne", ar: "الظهر", time: clean(times.Dhuhr) },
    { key: "Asr", bs: "Ikindija", ar: "العصر", time: clean(times.Asr) },
    { key: "Maghrib", bs: "Akšam", ar: "المغرب", time: clean(times.Maghrib) },
    { key: "Isha", bs: "Jacija", ar: "العشاء", time: clean(times.Isha) },
  ] : [];

  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const sec = String(now.getSeconds()).padStart(2, "0");
  const gregorian = `${String(now.getDate()).padStart(2, "0")}. ${MONTHS_DE[now.getMonth()]} ${now.getFullYear()}.`;

  return (
    <div style={{
      position: "relative", width: "100%", height: "100vh", overflow: "hidden",
      fontFamily: "'Outfit', sans-serif", color: text,
      display: "flex", flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700;800&family=Amiri:wght@400;700&display=swap');
        @keyframes countPulse{0%,100%{opacity:1}50%{opacity:.4}}
        *{margin:0;padding:0;box-sizing:border-box}
      `}</style>

      {/* Background */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/pattern-bg.jpg)", backgroundSize: "cover", backgroundPosition: "center" }} />

      {/* Layout */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", padding: "32px 36px 0", gap: 32 }}>

        {/* LEFT — 40% */}
        <div style={{ flex: "0 0 42%", display: "flex", flexDirection: "column", gap: 24 }}>
          <Header />
          <Clock hours={hh} minutes={min} seconds={sec} />
          <WeekdaySelector todayIndex={now.getDay()} />
          <DateDisplay
            gregorian={gregorian}
            hijriDay={hijri.day}
            hijriMonth={hijri.monthName}
            hijriYear={hijri.year}
          />
          <Countdown label={nextPrayer.name} time={nextPrayer.cd} />
          <div style={{ marginTop: "auto" }}>
            <FooterBanner />
          </div>
        </div>

        {/* RIGHT — 60% */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingBottom: 32 }}>
          <PrayerList prayers={prayers} activePrayer={activePrayer} />
        </div>
      </div>

      {/* Powered by */}
      <div style={{
        position: "relative", zIndex: 1, textAlign: "center",
        padding: "8px 0 14px", fontSize: 11, fontWeight: 400, color: "#b0a898",
      }}>
        Powered by Samil Fazlic
      </div>
    </div>
  );
}
