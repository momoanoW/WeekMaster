/**
 * PRIORITAETEN.JS - Router für Prioritäten-Verwaltung
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /prioritaet - Alle Prioritäten für Dropdown-Menüs abrufen
// Gibt eine Liste aller Prioritäten zurück, sortiert nach Wichtigkeit

router.get('/', async (req, res) => {
    try {
        // SQL-Abfrage: Alle Prioritäten mit ID und Name abrufen
        // ORDER BY prio_id sorgt für konsistente Reihenfolge (Niedrig → Hoch)
        const query = `
            SELECT prio_id, prio_name 
            FROM Prioritaet 
            ORDER BY prio_id ASC
        `;
        
        // Datenbankabfrage ausführen
        const result = await db.query(query);
        
        // Erfolgreich: JSON-Array mit Prioritäten zurückgeben
        res.json(result.rows);
        
    } catch (error) {
        // Fehlerbehandlung: Log für Debugging, generische Fehlermeldung für Client
        console.error('Fehler beim Abrufen der Prioritäten:', error);
        res.status(500).json({ 
            error: 'Fehler beim Abrufen der Prioritäten',
            message: 'Interner Serverfehler - bitte später nochmal versuchen'
        });
    }
});

// Router exportieren für Verwendung in index.js
// Wird dort unter /api/prioritaet registriert
module.exports = router;
