/**
 * STATUS.JS - Router für Status-Verwaltung
 */

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /status - Alle Status für Dropdown-Menüs abrufen
// Gibt eine Liste aller Status zurück, sortiert nach ID

router.get('/', async (req, res) => {
    try {
        // ORDER BY status_id sorgt für konsistente Reihenfolge
        const query = `
            SELECT status_id, status_name 
            FROM Status 
            ORDER BY status_id ASC
        `;
        
        // Datenbankabfrage ausführen
        const result = await pool.query(query);
        
        // Erfolgreich: JSON-Array mit Status zurückgeben
        res.json(result.rows);
        
    } catch (error) {
        // Fehlerbehandlung: Log für Debugging, generische Fehlermeldung für Client
        console.error('Fehler beim Abrufen der Status:', error);
        res.status(500).json({ 
            error: 'Fehler beim Abrufen der Status',
            message: 'Interner Serverfehler - bitte später nochmal versuchen'
        });
    }
});

// Router exportieren für Verwendung in index.js
// Wird dort unter /api/status registriert
module.exports = router;
