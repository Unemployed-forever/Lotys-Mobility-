# Lotys Mobility auf STRATO veröffentlichen

## Wichtig vorab

Diese Anwendung ist **keine statische HTML-Seite**. Sie benötigt einen dauerhaft laufenden Node.js-Prozess und PostgreSQL für Kontaktanfragen, Fuhrpark-Check, Teambereich und Kundenportal.

Ein klassisches STRATO-Webhosting-Paket ist dafür nicht geeignet. Verwende einen **STRATO VPS / V-Server mit Root-Zugang** (für einen kleinen Start in der Regel mindestens 2 GB RAM, für eine produktive Next.js-App besser 4 GB RAM) oder einen vergleichbaren Node.js-fähigen Server.

Die bestehende Domain und deine E-Mail-Postfächer können bei STRATO bleiben. Beim DNS-Wechsel **MX-Einträge für E-Mail nicht löschen oder ändern**.

---

## 1. Vor der Umstellung sichern

1. Im STRATO-Kundenbereich Screenshots oder Export der DNS-Einstellungen anlegen.
2. Die aktuelle Website lokal sichern.
3. Bestehende E-Mail-Postfächer und MX-Einträge dokumentieren.
4. Für den Server ein starkes SSH-Key-Paar statt Passwort-Login verwenden.
5. Entscheiden, wer Zugriff auf den Team-Login erhält.

---

## 2. STRATO VPS einrichten

1. Einen STRATO VPS mit Ubuntu LTS oder Debian auswählen.
2. Die öffentliche IPv4-Adresse notieren.
3. Per SSH verbinden:

```bash
ssh root@DEINE_SERVER_IP
```

4. System aktualisieren und einen eingeschränkten Benutzer anlegen:

```bash
apt update && apt upgrade -y
adduser lotys
usermod -aG sudo lotys
```

5. Firewall aktivieren; nur SSH, HTTP und HTTPS öffnen:

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

Danach als Benutzer `lotys` weiterarbeiten:

```bash
su - lotys
```

---

## 3. Node.js, Nginx und PostgreSQL installieren

