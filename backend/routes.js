/**
 * ROUTES.JS - Die "Wegweiser" 
 * - Definiert API-Endpunkte (GET, POST, PUT, DELETE)
 * - Verarbeitet eingehende Anfragen
 * - Sendet JSON-Antworten zurück
 * - Organisiert die Logik für verschiedene URLs
 */


// Importiert das Express-Framework
const express = require('express');
// Erstellt einen neuen Router
const router = express.Router();

// Definiert eine GET-Anfrage auf den Pfad '/'
// Die Funktion ist asynchron, falls später asynchrone Operationen nötig sind
router.get('/', async (req, res) => {
    // Sendet eine JSON-Antwort mit einer Nachricht zurück
    res.send({ message: "Hello FIW!" });
});

// Exportiert den Router, damit er in anderen Dateien verwendet werden kann
module.exports = router;