/**
 * TASKS.JS - Aufgaben Resource Router
 * - Alle CRUD-Operationen für Aufgaben
 * - GET (Read), POST (Create), PUT (Update), DELETE (Delete)
 * - Komplexe Queries mit JOINs für vollständige Aufgaben-Details
 */

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /tasks - Alle Aufgaben mit vollständigen Details (für Hauptansicht)
router.get('/', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        // SQL-Query: Komplexe Abfrage mit mehreren JOINs für vollständige Aufgaben-Details
        // - STRING_AGG fasst alle Tags zu einem String zusammen
        // - LEFT JOINs zeigen auch Aufgaben ohne User/Priorität/Status/Tags an
        // - GROUP BY nötig wegen STRING_AGG Aggregatfunktion
        // - Sortierung nach Frist, NULL-Werte am Ende
        const result = await pool.query(`
            SELECT aufgaben_id, beschreibung 
            FROM Aufgaben 
            LIMIT 5
        `);
        res.json(result.rows);                                          // Sendet nur die Datenzeilen als JSON
    } catch (err) {                                                     // Fängt DB-Fehler ab
        console.error(err);                                             // Loggt Fehler in Server-Konsole
        res.status(500).json({ error: 'Datenbankfehler' });             // Sendet HTTP 500 mit Fehlermeldung
    }
});

// GET /tasks/urgent - Dringende Aufgaben (nächste 7 Tage)
router.get('/urgent', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        // SQL-Query: Dringende Aufgaben der nächsten 7 Tage
        // - CASE-Statement für benutzerfreundliche Datumsanzeige
        // - INNER JOINs nur für Aufgaben mit allen Verknüpfungen
        // - Datumsbereich-Filter und Status-Filter
        // - Sortierung nach Frist und Priorität
        const result = await pool.query(`
            SELECT 
                a.aufgaben_id,
                a.beschreibung,
                a.frist,
                u.users_name,
                p.prio_name,
                s.status_name,
                CASE
                    WHEN a.frist = CURRENT_DATE THEN 'Heute fällig!'
                    WHEN a.frist = CURRENT_DATE + 1 THEN 'Morgen fällig!'
                    ELSE CONCAT('Fällig in ', (a.frist - CURRENT_DATE), ' Tagen')
                END as frist_info
            FROM Aufgaben a
            JOIN Users u ON a.users_id = u.users_id
            JOIN Prioritaet p ON a.prio_id = p.prio_id
            JOIN Status s ON a.status_id = s.status_id
            WHERE a.frist BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
            AND s.status_name != 'Erledigt'
            ORDER BY a.frist, p.prio_id
        `);
        res.json(result.rows);                                          // Sendet nur Datenzeilen als JSON-Response
    } catch (err) {                                                     // Fängt alle DB-Fehler ab
        console.error(err);                                             // Loggt Fehlerdetails in Server-Konsole
        res.status(500).json({ error: 'Datenbankfehler' });             // Sendet HTTP 500 Status mit JSON-Fehlermeldung
    }
});

// GET /tasks/user/:userId - Aufgaben nach Benutzer mit Statistiken
router.get('/user/:userId', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        // SQL-Query: Aufgaben nach Benutzer mit Statistiken
        // - Fensterfunktionen (OVER) zeigen Gesamtstatistiken bei jeder Zeile
        // - Parameterized Query für Sicherheit ($1 Platzhalter)
        // - Intelligente Sortierung: Status-basiert, dann nach Frist
        const { userId } = req.params;                                  // Destructuring: extrahiert userId aus URL-Parameter (User-Input!)
        const result = await pool.query(`
            SELECT 
                a.aufgaben_id,
                a.beschreibung,
                a.frist,
                a.kontrolliert,
                p.prio_name,
                s.status_name,
                COUNT(CASE WHEN s.status_name = 'Erledigt' THEN 1 END) OVER() as erledigte_gesamt,
                COUNT(*) OVER() as aufgaben_gesamt
            FROM Aufgaben a
            JOIN Users u ON a.users_id = u.users_id
            JOIN Prioritaet p ON a.prio_id = p.prio_id
            JOIN Status s ON a.status_id = s.status_id
            WHERE a.users_id = $1
            ORDER BY 
                CASE s.status_name
                    WHEN 'Erledigt' THEN 3
                    WHEN 'In Bearbeitung' THEN 1
                    ELSE 2
                END,
                a.frist ASC NULLS LAST
        `, [userId]);
        res.json(result.rows);                                          // Sendet nur Datenzeilen als JSON-Response
    } catch (err) {                                                     // Fängt alle DB-Fehler ab
        console.error(err);                                             // Loggt Fehlerdetails in Server-Konsole
        res.status(500).json({ error: 'Datenbankfehler' });             // Sendet HTTP 500 Status mit JSON-Fehlermeldung
    }
});

