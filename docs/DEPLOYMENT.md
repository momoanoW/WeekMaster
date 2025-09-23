# WeekMaster Backend - Vercel Deployment

## Environment Variables für Vercel

Für das Deployment müssen diese Umgebungsvariablen in Vercel gesetzt werden:

### Lokale HTW-Datenbank (aktuell):
```
PGHOST=psql.f4.htw-berlin.de
PGPORT=5432
PGDATABASE=taskmanager_ms25
PGUSER=s0591300
PGPASSWORD=Qy7XSrvTw#o7Qy
PORT=3000
```

### Für Production (später mit Supabase):
```
PGHOST=db.supabase.co
PGPORT=5432
PGDATABASE=postgres
PGUSER=postgres
PGPASSWORD=[SUPABASE_PASSWORD]
PORT=3000
```

## Datenbank Initialisierung

### Lokal (Development):
```bash
# Option 1: HTTP-Route (Backend muss laufen)
curl http://localhost:3000/initdb
# oder im Browser: http://localhost:3000/initdb

# Option 2: Direktes Script
cd backend
node initdb.js
```

### Vercel (Production):
```bash
# Nach dem Deployment:
curl https://dein-backend.vercel.app/initdb
# oder im Browser: https://dein-backend.vercel.app/initdb
```

## Deployment Commands

1. Backend deployen:
```bash
cd backend
npm install -g vercel
vercel login
vercel --prod
```

2. Environment Variables in Vercel Dashboard setzen
3. Datenbank initialisieren: `https://dein-backend.vercel.app/initdb`
4. URL notieren für Frontend-Konfiguration

## Notizen

- HTW-Datenbank funktioniert nur mit VPN
- Für Production: Supabase oder Vercel Postgres verwenden
- Frontend muss API-URL von localhost auf Vercel-URL ändern
- Nach jedem Deployment: Datenbank über `/initdb` Route neu initialisieren
