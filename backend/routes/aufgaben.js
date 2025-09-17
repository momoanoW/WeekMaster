/**
 * AUFGABEN.JS - Aufgaben Resource Router
 * - Alle CRUD-Operationen für Aufgaben
 * - GET (Read), POST (Create), PUT (Update), DELETE (Delete)
 * - Komplexe Queries mit JOINs für vollständige Aufgaben-Details
 */

const express = require('express');
const router = express.Router();
const client = require('../db');

// GET /aufgaben - Alle Aufgaben mit vollständigen Details (für Hauptansicht)
router.get('/', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        const result = await client.query(`                            // await wartet auf DB-Antwort, client.query() führt SQL aus, Backtick für mehrzeilige Strings
            SELECT 
                a.aufgaben_id,
                a.beschreibung,
                a.frist,
                a.vorlaufzeit_tage,
                a.kontrolliert,
                u.users_name,
                p.prio_name,
                s.status_name,
                STRING_AGG(t.tag_name, ', ' ORDER BY t.tag_name) as tags  -- Alle Tags zu einem String zusammenfassen
            FROM Aufgaben a                                              -- Haupttabelle (alias 'a')
            LEFT JOIN Users u ON a.users_id = u.users_id                -- LEFT JOIN: auch Aufgaben ohne User anzeigen
            LEFT JOIN Prioritaet p ON a.prio_id = p.prio_id             -- LEFT JOIN: auch ohne Priorität
            LEFT JOIN Status s ON a.status_id = s.status_id             -- LEFT JOIN: auch ohne Status
            LEFT JOIN aufgaben_tags at ON a.aufgaben_id = at.aufgaben_id -- LEFT JOIN: Many-to-Many Verknüpfung
            LEFT JOIN Tags t ON at.tag_id = t.tag_id                    -- LEFT JOIN: auch Aufgaben ohne Tags
            GROUP BY                                                     -- GROUP BY nötig wegen STRING_AGG
                a.aufgaben_id, a.beschreibung, a.frist, a.vorlaufzeit_tage, a.kontrolliert,
                u.users_name, p.prio_name, s.status_name
            ORDER BY a.frist ASC NULLS LAST                             -- Hybrid-Sortierung: Backend-Vorsortierung nach Frist
        `);
        res.json(result.rows);                                          // Sendet nur die Datenzeilen als JSON
    } catch (err) {                                                     // Fängt DB-Fehler ab
        console.error(err);                                             // Loggt Fehler in Server-Konsole
        res.status(500).json({ error: 'Database error' });             // Sendet HTTP 500 mit Fehlermeldung
    }
});

// TODO: Weitere Aufgaben-Routen werden schrittweise hinzugefügt:
// GET /aufgaben/urgent - Dringende Aufgaben (nächste 7 Tage)  
// GET /aufgaben/user/:userId - Aufgaben nach Benutzer mit Statistiken
// GET /aufgaben/tag/:tagId - Aufgaben nach Tag

// TODO: CRUD-Operationen werden später hinzugefügt:
// POST /aufgaben - Neue Aufgabe erstellen
// PUT /aufgaben/:id - Aufgabe bearbeiten  
// PATCH /aufgaben/:id/status - Status ändern
// DELETE /aufgaben/:id - Aufgabe löschen

module.exports = router;
