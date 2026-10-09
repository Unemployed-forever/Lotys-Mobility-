# Lotys Mobility

Next.js App Router + PostgreSQL/Drizzle. Die öffentliche Website zeigt Leistungen, Ablauf, FAQ, Fuhrpark-Check, Kontakt, Impressum und Datenschutzhinweise. Preise, Roadmap, Backoffice und Kundenzugangsverwaltung liegen nur hinter dem nicht öffentlich verlinkten Team-Login `/login`.

## Zugang für Kunden

- Öffentlicher Einstieg: `/kundenlogin` (keine Selbstregistrierung).
- Nach Fuhrpark-Check und persönlichem Gespräch einen Betrieb unter `/admin` anlegen.
- Unter `/admin/kunden` E-Mail, Namen und ein individuelles Startpasswort (mindestens 12 Zeichen) einem Betrieb zuordnen und freigeben. Zugangsdaten über einen sicheren Kanal übergeben; derzeit gibt es **keinen automatisierten sicheren Einladungs-/Passwort-Reset-Prozess**.
- Nach Anmeldung sieht der Kunde unter `/kundenportal` nur Fahrzeuge und Vorgänge seines Betriebs. Die Serviceanfrage ist auf `/kundenportal/service`, nicht im Dashboard.
- Bei Sperrung des Kontos ist die Session sofort ungültig. Teamkonten und Kundensessions verwenden verschiedene Cookies.
- Interne Tarife: `/admin/preise`. Keine Tarifdaten im öffentlichen Seitenbundle.

## Sicherheit (Stand)

- Security-Header via `next.config.ts`: CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy.
- Zentrale Same-Origin-Prüfung für API-Schreibzugriffe in `src/middleware.ts` (CSRF-Tiefe).
- Rate-Limits und Honeypot-Felder auf allen öffentlichen Formularen; Eingabevalidierung client- und serverseitig.
- `npm audit --omit=dev`: 0 Schwachstellen in Produktions-Abhängigkeiten (Next 16.4.0).
- Kein Tracking; optionales Plausible nur bei gesetzter `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`.

## Datenbank-Migrationen

Beim Serverstart führt die App die SQL-Migrationen aus `drizzle/` automatisch aus (`src/instrumentation.ts`). Die Erstmigration ist idempotent (`IF NOT EXISTS`) und damit auch auf Datenbanken sicher, die früher per `drizzle-kit push` angelegt wurden. Bei Schemaänderungen: `npx drizzle-kit generate` ausführen, die neue SQL-Datei prüfen und mitdeployen. Vor jedem Update ein Datenbank-Backup erstellen.

## Servervariablen

Fehlt `SESSION_SECRET`, wird der Signierschlüssel für Team- und Kundensessions per scrypt aus `ADMIN_PASSWORD` abgeleitet, damit Logins nach Neustarts funktionieren. Eine Passwortänderung meldet dann alle Sitzungen ab. Für den Produktivbetrieb trotzdem ein eigenes, zufälliges `SESSION_SECRET` setzen.


Erforderlich: `DATABASE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET` (mindestens 32 zufällige Zeichen). Empfehlenswert: `SITE_URL` für Sitemap. Optional: `ADMIN_TOTP_SECRET`, `RESEND_API_KEY`, `RESEND_FROM`, `NOTIFICATION_EMAIL`, `CRM_WEBHOOK_URL`, `CALENDAR_FEED_TOKEN`. Schlüssel niemals an `NEXT_PUBLIC_` weitergeben.

## Pflicht vor echtem Livegang

1. Unter `/admin/rechtliches` echte Angaben zu Name/Firma, **tatsächlicher** Rechtsform, ladungsfähiger Anschrift, E-Mail, Hostinganbieter und Datenschutzkontakt eintragen. USt-ID und Registerdaten nur angeben, wenn sie tatsächlich vorhanden sind. Rechtlich prüfen und freigeben.
2. Bis zur Freigabe nehmen die öffentlichen Formulare bewusst keine personenbezogenen Daten an (HTTP 503), statt ein fiktives Impressum vorzutäuschen.
3. AV-Verträge, tatsächliche Logfristen und Löschkonzept mit dem Hostinganbieter prüfen. Automatische Löschung ist noch nicht implementiert.
4. Keine Analyse-/Marketing-Cookies im aktuellen Stand. Essenzielle Session-Cookies für Logins und lokal gespeicherte Designpräferenz benötigen keinen pauschalen Marketing-Cookie-Banner. Falls später Tracking/Einbettungen mit nicht notwendigen Cookies hinzukommen, vorher echtes Consent-Management implementieren. Der Pexels-Markenfilm liegt lokal unter `public/media`.
5. Für die öffentliche Anmeldung von Firmenkunden sind individuelle Kundenkonten eingerichtet. Vor einem produktiven Mehrpersonen-Rollout sollten Passwort-Reset, MFA für Kunden und feingranulare Mitarbeiterrollen ergänzt werden.

## Hosting / STRATO

Eine Sandbox-Vorschau ist nicht automatisch mit deiner STRATO-Domain verbunden. Klassische STRATO-Shared-Webhosting-Pakete unterstützen nicht den dauerhaften Betrieb dieses Next.js-Node-Servers. Verwende einen Node-fähigen STRATO-VPS/Server mit PostgreSQL oder einen entsprechenden Managed-Host. Server und Datenbank sichern, Schemaänderungen nach Backup mit `npx drizzle-kit push` anwenden, `npm run build` ausführen, HTTPS und Reverse Proxy einrichten. Offizielle Referenz: https://www.strato.de/server/node-js-hosting/
