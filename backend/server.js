/**
 * SERVER.JS - Der "Hauptschalter"
 * - Startet den Express-Server auf Port 3000
 * - Konfiguriert Middleware (JSON-Parsing)
 * - Verbindet alle Routen aus routes.js
 * - Hört auf eingehende HTTP-Anfragen
 */

const express = require('express'); // Express-Framework importieren
const routes = require('./routes'); // Routen importieren

const app = express(); // Express-App erstellen
const PORT = 3000; // Port festlegen

app.use(express.json()); // Middleware für JSON-Parsing aktivieren
app.use('/', routes); // Routen unter dem Wurzelpfad verwenden

// Server starten und auf Fehler prüfen
app.listen(PORT, (error) => {
    if (error) {
        console.log(error); // Fehler ausgeben, falls einer auftritt
    } else {
        console.log(`Server started and listening on port ${PORT} ... `); // Erfolgreiche Serverstart-Meldung
    }
});