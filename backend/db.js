/**
 * DB.JS - Datenbank-Verbindung zu PostgreSQL
 * Diese Datei stellt die Verbindung zur PostgreSQL-Datenbank her
 * und exportiert den Client für andere Module
 */

// Lädt Umgebungsvariablen aus der .env-Datei
// Muss ZUERST stehen, damit process.env.PGUSER etc. verfügbar sind
require('dotenv').config();

// Importiert den PostgreSQL-Pool aus dem 'pg' Paket
// Pool = Mehrere Verbindungen für parallele Requests (statt Single Client)
const { Pool } = require('pg');

// PostgreSQL-Pool mit Verbindungsdaten
const pool = new Pool({
    // Vercel/Cloud: Verwende DATABASE_URL (Connection String)
    // Lokal: Verwende einzelne Umgebungsvariablen
    connectionString: process.env.DATABASE_URL || undefined, //undefined ist ein Ausschalter
    user: process.env.DATABASE_URL ? undefined : process.env.PGUSER,
    host: process.env.DATABASE_URL ? undefined : process.env.PGHOST,
    database: process.env.DATABASE_URL ? undefined : process.env.PGDATABASE,
    password: process.env.DATABASE_URL ? undefined : process.env.PGPASSWORD,
    port: process.env.DATABASE_URL ? undefined : process.env.PGPORT,
    max: 20,                          // Maximal 20 parallele Verbindungen
    idleTimeoutMillis: 30000,         // Verbindung nach 30s Inaktivität schließen
    connectionTimeoutMillis: 2000,    // 2s Timeout für neue Verbindung
});

// Pool-Events für besseres Debugging und Monitoring
pool.on('connect', () => {
    console.log('✅ Neue Datenbankverbindung im Pool erstellt');
});

pool.on('error', (err) => {
    console.error('❌ Unerwarteter Fehler im Datenbankpool:', err);
    process.exit(-1);  // Server beenden bei schwerwiegenden Pool-Fehlern
});

// Test-Verbindung beim Start (um Pool-Konfiguration zu validieren)
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Pool-Verbindung fehlgeschlagen:', err);
        return;
    }
    console.log('✅ Pool erfolgreich mit PostgreSQL-Datenbank verbunden');
    release(); // Verbindung zurück in den Pool
});

// Exportiert den pool, damit andere Dateien (wie routes.js, initdb.js) 
// ihn verwenden können für SQL-Queries
// VORTEIL: Automatisches Connection Management, keine Race Conditions
module.exports = pool;