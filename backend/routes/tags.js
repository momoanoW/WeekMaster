/**
 * TAGS.JS - Tags Resource Router
 * - CRUD-Operationen für Tags
 * - Tag-Management und Tag-Zuweisungen
 */

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /tags - Alle Tags (für Dropdown-Listen und Übersicht)
router.get('/', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        // SQL-Query: Alle Tags mit Aufgaben-Anzahl und Verwendungsinfo
        // - COUNT zählt wie viele Aufgaben diesen Tag haben
        // - CASE macht schönere Anzeige statt nur Zahlen
        // - LEFT JOIN zeigt auch Tags ohne Aufgaben an
        // - GROUP BY nötig wegen COUNT Aggregation
        const result = await pool.query(`
            SELECT 
                t.tag_id,
                t.tag_name,
                COUNT(at.aufgaben_id) as aufgaben_anzahl,
                CASE
                    WHEN COUNT(at.aufgaben_id) = 0 THEN 'Nicht verwendet'
                    WHEN COUNT(at.aufgaben_id) = 1 THEN '1 Aufgabe'
                    ELSE CONCAT(COUNT(at.aufgaben_id), ' Aufgaben')
                END as verwendung_info
            FROM Tags t
            LEFT JOIN Aufgaben_Tags at ON t.tag_id = at.tag_id
            GROUP BY t.tag_id, t.tag_name
            ORDER BY t.tag_name
        `);
        res.json(result.rows);                                          // Sendet alle Tag-Daten als JSON
    } catch (err) {                                                     // Fängt DB-Fehler ab
        console.error(err);                                             // Loggt Fehler in Server-Konsole
        res.status(500).json({ error: 'Datenbankfehler' });             // Sendet HTTP 500 mit Fehlermeldung
    }
});

// GET /tags/search?q=searchterm - Tag-Suche mit SQL-Injection-Prävention
router.get('/search', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        const searchTerm = req.query.q;                                 // Benutzereingabe aus Query-Parameter
        
        if (!searchTerm) {                                              // Validierung: Suchterm muss vorhanden sein
            return res.status(400).json({ error: 'Query parameter q is required' });
        }
        
        // SQL-Query: Tag-Suche mit Parameterized Query für Sicherheit
        // - LOWER() macht Suche case-insensitive
        // - %searchterm% findet auch Teilstrings
        // - COUNT zählt Aufgaben pro Tag
        const result = await pool.query(`
            SELECT 
                t.tag_id,
                t.tag_name,
                COUNT(at.aufgaben_id) as aufgaben_anzahl,
                CASE
                    WHEN COUNT(at.aufgaben_id) = 0 THEN 'Nicht verwendet'
                    WHEN COUNT(at.aufgaben_id) = 1 THEN '1 Aufgabe'
                    ELSE CONCAT(COUNT(at.aufgaben_id), ' Aufgaben')
                END as verwendung_info
            FROM Tags t
            LEFT JOIN Aufgaben_Tags at ON t.tag_id = at.tag_id
            WHERE LOWER(t.tag_name) LIKE LOWER($1)
            GROUP BY t.tag_id, t.tag_name
            ORDER BY t.tag_name
        `, [`%${searchTerm}%`]);
        
        res.json(result.rows);                                          // Suchergebnisse als JSON
    } catch (err) {                                                     
        console.error(err);                                             
        res.status(500).json({ error: 'Datenbankfehler' });             
    }
});

