/**
 * TAGS.JS - Tags Resource Router
 * - CRUD-Operationen für Tags
 * - Tag-Management und Tag-Zuweisungen
 */

const express = require('express');
const router = express.Router();
const client = require('../db');

// GET /tags - Alle Tags (für Dropdown-Listen und Übersicht)
router.get('/', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        const result = await client.query(`                            // await wartet auf DB-Antwort, client.query() führt SQL aus
            SELECT 
                t.tag_id,
                t.tag_name,
                COUNT(at.aufgaben_id) as aufgaben_anzahl,               -- Zählt wie viele Aufgaben diesen Tag haben
                CASE                                                     -- CASE-Statement für benutzerfreundliche Anzeige
                    WHEN COUNT(at.aufgaben_id) = 0 THEN 'Nicht verwendet'
                    WHEN COUNT(at.aufgaben_id) = 1 THEN '1 Aufgabe'
                    ELSE CONCAT(COUNT(at.aufgaben_id), ' Aufgaben')
                END as verwendung_info
            FROM Tags t                                                 -- Haupttabelle Tags
            LEFT JOIN aufgaben_tags at ON t.tag_id = at.tag_id         -- LEFT JOIN: auch Tags ohne Aufgaben anzeigen
            GROUP BY t.tag_id, t.tag_name                              -- GROUP BY nötig wegen COUNT Aggregation
            ORDER BY t.tag_name                                        -- Alphabetische Sortierung der Tag-Namen
        `);
        res.json(result.rows);                                          // Sendet alle Tag-Daten als JSON
    } catch (err) {                                                     // Fängt DB-Fehler ab
        console.error(err);                                             // Loggt Fehler in Server-Konsole
        res.status(500).json({ error: 'Database error' });             // Sendet HTTP 500 mit Fehlermeldung
    }
});

// GET /tags/search?q=searchterm - Tag-Suche mit SQL-Injection-Prävention
router.get('/search', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        const searchTerm = req.query.q;                                 // Benutzereingabe aus Query-Parameter
        
        if (!searchTerm) {                                              // Validierung: Suchterm muss vorhanden sein
            return res.status(400).json({ error: 'Query parameter q is required' });
        }
        
        const result = await client.query(`                            // Parameterized Query mit $1 - SICHER!
            SELECT 
                t.tag_id,
                t.tag_name,
                COUNT(at.aufgaben_id) as aufgaben_anzahl,               -- Zählt Aufgaben pro Tag
                CASE                                                     -- Benutzerfreundliche Anzeige
                    WHEN COUNT(at.aufgaben_id) = 0 THEN 'Nicht verwendet'
                    WHEN COUNT(at.aufgaben_id) = 1 THEN '1 Aufgabe'
                    ELSE CONCAT(COUNT(at.aufgaben_id), ' Aufgaben')
                END as verwendung_info
            FROM Tags t                                                 
            LEFT JOIN aufgaben_tags at ON t.tag_id = at.tag_id         
            WHERE LOWER(t.tag_name) LIKE LOWER($1)                     -- $1 = sichere Parameterübergabe
            GROUP BY t.tag_id, t.tag_name                              
            ORDER BY t.tag_name                                        
        `, [`%${searchTerm}%`]);                                        // Array mit Parametern - SQL-Injection unmöglich!
        
        res.json(result.rows);                                          // Suchergebnisse als JSON
    } catch (err) {                                                     
        console.error(err);                                             
        res.status(500).json({ error: 'Database error' });             
    }
});


// TODO: CRUD-Operationen werden später hinzugefügt:
// POST /tags - Neuen Tag erstellen
// PUT /tags/:id - Tag bearbeiten
// DELETE /tags/:id - Tag löschen
// POST /tags/:tagId/aufgaben/:aufgabenId - Tag zu Aufgabe hinzufügen
// DELETE /tags/:tagId/aufgaben/:aufgabenId - Tag von Aufgabe entfernen

module.exports = router;