Node.js in einer aktuellen LTS-Version installieren. Beispiel für Ubuntu über NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs nginx postgresql postgresql-contrib
node -v
npm -v
```

PM2 für den dauerhaften Betrieb installieren:

```bash
sudo npm install -g pm2
```

---

## 4. PostgreSQL lokal einrichten

Die Datenbank nicht öffentlich über Port 5432 freigeben.

```bash
sudo -u postgres createuser --pwprompt lotys_app
sudo -u postgres createdb -O lotys_app lotys_db
```

Danach lautet die Datenbank-URL in der App ungefähr:

```text
DATABASE_URL=postgresql://lotys_app:DEIN_STARKES_DB_PASSWORT@127.0.0.1:5432/lotys_db
```

Das Passwort nicht in Chatnachrichten, Git oder öffentliche Dateien schreiben.

---

## 5. Projekt auf den Server übertragen

Empfohlen: privates Git-Repository verwenden.

```bash
cd /var/www
sudo mkdir -p lotys-mobility
sudo chown lotys:lotys lotys-mobility
cd lotys-mobility
git clone DEIN_PRIVATES_REPOSITORY .
npm ci
```

Alternativ per SFTP hochladen. Nicht hochladen oder überschreiben:

- `.env`
- Datenbank-Backups
- private Schlüssel
- Team-Passwörter

---

## 6. Servervariablen einrichten

Datei `/var/www/lotys-mobility/.env` anlegen:

```bash
nano /var/www/lotys-mobility/.env
```

Mindestens erforderlich:

```env
DATABASE_URL=postgresql://lotys_app:DEIN_STARKES_DB_PASSWORT@127.0.0.1:5432/lotys_db
ADMIN_PASSWORD=EIN_LANGES_EINZIGARTIGES_ADMIN_PASSWORT
SESSION_SECRET=EIN_ZUFALLSWERT_MIT_MINDESTENS_32_ZEICHEN
SITE_URL=https://lotys-mobility.de
```

Sicheres `SESSION_SECRET` erzeugen:

```bash
openssl rand -hex 32
```

Optional:

```env
ADMIN_TOTP_SECRET=BASE32_SECRET_FUER_AUTHENTICATOR_APP
RESEND_API_KEY=re_...
RESEND_FROM=Lotys Mobility <noreply@lotys-mobility.de>
NOTIFICATION_EMAIL=info@lotys-mobility.de
CRM_WEBHOOK_URL=https://DEIN_CRM/webhook
CALENDAR_FEED_TOKEN=LANGER_GEHEIMER_KALENDER_TOKEN
```

---

## 7. Datenbank-Schema anwenden und App bauen

**Vor jedem Schema-Update ein Datenbank-Backup anlegen.**

```bash
cd /var/www/lotys-mobility
pg_dump "$DATABASE_URL" > ~/lotys-backup-$(date +%F-%H%M).sql
npx drizzle-kit push
npm run build
```

Hinweis: Die App wendet ihre Migrationen aus dem Ordner `drizzle/` zusätzlich automatisch beim Start an. `npx drizzle-kit push` ist daher optional, schadet aber nicht. Der Ordner `drizzle/` muss mit auf den Server.

Danach im privaten Teambereich `/admin/rechtliches` die echten Anbieterangaben eintragen und erst nach Prüfung freigeben. Ohne diese Freigabe bleiben öffentliche Formulare absichtlich gesperrt.

---

## 8. Anwendung mit PM2 starten

```bash
cd /var/www/lotys-mobility
pm2 start npm --name lotys-mobility -- start
pm2 save
pm2 startup
```

Den von PM2 ausgegebenen `sudo`-Befehl einmal ausführen, damit die Anwendung nach einem Serverneustart wieder startet.

Status und Logs:

```bash
pm2 status
pm2 logs lotys-mobility
```

---

## 9. Nginx als HTTPS-Reverse-Proxy einrichten

Datei anlegen:

```bash
sudo nano /etc/nginx/sites-available/lotys-mobility
```

Beispielkonfiguration:

```nginx
server {
    listen 80;
    server_name lotys-mobility.de www.lotys-mobility.de;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktivieren:

```bash
sudo ln -s /etc/nginx/sites-available/lotys-mobility /etc/nginx/sites-enabled/lotys-mobility
sudo nginx -t
sudo systemctl reload nginx
```

---

## 10. Domain im STRATO-Kundenbereich verbinden

Wenn Domain und Server bei STRATO liegen:

1. STRATO Kunden-Login öffnen.
2. Domainverwaltung → gewünschte Domain → DNS-Einstellungen.
3. A-Record für `@` auf die IPv4 des VPS setzen.
4. A-Record für `www` ebenfalls auf die IPv4 setzen oder `www` als CNAME auf die Hauptdomain setzen.
5. **MX-Einträge unverändert lassen**, falls E-Mails weiter über STRATO laufen.
6. DNS-Änderung abwarten; das kann von Minuten bis mehrere Stunden dauern.

---

## 11. HTTPS aktivieren

Erst wenn die Domain auf den Server zeigt:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d lotys-mobility.de -d www.lotys-mobility.de
```

Danach testen:

```bash
curl https://lotys-mobility.de/api/health
```

Erwartet wird:

```json
{"ok":true}
```

---

## 12. Nach dem Livegang prüfen

- `https://lotys-mobility.de` zeigt die öffentliche Kundenseite.
- `/kundenlogin` ist sichtbar und funktioniert erst nach interner Freigabe.
- `/admin`, `/operations` und interne APIs sind ohne Team-Session nicht sichtbar.
- `/admin/rechtliches` enthält echte, geprüfte Impressums-/Datenschutzdaten (optional zusätzlich Terminbuchungs-Link für Dankeseite und Kontaktseite).
- `/impressum` und `/datenschutz` sind vollständig.
- Kontakt- und Fuhrpark-Check-Formulare funktionieren erst nach Rechtsfreigabe.
- `pm2 status` zeigt `online`.
- Backups von PostgreSQL werden regelmäßig erstellt und Wiederherstellung wird getestet.

## Aktualisierung später

```bash
cd /var/www/lotys-mobility
git pull
npm ci
npx drizzle-kit push
npm run build
pm2 restart lotys-mobility
```

Vor `drizzle-kit push` immer zuerst ein PostgreSQL-Backup erstellen.
