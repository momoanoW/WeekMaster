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
// Importiert den Datenbank-Client (für SQL-Abfragen)
const client = require('./db');


// Route für GET-Anfrage auf '/' (z.B. http://localhost:3000/)
// req = was der Browser schickt (Anfrage), res = was wir zurückschicken (Antwort)
// async = falls wir später auf Datenbank warten müssen, blockiert der Server nicht
router.get('/', async (req, res) => {
    // Sendet JSON-Daten als Antwort an den Browser: {"message": "Hello FIW!"}
    res.send({ message: "Hello FIW!" });
});

// NEU: Route um alle users aus der DB zu holen
router.get('/users', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Exportiert den Router, damit er in anderen Dateien verwendet werden kann
module.exports = router;