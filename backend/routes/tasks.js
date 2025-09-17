/**
 * TASKS.JS - Aufgaben Resource Router
 * - Alle CRUD-Operationen für Aufgaben
 * - GET (Read), POST (Create), PUT (Update), DELETE (Delete)
 * - Komplexe Queries mit JOINs für vollständige Aufgaben-Details
 */

const express = require('express');
const router = express.Router();
const client = require('../db');

// GET /tasks - Alle Aufgaben mit vollständigen Details (für Hauptansicht)
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

// GET /tasks/urgent - Dringende Aufgaben (nächste 7 Tage)
router.get('/urgent', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        const result = await client.query(`                            // await wartet auf DB-Antwort, client.query() führt SQL aus
            SELECT 
                a.aufgaben_id,
                a.beschreibung,
                a.frist,
                u.users_name,
                p.prio_name,
                s.status_name,
                CASE                                                     // CASE-Statement für benutzerfreundliche Datumsanzeige (wie if-else)
                    WHEN a.frist = CURRENT_DATE THEN 'Heute fällig!'                -- Fall 1: Einfacher String
                    WHEN a.frist = CURRENT_DATE + 1 THEN 'Morgen fällig!'           -- Fall 2: Einfacher String
                    ELSE CONCAT('Fällig in ', (a.frist - CURRENT_DATE), ' Tagen')   -- Fall 3: CONCAT nur hier ausgeführt
                END as frist_info
            FROM Aufgaben a                                              -- Haupttabelle
            JOIN Users u ON a.users_id = u.users_id                     -- INNER JOIN: nur Aufgaben mit User
            JOIN Prioritaet p ON a.prio_id = p.prio_id                  -- INNER JOIN: nur mit Priorität
            JOIN Status s ON a.status_id = s.status_id                  -- INNER JOIN: nur mit Status
            WHERE a.frist BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'  -- Datumsbereich-Filter
            AND s.status_name != 'Erledigt'                             -- Status-Filter mit != Operator
            ORDER BY a.frist, p.prio_id                                 -- Mehrfach-Sortierung: erst Datum, dann Priorität
        `);
        res.json(result.rows);                                          // Sendet nur Datenzeilen als JSON-Response
    } catch (err) {                                                     // Fängt alle DB-Fehler ab
        console.error(err);                                             // Loggt Fehlerdetails in Server-Konsole
        res.status(500).json({ error: 'Database error' });             // Sendet HTTP 500 Status mit JSON-Fehlermeldung
    }
});

// GET /tasks/user/:userId - Aufgaben nach Benutzer mit Statistiken
router.get('/user/:userId', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        const { userId } = req.params;                                  // Destructuring: extrahiert userId aus URL-Parameter (User-Input!)
        const result = await client.query(`                            // await wartet auf DB-Antwort, client.query() führt SQL aus
            SELECT 
                a.aufgaben_id,
                a.beschreibung,
                a.frist,
                a.kontrolliert,
                p.prio_name,
                s.status_name,
                COUNT(CASE WHEN s.status_name = 'Erledigt' THEN 1 END) OVER() as erledigte_gesamt,  -- Window Function: zählt erledigte Aufgaben über alle Zeilen
                COUNT(*) OVER() as aufgaben_gesamt                      -- Window Function: zählt alle Aufgaben des Users
            FROM Aufgaben a                                             -- Haupttabelle
            JOIN Users u ON a.users_id = u.users_id                    -- INNER JOIN: nur Aufgaben mit User
            JOIN Prioritaet p ON a.prio_id = p.prio_id                 -- INNER JOIN: nur mit Priorität
            JOIN Status s ON a.status_id = s.status_id                 -- INNER JOIN: nur mit Status
            WHERE a.users_id = $1                                      -- SICHERHEIT: Parameterized Query verhindert SQL-Injection ($1 = Platzhalter)
            ORDER BY 
                CASE s.status_name                                      -- CASE in ORDER BY für intelligente Sortierung
                    WHEN 'Erledigt' THEN 3                             -- Erledigte Aufgaben nach unten
                    WHEN 'In Bearbeitung' THEN 1                       -- In Bearbeitung nach oben
                    ELSE 2                                              -- Offene Aufgaben in der Mitte
                END,
                a.frist ASC NULLS LAST                                  -- Sekundäre Sortierung: nach Frist
        `, [userId]);                                                   // SICHERHEIT: Array mit Parametern - userId wird sicher für $1 eingesetzt
        res.json(result.rows);                                          // Sendet nur Datenzeilen als JSON-Response
    } catch (err) {                                                     // Fängt alle DB-Fehler ab
        console.error(err);                                             // Loggt Fehlerdetails in Server-Konsole
        res.status(500).json({ error: 'Database error' });             // Sendet HTTP 500 Status mit JSON-Fehlermeldung
    }
});

