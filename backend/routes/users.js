/**
 * USERS.JS - Users Resource Router
 * - CRUD-Operationen für User-Management
 * - User-spezifische Statistiken und Operationen
 */

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /users - Alle User für Dropdown-Listen
router.get('/', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        const result = await pool.query(`                            // await wartet auf DB-Antwort, pool.query() führt SQL aus
            SELECT 
                users_id,
                users_name
            FROM Users                                                  -- Haupttabelle
            ORDER BY users_name                                         -- Alphabetische Sortierung
        `);
        
        res.json(result.rows);                                          // Alle Users als JSON
    } catch (err) {                                                     // Fängt DB-Fehler ab
        console.error(err);                                             // Loggt Fehler in Server-Konsole
        res.status(500).json({ error: 'Datenbankfehler' });             // Sendet HTTP 500 mit Fehlermeldung
    }
});

module.exports = router;
