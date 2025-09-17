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
        // SQL-Query: Alle User für Dropdown-Listen holen
        // Sortiert alphabetisch nach Benutzername
        const result = await pool.query(`
            SELECT 
                users_id,
                users_name
            FROM Users
            ORDER BY users_name
        `);
        
        res.json(result.rows);                                          // Alle Users als JSON
    } catch (err) {                                                     // Fängt DB-Fehler ab
        console.error(err);                                             // Loggt Fehler in Server-Konsole
        res.status(500).json({ error: 'Datenbankfehler' });             // Sendet HTTP 500 mit Fehlermeldung
    }
});

module.exports = router;