// GET /tags/autocomplete?q=searchterm - Live-Suche für Tag-Eingabe
router.get('/autocomplete', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        const searchTerm = req.query.q;                                 // Benutzereingabe aus Query-Parameter
        
        if (!searchTerm || searchTerm.length < 1) {                     // Mindestens 1 Zeichen für Suche
            return res.json([]);                                        // Leeres Array wenn zu kurz
        }
        
        // SQL-Query: Autocomplete für Tag-Eingabe (max 10 Vorschläge)
        // - LOWER() macht Suche case-insensitive
        // - %searchterm% findet auch Teilstrings
        // - ORDER BY Beliebte Tags zuerst, dann alphabetisch
        // - LIMIT 10 für schnelle Performance
        const result = await pool.query(`
            SELECT 
                t.tag_id,
                t.tag_name,
                COUNT(at.aufgaben_id) as aufgaben_anzahl
            FROM Tags t
            LEFT JOIN Aufgaben_Tags at ON t.tag_id = at.tag_id
            WHERE LOWER(t.tag_name) LIKE LOWER($1)
            GROUP BY t.tag_id, t.tag_name
            ORDER BY COUNT(at.aufgaben_id) DESC, t.tag_name
            LIMIT 10
        `, [`%${searchTerm}%`]);
        
        res.json(result.rows);                                          // Autocomplete-Vorschläge als JSON
    } catch (err) {                                                     
        console.error(err);                                             
        res.status(500).json({ error: 'Datenbankfehler' });             
    }
});

// POST /tags - Neuen Tag erstellen
router.post('/', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        const { tag_name } = req.body;                                  // Destructuring: tag_name aus Request Body
        
        // Input-Validierung: Tag-Name ist Pflichtfeld
        if (!tag_name || !tag_name.trim()) {                           // Prüft auf null/undefined UND leeren String (trim() entfernt Leerzeichen)
            return res.status(400).json({ error: 'Tag-Name ist erforderlich' });  // HTTP 400 Bad Request mit Fehlermeldung
        }
        
        // Prüfung ob Tag bereits existiert (Duplikat-Vermeidung)
        // - LOWER() macht die Suche case-insensitive
        // - trim() entfernt Leerzeichen am Anfang/Ende
        const existingTag = await pool.query(`
            SELECT tag_id FROM Tags 
            WHERE LOWER(tag_name) = LOWER($1)
        `, [tag_name.trim()]);
        
        if (existingTag.rows.length > 0) {                             // Wenn Tag bereits existiert
            return res.status(409).json({ error: 'Tag existiert bereits' });  // HTTP 409 Conflict
        }
        
        // SQL-Query: Neuen Tag erstellen mit RETURNING für Auto-ID
        // - INSERT INTO für neue Datenzeile
        // - Parameterized Query verhindert SQL-Injection
        // - RETURNING * gibt eingefügte Zeile mit Auto-ID zurück
        const result = await pool.query(`
            INSERT INTO Tags (tag_name)
            VALUES ($1)
            RETURNING *
        `, [tag_name.trim()]);
        
        res.status(201).json(result.rows[0]);                          // HTTP 201 Created + der neue Tag als JSON (rows[0] = erste/einzige Zeile)
    } catch (err) {                                                     // Fängt alle DB-Fehler ab
        console.error(err);                                             // Loggt Fehlerdetails in Server-Konsole
        res.status(500).json({ error: 'Datenbankfehler' });             // Sendet HTTP 500 Status mit JSON-Fehlermeldung
    }
});

