# 🕌 Islamische Gemeinschaft Tevhid e.V. — Gebetszeiten Display

Zweisprachiges (Deutsch/Bosnisch) Gebetszeiten-Display für den TV in der Moschee.

## Features
- Live-Gebetszeiten von AlAdhan API (Fajr 18° / Isha 17° — wie salatul.com)
- Analoge Uhr + Digitale Uhr + Countdown
- Zweisprachig: Bosnisch / Deutsch
- Iqama-Zeiten (einstellbar)
- Hijri-Datum (bosnische Monatsnamen)
- Facebook-Integration
- Flash-Info-Ticker
- Automatischer Offline-Fallback

## Quick Start
```bash
npm install
npm run dev
```

## Deployment
1. Push zu GitHub
2. Vercel importiert automatisch
3. Fire TV Stick → Silk Browser → URL öffnen → Vollbild

## Anpassungen
Alles in `src/App.jsx` im `MOSQUE`-Objekt:
- `iqamaOffsets` — Iqama-Zeiten ändern
- `flashMessages` — Lauftext-Nachrichten
- `jumuah` / `khutba` — Freitagszeiten