// GET /tasks/tag/:tagId - Aufgaben nach Tag
router.get('/tag/:tagId', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        const { tagId } = req.params;                                   // Destructuring: extrahiert tagId aus URL-Parameter (User-Input!)
        const result = await client.query(`                            // await wartet auf DB-Antwort, client.query() führt SQL aus
            SELECT 
                a.aufgaben_id,
                a.beschreibung,
                a.frist,
                u.users_name,
                p.prio_name,
                s.status_name,
                t.tag_name
            FROM Aufgaben a                                             -- Haupttabelle
            JOIN aufgaben_tags at ON a.aufgaben_id = at.aufgaben_id    -- INNER JOIN: über Junction Table für Many-to-Many
            JOIN Tags t ON at.tag_id = t.tag_id                        -- INNER JOIN: für Tag-Details
            JOIN Users u ON a.users_id = u.users_id                    -- INNER JOIN: für User-Details
            JOIN Prioritaet p ON a.prio_id = p.prio_id                 -- INNER JOIN: für Prioritäts-Details
            JOIN Status s ON a.status_id = s.status_id                 -- INNER JOIN: für Status-Details
            WHERE t.tag_id = $1                                        -- SICHERHEIT: Parameterized Query verhindert SQL-Injection ($1 = Platzhalter)
            ORDER BY a.frist ASC NULLS LAST                            -- Sortierung nach Frist, NULL-Werte am Ende
        `, [tagId]);                                                    // SICHERHEIT: Array mit Parametern - tagId wird sicher für $1 eingesetzt
        res.json(result.rows);                                          // Sendet alle Datenzeilen als JSON-Response
    } catch (err) {                                                     // Fängt alle DB-Fehler ab
        console.error(err);                                             // Loggt Fehlerdetails in Server-Konsole
        res.status(500).json({ error: 'Database error' });             // Sendet HTTP 500 Status mit JSON-Fehlermeldung
    }
});

// POST /tasks - Neue Aufgabe erstellen
router.post('/', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        const { beschreibung, frist, vorlaufzeit_tage, users_id, prio_id, status_id } = req.body;  // Destructuring: Nimm diese Eigenschaften aus dem req.body Objekt und erstelle Variablen mit den gleichen Namen
        
        // Input-Validierung: Pflichtfelder prüfen
        if (!beschreibung || !beschreibung.trim()) {                   // Prüft auf null/undefined UND leeren String (trim() entfernt Leerzeichen am Anfang/Ende)
            return res.status(400).json({ error: 'Beschreibung ist erforderlich' });  // HTTP 400 Bad Request mit Fehlermeldung
        }
        if (!users_id) {                                               // Prüft ob users_id vorhanden ist
            return res.status(400).json({ error: 'User ID ist erforderlich' });
        }
        if (!prio_id) {                                                // Prüft ob prio_id vorhanden ist
            return res.status(400).json({ error: 'Priorität ist erforderlich' });
        }
        if (!status_id) {                                              // Prüft ob status_id vorhanden ist
            return res.status(400).json({ error: 'Status ist erforderlich' });
        }
        
        const result = await client.query(`                            // await wartet auf DB-Antwort, client.query() führt SQL aus
            INSERT INTO Aufgaben (                                     -- INSERT INTO für neue Datenzeile
                beschreibung, 
                frist, 
                vorlaufzeit_tage, 
                users_id, 
                prio_id, 
                status_id,
                kontrolliert
            ) VALUES ($1, $2, $3, $4, $5, $6, false)                   -- SICHERHEIT: Parameterized Query verhindert SQL-Injection, kontrolliert standardmäßig false
            RETURNING *                                                 -- RETURNING * gibt die eingefügte Zeile mit allen Feldern zurück (inkl. Auto-ID)
        `, [beschreibung, frist, vorlaufzeit_tage, users_id, prio_id, status_id]);  // SICHERHEIT: Array mit Parametern werden sicher für $1-$6 eingesetzt
        
        res.status(201).json(result.rows[0]);                          // HTTP 201 Created + die neue Aufgabe als JSON (rows[0] = erste/einzige Zeile)
    } catch (err) {                                                     // Fängt alle DB-Fehler ab
        console.error(err);                                             // Loggt Fehlerdetails in Server-Konsole  
        res.status(500).json({ error: 'Database error' });             // Sendet HTTP 500 Status mit JSON-Fehlermeldung
    }
});    



// PUT /tasks/:id - Aufgabe bearbeiten  
// PATCH /tasks/:id/status - Status ändern
// DELETE /tasks/:id - Aufgabe löschen

module.exports = router;