// GET /tasks/tag/:tagId - Aufgaben nach Tag
router.get('/tag/:tagId', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        // SQL-Query: Aufgaben nach Tag über N:N Verknüpfung
        // - INNER JOINs über Verknüpfungstabelle aufgaben_tags
        // - Parameterized Query für Sicherheit ($1 Platzhalter)
        // - Sortierung nach Frist, NULL-Werte am Ende
        const { tagId } = req.params;                                   // Destructuring: extrahiert tagId aus URL-Parameter (User-Input!)
        const result = await pool.query(`
            SELECT 
                a.aufgaben_id,
                a.beschreibung,
                a.frist,
                u.users_name,
                p.prio_name,
                s.status_name,
                t.tag_name
            FROM Aufgaben a
            JOIN aufgaben_tags at ON a.aufgaben_id = at.aufgaben_id
            JOIN Tags t ON at.tag_id = t.tag_id
            JOIN Users u ON a.users_id = u.users_id
            JOIN Prioritaet p ON a.prio_id = p.prio_id
            JOIN Status s ON a.status_id = s.status_id
            WHERE t.tag_id = $1
            ORDER BY a.frist ASC NULLS LAST
        `, [tagId]);
        res.json(result.rows);                                          // Sendet alle Datenzeilen als JSON-Response
    } catch (err) {                                                     // Fängt alle DB-Fehler ab
        console.error(err);                                             // Loggt Fehlerdetails in Server-Konsole
        res.status(500).json({ error: 'Datenbankfehler' });             // Sendet HTTP 500 Status mit JSON-Fehlermeldung
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
        
        // SQL-Query: Neue Aufgabe erstellen mit Eingabevalidierung
        // - INSERT INTO mit RETURNING * gibt neue Zeile mit Auto-ID zurück
        // - Parameterized Query für Sicherheit ($1-$6 Platzhalter)
        // - kontrolliert standardmäßig auf false gesetzt
        const result = await pool.query(`
            INSERT INTO Aufgaben (
                beschreibung, 
                frist, 
                vorlaufzeit_tage, 
                users_id, 
                prio_id, 
                status_id,
                kontrolliert
            ) VALUES ($1, $2, $3, $4, $5, $6, false)
            RETURNING *
        `, [beschreibung, frist, vorlaufzeit_tage, users_id, prio_id, status_id]);
        
        res.status(201).json(result.rows[0]);                          // HTTP 201 Created + die neue Aufgabe als JSON (rows[0] = erste/einzige Zeile)
    } catch (err) {                                                     // Fängt alle DB-Fehler ab
        console.error(err);                                             // Loggt Fehlerdetails in Server-Konsole  
        res.status(500).json({ error: 'Datenbankfehler' });             // Sendet HTTP 500 Status mit JSON-Fehlermeldung
    }
});    



// PUT /tasks/:id - Ganze Aufgabe bearbeiten  
router.put('/:id', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        const { id } = req.params;                                      // Destructuring: extrahiert id aus URL-Parameter (User-Input!)
        const { beschreibung, frist, vorlaufzeit_tage, users_id, prio_id, status_id } = req.body;  // Destructuring: alle Felder aus Request Body
        
        // Input-Validierung: Pflichtfelder prüfen (wie bei POST)
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
        
        // SQL-Query: Ganze Aufgabe aktualisieren mit Eingabevalidierung
        // - UPDATE mit RETURNING * gibt aktualisierte Zeile zurück
        // - Parameterized Query für Sicherheit ($1-$7 Platzhalter)
        // - WHERE-Klausel für spezifische Aufgabe
        const result = await pool.query(`
            UPDATE Aufgaben 
            SET beschreibung = $1,
                frist = $2,
                vorlaufzeit_tage = $3,
                users_id = $4,
                prio_id = $5,
                status_id = $6
            WHERE aufgaben_id = $7
            RETURNING *
        `, [beschreibung, frist, vorlaufzeit_tage, users_id, prio_id, status_id, id]);
        
        if (result.rows.length === 0) {                                 // Prüft ob Aufgabe gefunden wurde
            return res.status(404).json({ error: 'Aufgabe nicht gefunden' });  // HTTP 404 Not Found wenn keine Zeile betroffen
        }
        
        res.status(200).json(result.rows[0]);                          // HTTP 200 OK + die aktualisierte Aufgabe als JSON
    } catch (err) {                                                     // Fängt alle DB-Fehler ab
        console.error(err);                                             // Loggt Fehlerdetails in Server-Konsole
        res.status(500).json({ error: 'Datenbankfehler' });             // Sendet HTTP 500 Status mit JSON-Fehlermeldung
    }
});

