/**
 * SERVER.JS - Der "Hauptschalter"
 * - Startet den Express-Server auf Port 3000
 * - Konfiguriert Middleware (JSON-Parsing)
 * - Verbindet alle Routen aus routes.js
 * - Hört auf eingehende HTTP-Anfragen
 */

//ERST IMPORTIEREN
const express = require('express'); // Express-Framework importieren
const cors = require('cors');           // CORS-Middleware importieren
// 2. dotenv FRÜH laden (damit andere Module .env nutzen können)
require('dotenv').config();             // Umgebungsvariablen aus .env laden
const routes = require('./routes'); // Routen importieren
const initdb = require('./initdb'); // NEU: Datenbank-Initialisierung importieren (für /init Route)

// Wir erstellen eine neue Express-Anwendung, mit der wir einen Webserver bauen können.
const app = express(); 
// Wir legen fest, auf welchem Port der Server laufen soll.
// Entweder nehmen wir den Port aus den Umgebungsvariablen (z.B. wenn der Server online läuft),
// oder wir nehmen Port 3000 als Standard, falls nichts anderes angegeben ist.
const PORT = process.env.PORT || 3000; 


//DANN BENUTZEN / AKTIVIEREN
app.use(express.json()); // Middleware für JSON-Parsing aktivieren
app.use(cors()); // CORS aktivieren
app.use('/', routes); // Routen unter dem Wurzelpfad verwenden (/, /users, etc.)
app.use('/init', initdb); // NEU: Datenbank-Initialisierung unter /init verfügbar machen

// Server starten und auf Fehler prüfen
app.listen(PORT, (error) => {
    if (error) {
        console.log(error); // Fehler ausgeben, falls einer auftritt
    } else {
        console.log(`Server started and listening on port ${PORT} ... `); // Erfolgreiche Serverstart-Meldung
    }
});