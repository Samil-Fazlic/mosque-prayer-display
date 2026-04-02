# Update-Anleitung: Neues Tevhid-Design live stellen

Du hast bereits GitHub + Vercel eingerichtet. So stellst du das neue Design live.

## Schritt 1: Dateien ersetzen

Im Projektordner auf deinem PC:
1. Ersetze src/App.jsx mit der neuen Version
2. Ersetze index.html mit der neuen Version

## Schritt 2: Lokal testen

npm run dev
Oeffne http://localhost:5173

Pruefe:
- Gebetszeiten werden geladen (API-Status: online)
- Uhr laeuft (analog + digital)
- Countdown zaehlt runter
- Flash-Ticker wechselt alle 7 Sekunden
- Facebook-Links funktionieren

## Schritt 3: Auf GitHub pushen

git add .
git commit -m "Neues Tevhid-Design mit Bosnisch/Deutsch"
git push

## Schritt 4: Vercel deployed automatisch

Nach 1-2 Minuten ist die neue Version live.

## Schritt 5: Fire TV Stick

Seite neu laden im Silk Browser - fertig!

## Anpassungen im Code (src/App.jsx)

Iqama-Zeiten:
iqamaOffsets: { Fajr: 30, Dhuhr: 15, Asr: 15, Maghrib: 7, Isha: 15 }

Dzuma-Zeiten:
jumuah: "13:30"
khutba: "13:00"

Flash-Nachrichten:
flashMessages: ["Nachricht 1", "Nachricht 2"]

Berechnungsmethode:
methodSettings: "18,null,17"  (Fajr 18 Grad, Isha 17 Grad)

Hanafi statt Shafi fuer Asr:
school: 1  (0=Shafi, 1=Hanafi)

Nach jeder Aenderung: git add . && git commit -m "Update" && git push
