/**
 * DB.JS - Datenbank-Verbindung zu PostgreSQL
 * Diese Datei stellt die Verbindung zur PostgreSQL-Datenbank her
 * und exportiert den Client für andere Module
 */

// Lädt Umgebungsvariablen aus der .env-Datei
// Muss ZUERST stehen, damit process.env.PGUSER etc. verfügbar sind
require('dotenv').config();

// Importiert den PostgreSQL-Client aus dem 'pg' Paket
// pg = PostgreSQL-Bibliothek für Node.js
const pg = require('pg');

// Erstellt einen neuen PostgreSQL-Client mit Verbindungsdaten aus .env
// Alle Werte kommen aus der .env-Datei (PGUSER, PGHOST, etc.)
const client = new pg.Client({
    user: process.env.PGUSER,         // Benutzername
    host: process.env.PGHOST,         // Server-Adresse 
    database: process.env.PGDATABASE, // Datenbankname 
    password: process.env.PGPASSWORD, // Passwort aus .env
    port: process.env.PGPORT,         // Port (meist 5432 für PostgreSQL)
});

// Stellt die Verbindung zur Datenbank her
// Mit Fehlerbehandlung: zeigt Erfolg oder Fehler an
client.connect(err => {
    if (err) {
        // Falls Verbindung fehlschlägt: Fehler in Konsole ausgeben
        console.error('❌ Datenbank-Verbindung fehlgeschlagen:', err);
    } else {
        // Falls Verbindung erfolgreich: Bestätigung ausgeben
        console.log('✅ Erfolgreich mit PostgreSQL-Datenbank verbunden');
    }
});

// Exportiert den client, damit andere Dateien (wie routes.js, initdb.js) 
// ihn verwenden können für SQL-Queries
module.exports = client;