// PATCH /tasks/:id/status - Status ändern
router.patch('/:id/status', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        const { id } = req.params;                                      // Destructuring: extrahiert id aus URL-Parameter (User-Input!)
        const { status_id } = req.body;                                 // Destructuring: nur status_id aus Request Body
        
        // Input-Validierung: Status ist Pflichtfeld
        if (!status_id) {                                              // Prüft ob status_id vorhanden ist
            return res.status(400).json({ error: 'Status ID ist erforderlich' });  // HTTP 400 Bad Request mit Fehlermeldung
        }
        
        // SQL-Query: Nur Status-Feld aktualisieren (PATCH für teilweise Updates)
        // - UPDATE nur status_id Feld mit RETURNING *
        // - Parameterized Query für Sicherheit ($1-$2 Platzhalter)
        // - WHERE-Klausel für spezifische Aufgabe
        const result = await pool.query(`
            UPDATE Aufgaben 
            SET status_id = $1
            WHERE aufgaben_id = $2
            RETURNING *
        `, [status_id, id]);
        
        if (result.rows.length === 0) {                                 // Prüft ob Aufgabe gefunden wurde
            return res.status(404).json({ error: 'Aufgabe nicht gefunden' });  // HTTP 404 Not Found wenn keine Zeile betroffen
        }
        
        res.status(200).json(result.rows[0]);                          // HTTP 200 OK + die aktualisierte Aufgabe als JSON
    } catch (err) {                                                     // Fängt alle DB-Fehler ab
        console.error(err);                                             // Loggt Fehlerdetails in Server-Konsole
        res.status(500).json({ error: 'Datenbankfehler' });             // Sendet HTTP 500 Status mit JSON-Fehlermeldung
    }
});

// DELETE /tasks/:id - Aufgabe löschen
router.delete('/:id', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        const { id } = req.params;                                      // Destructuring: extrahiert id aus URL-Parameter (User-Input!)
        
        // Input-Validierung: ID muss eine gültige Zahl sein
        if (!id || isNaN(id)) {                                        // Prüft ob ID vorhanden und numerisch ist (isNaN = is Not a Number)
            return res.status(400).json({ error: 'Gültige Aufgaben-ID ist erforderlich' });  // HTTP 400 Bad Request mit Fehlermeldung
        }
        
        // SQL-Query: Aufgabe löschen mit Bestätigung
        // - DELETE mit RETURNING * gibt gelöschte Zeile zur Bestätigung zurück
        // - Parameterized Query für Sicherheit ($1 Platzhalter)
        // - WHERE-Klausel für spezifische Aufgabe
        const result = await pool.query(`
            DELETE FROM Aufgaben 
            WHERE aufgaben_id = $1
            RETURNING *
        `, [id]);
        
        if (result.rows.length === 0) {                                 // Prüft ob Aufgabe gefunden wurde
            return res.status(404).json({ error: 'Aufgabe nicht gefunden' });  // HTTP 404 Not Found wenn keine Zeile betroffen
        }
        
        res.status(200).json({ 
            message: 'Aufgabe erfolgreich gelöscht',                   // Erfolgs-Nachricht
            deleted_task: result.rows[0]                               // Die gelöschte Aufgabe zur Bestätigung
        });
    } catch (err) {                                                     // Fängt alle DB-Fehler ab
        console.error(err);                                             // Loggt Fehlerdetails in Server-Konsole
        res.status(500).json({ error: 'Datenbankfehler' });             // Sendet HTTP 500 Status mit JSON-Fehlermeldung
    }
});

module.exports = router;
