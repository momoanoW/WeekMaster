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

// Erstellt einen neuen PostgreSQL-Pool mit Verbindungsdaten aus .env
// Pool managed automatisch mehrere Verbindungen (Standard: 10-20 gleichzeitig)
const pool = new Pool({
    user: process.env.PGUSER,         // Benutzername
    host: process.env.PGHOST,         // Server-Adresse 
    database: process.env.PGDATABASE, // Datenbankname 
    password: process.env.PGPASSWORD, // Passwort aus .env
    port: process.env.PGPORT,         // Port (meist 5432 für PostgreSQL)
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