// PUT /tags/:id - Tag bearbeiten
router.put('/:id', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        const { id } = req.params;                                      // Destructuring: extrahiert id aus URL-Parameter (User-Input!)
        const { tag_name } = req.body;                                  // Destructuring: tag_name aus Request Body
        
        // Input-Validierung: Tag-Name ist Pflichtfeld
        if (!tag_name || !tag_name.trim()) {                           // Prüft auf null/undefined UND leeren String (trim() entfernt Leerzeichen)
            return res.status(400).json({ error: 'Tag-Name ist erforderlich' });  // HTTP 400 Bad Request mit Fehlermeldung
        }
        
        // Prüfung ob anderer Tag mit diesem Namen bereits existiert (Duplikat-Vermeidung)
        // - LOWER() macht die Suche case-insensitive
        // - != $2 schließt aktuellen Tag aus
        const existingTag = await pool.query(`
            SELECT tag_id FROM Tags 
            WHERE LOWER(tag_name) = LOWER($1) AND tag_id != $2
        `, [tag_name.trim(), id]);
        
        if (existingTag.rows.length > 0) {                             // Wenn anderer Tag mit diesem Namen bereits existiert
            return res.status(409).json({ error: 'Tag existiert bereits' });  // HTTP 409 Conflict
        }
        
        // SQL-Query: Tag aktualisieren mit RETURNING für Bestätigung
        // - UPDATE tag_name mit neuem Wert
        // - WHERE-Klausel für spezifischen Tag
        // - RETURNING * gibt aktualisierte Zeile zurück
        const result = await pool.query(`
            UPDATE Tags 
            SET tag_name = $1
            WHERE tag_id = $2
            RETURNING *
        `, [tag_name.trim(), id]);
        
        if (result.rows.length === 0) {                                 // Prüft ob Tag gefunden wurde
            return res.status(404).json({ error: 'Tag nicht gefunden' });  // HTTP 404 Not Found wenn keine Zeile betroffen
        }
        
        res.status(200).json(result.rows[0]);                          // HTTP 200 OK + der aktualisierte Tag als JSON
    } catch (err) {                                                     // Fängt alle DB-Fehler ab
        console.error(err);                                             // Loggt Fehlerdetails in Server-Konsole
        res.status(500).json({ error: 'Datenbankfehler' });             // Sendet HTTP 500 Status mit JSON-Fehlermeldung
    }
});

// DELETE /tags/:id - Tag löschen
router.delete('/:id', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        const { id } = req.params;                                      // Destructuring: extrahiert id aus URL-Parameter (User-Input!)
        
        // Input-Validierung: ID muss eine gültige Zahl sein
        if (!id || isNaN(id)) {                                        // Prüft ob ID vorhanden und numerisch ist (isNaN = is Not a Number)
            return res.status(400).json({ error: 'Gültige Tag-ID ist erforderlich' });  // HTTP 400 Bad Request mit Fehlermeldung
        }
        
        // Prüfung ob Tag in Aufgaben verwendet wird (Referential Integrity)
        // - Zählt Verknüpfungen mit diesem Tag in Aufgaben_Tags
        const usageCheck = await pool.query(`
            SELECT COUNT(*) as count FROM Aufgaben_Tags 
            WHERE tag_id = $1
        `, [id]);
        
        const usageCount = parseInt(usageCheck.rows[0].count);         // Wandelt String in Zahl um
        if (usageCount > 0) {                                          // Wenn Tag noch verwendet wird
            return res.status(409).json({ 
                error: 'Tag kann nicht gelöscht werden', 
                reason: `Tag wird noch in ${usageCount} Aufgabe(n) verwendet`  // Informative Fehlermeldung
            });
        }
        
        // SQL-Query: Tag löschen mit RETURNING für Bestätigung
        // - DELETE FROM für Löschung
        // - WHERE-Klausel für spezifischen Tag
        // - RETURNING * gibt gelöschte Zeile zur Bestätigung zurück
        const result = await pool.query(`
            DELETE FROM Tags 
            WHERE tag_id = $1
            RETURNING *
        `, [id]);
        
        if (result.rows.length === 0) {                                 // Prüft ob Tag gefunden wurde
            return res.status(404).json({ error: 'Tag nicht gefunden' });  // HTTP 404 Not Found wenn keine Zeile betroffen
        }
        
        res.status(200).json({ 
            message: 'Tag erfolgreich gelöscht',                       // Erfolgs-Nachricht
            deleted_tag: result.rows[0]                                 // Der gelöschte Tag zur Bestätigung
        });
    } catch (err) {                                                     // Fängt alle DB-Fehler ab
        console.error(err);                                             // Loggt Fehlerdetails in Server-Konsole
        res.status(500).json({ error: 'Datenbankfehler' });             // Sendet HTTP 500 Status mit JSON-Fehlermeldung
    }
});

module.exports = router;
