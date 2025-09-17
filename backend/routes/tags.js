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
        const result = await pool.query(`                            // await wartet auf DB-Antwort, pool.query() führt SQL aus
            SELECT 
                t.tag_id,
                t.tag_name,
                COUNT(at.aufgaben_id) as aufgaben_anzahl,               -- Zählt wie viele Aufgaben diesen Tag haben
                CASE                                                     -- Macht schönere Anzeige statt nur Zahlen
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
        
        const result = await pool.query(`                            // Parameterized Query mit $1 - SICHER!
            SELECT 
                t.tag_id,
                t.tag_name,
                COUNT(at.aufgaben_id) as aufgaben_anzahl,               -- Zählt Aufgaben pro Tag
                CASE                                                     -- Macht schönere Anzeige statt nur Zahlen
                    WHEN COUNT(at.aufgaben_id) = 0 THEN 'Nicht verwendet'
                    WHEN COUNT(at.aufgaben_id) = 1 THEN '1 Aufgabe'
                    ELSE CONCAT(COUNT(at.aufgaben_id), ' Aufgaben')
                END as verwendung_info
            FROM Tags t                                                 
            LEFT JOIN aufgaben_tags at ON t.tag_id = at.tag_id         
            WHERE LOWER(t.tag_name) LIKE LOWER($1)                     -- LOWER() = findet "Beispieltag" auch bei "beispieltag" oder "BEISPIELTAG"
            GROUP BY t.tag_id, t.tag_name                              
            ORDER BY t.tag_name                                        
        `, [`%${searchTerm}%`]);                                        // %searchterm% = findet auch "javascript" in "BeispieltagJavaScript"
        
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
        
        const result = await pool.query(`                            // Parameterized Query mit $1 - SICHER!
            SELECT 
                t.tag_id,
                t.tag_name,
                COUNT(at.aufgaben_id) as aufgaben_anzahl               -- Zeigt wie beliebt der Tag ist
            FROM Tags t                                                 
            LEFT JOIN aufgaben_tags at ON t.tag_id = at.tag_id         
            WHERE LOWER(t.tag_name) LIKE LOWER($1)                     -- LOWER() = findet "Beispieltag" auch bei "beispieltag" oder "BEISPIELTAG"
            GROUP BY t.tag_id, t.tag_name                              
            ORDER BY COUNT(at.aufgaben_id) DESC, t.tag_name            -- Beliebte Tags zuerst, dann alphabetisch
            LIMIT 10                                                    -- Max 10 Vorschläge für schnelle Performance
        `, [`%${searchTerm}%`]);                                        // %searchterm% = findet auch "java" in "javascript"
        
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
        
        // Prüfen ob Tag bereits existiert (Duplikat-Vermeidung)
        const existingTag = await pool.query(`                       // Prüft auf existierenden Tag-Namen
            SELECT tag_id FROM Tags 
            WHERE LOWER(tag_name) = LOWER($1)                          -- LOWER() macht die Suche case-insensitive
        `, [tag_name.trim()]);                                          // trim() entfernt Leerzeichen am Anfang/Ende
        
        if (existingTag.rows.length > 0) {                             // Wenn Tag bereits existiert
            return res.status(409).json({ error: 'Tag existiert bereits' });  // HTTP 409 Conflict
        }
        
        const result = await pool.query(`                            // await wartet auf DB-Antwort, pool.query() führt SQL aus
            INSERT INTO Tags (tag_name)                                -- INSERT INTO für neue Datenzeile
            VALUES ($1)                                                 -- SICHERHEIT: Parameterized Query verhindert SQL-Injection
            RETURNING *                                                 -- RETURNING * gibt die eingefügte Zeile mit allen Feldern zurück (inkl. Auto-ID)
        `, [tag_name.trim()]);                                          // SICHERHEIT: Parameter wird sicher für $1 eingesetzt
        
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
        
        // Prüfen ob anderer Tag mit diesem Namen bereits existiert (Duplikat-Vermeidung)
        const existingTag = await pool.query(`                       // Prüft auf existierenden Tag-Namen (außer dem aktuellen)
            SELECT tag_id FROM Tags 
            WHERE LOWER(tag_name) = LOWER($1) AND tag_id != $2         -- LOWER() macht die Suche case-insensitive, != $2 schließt aktuellen Tag aus
        `, [tag_name.trim(), id]);                                      // trim() entfernt Leerzeichen, id ist der aktuelle Tag
        
        if (existingTag.rows.length > 0) {                             // Wenn anderer Tag mit diesem Namen bereits existiert
            return res.status(409).json({ error: 'Tag existiert bereits' });  // HTTP 409 Conflict
        }
        
        const result = await pool.query(`                            // await wartet auf DB-Antwort, pool.query() führt SQL aus
            UPDATE Tags 
            SET tag_name = $1                                           -- UPDATE tag_name mit neuem Wert
            WHERE tag_id = $2                                           -- WHERE-Klausel für spezifischen Tag
            RETURNING *                                                 -- RETURNING * gibt die aktualisierte Zeile mit allen Feldern zurück
        `, [tag_name.trim(), id]);                                      // SICHERHEIT: Array mit Parametern werden sicher für $1 und $2 eingesetzt
        
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
        
        // Prüfen ob Tag in Aufgaben verwendet wird (Referential Integrity)
        const usageCheck = await pool.query(`                        // Prüft ob Tag in Verknüpfungstabelle verwendet wird
            SELECT COUNT(*) as count FROM aufgaben_tags 
            WHERE tag_id = $1                                           -- Zählt Verknüpfungen mit diesem Tag
        `, [id]);
        
        const usageCount = parseInt(usageCheck.rows[0].count);         // Wandelt String in Zahl um
        if (usageCount > 0) {                                          // Wenn Tag noch verwendet wird
            return res.status(409).json({ 
                error: 'Tag kann nicht gelöscht werden', 
                reason: `Tag wird noch in ${usageCount} Aufgabe(n) verwendet`  // Informative Fehlermeldung
            });
        }
        
        const result = await pool.query(`                            // await wartet auf DB-Antwort, pool.query() führt SQL aus
            DELETE FROM Tags 
            WHERE tag_id = $1                                           -- WHERE-Klausel für spezifischen Tag
            RETURNING *                                                 -- RETURNING * gibt die gelöschte Zeile zurück (zur Bestätigung)
        `, [id]);                                                       // SICHERHEIT: Array mit Parameter wird sicher für $1 eingesetzt
        
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
