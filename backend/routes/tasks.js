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
        // - LEFT JOINs zeigen auch Aufgaben ohne User/Priorität/Status/Tags/Fristen an
        // - GROUP BY nötig wegen STRING_AGG Aggregatfunktion
        // - Sortierung nach Frist, NULL-Werte am Ende
        const result = await pool.query(`
            SELECT 
                a.aufgaben_id,
                a.beschreibung,
                a.hat_frist,
                af.frist_datum,
                a.vorlaufzeit_tage,
                u.users_name,
                p.prio_name,
                s.status_name,
                STRING_AGG(t.tag_name, ', ' ORDER BY t.tag_name) as tags
            FROM Aufgaben a
            LEFT JOIN Users u ON a.users_id = u.users_id
            LEFT JOIN Prioritaet p ON a.prio_id = p.prio_id
            LEFT JOIN Status s ON a.status_id = s.status_id
            LEFT JOIN Aufgaben_Fristen af ON a.aufgaben_id = af.aufgaben_id
            LEFT JOIN Aufgaben_Tags at ON a.aufgaben_id = at.aufgaben_id
            LEFT JOIN Tags t ON at.tag_id = t.tag_id
            GROUP BY
                a.aufgaben_id, a.beschreibung, a.hat_frist, af.frist_datum, a.vorlaufzeit_tage,
                u.users_name, p.prio_name, s.status_name
            ORDER BY af.frist_datum ASC NULLS LAST
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
        // - Datumsbereich-Filter und Status-Filter mit neuer Frist-Struktur
        // - Sortierung nach Frist und Priorität
        const result = await pool.query(`
            SELECT 
                a.aufgaben_id,
                a.beschreibung,
                a.hat_frist,
                af.frist_datum,
                u.users_name,
                p.prio_name,
                s.status_name,
                CASE
                    WHEN af.frist_datum = CURRENT_DATE THEN 'Heute fällig!'
                    WHEN af.frist_datum = CURRENT_DATE + 1 THEN 'Morgen fällig!'
                    ELSE CONCAT('Fällig in ', (af.frist_datum - CURRENT_DATE), ' Tagen')
                END as frist_info
            FROM Aufgaben a
            JOIN Aufgaben_Fristen af ON a.aufgaben_id = af.aufgaben_id
            JOIN Users u ON a.users_id = u.users_id
            JOIN Prioritaet p ON a.prio_id = p.prio_id
            JOIN Status s ON a.status_id = s.status_id
            WHERE af.frist_datum BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
            AND s.status_name != 'Erledigt'
            ORDER BY af.frist_datum, p.prio_id
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
        // - Intelligente Sortierung: Status-basiert, dann nach Frist mit neuer Struktur
        const { userId } = req.params;                                  // Destructuring: extrahiert userId aus URL-Parameter (User-Input!)
        const result = await pool.query(`
            SELECT 
                a.aufgaben_id,
                a.beschreibung,
                a.hat_frist,
                af.frist_datum,
                a.vorlaufzeit_tage,
                p.prio_name,
                s.status_name,
                COUNT(CASE WHEN s.status_name = 'Erledigt' THEN 1 END) OVER() as erledigte_gesamt,
                COUNT(*) OVER() as aufgaben_gesamt
            FROM Aufgaben a
            LEFT JOIN Aufgaben_Fristen af ON a.aufgaben_id = af.aufgaben_id
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
                af.frist_datum ASC NULLS LAST
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
        // - INNER JOINs über Verknüpfungstabelle Aufgaben_Tags
        // - Parameterized Query für Sicherheit ($1 Platzhalter)
        // - Sortierung nach Frist mit neuer Struktur, NULL-Werte am Ende
        const { tagId } = req.params;                                   // Destructuring: extrahiert tagId aus URL-Parameter (User-Input!)
        const result = await pool.query(`
            SELECT 
                a.aufgaben_id,
                a.beschreibung,
                a.hat_frist,
                af.frist_datum,
                a.vorlaufzeit_tage,
                u.users_name,
                p.prio_name,
                s.status_name,
                t.tag_name
            FROM Aufgaben a
            LEFT JOIN Aufgaben_Fristen af ON a.aufgaben_id = af.aufgaben_id
            JOIN Aufgaben_Tags at ON a.aufgaben_id = at.aufgaben_id
            JOIN Tags t ON at.tag_id = t.tag_id
            JOIN Users u ON a.users_id = u.users_id
            JOIN Prioritaet p ON a.prio_id = p.prio_id
            JOIN Status s ON a.status_id = s.status_id
            WHERE t.tag_id = $1
            ORDER BY af.frist_datum ASC NULLS LAST
        `, [tagId]);
        res.json(result.rows);                                          // Sendet alle Datenzeilen als JSON-Response
    } catch (err) {                                                     // Fängt alle DB-Fehler ab
        console.error(err);                                             // Loggt Fehlerdetails in Server-Konsole
        res.status(500).json({ error: 'Datenbankfehler' });             // Sendet HTTP 500 Status mit JSON-Fehlermeldung
    }
});

// POST /tasks - Neue Aufgabe erstellen
router.post('/', async (req, res) => {
    const client = await pool.connect();                               // Database transaction für Konsistenz
    try {                                                               // try-catch für Fehlerbehandlung
        await client.query('BEGIN');                                   // Transaction starten
        
        const { beschreibung, hat_frist, frist_datum, vorlaufzeit_tage, users_id, prio_id, status_id } = req.body;  // Destructuring mit neuen Feldern
        
        // Input-Validierung: Pflichtfelder prüfen
        if (!beschreibung || !beschreibung.trim()) {                   // Prüft auf null/undefined UND leeren String
            return res.status(400).json({ error: 'Beschreibung ist erforderlich' });
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
        if (hat_frist && !frist_datum) {                              // Validierung: wenn hat_frist=true, dann muss frist_datum vorhanden sein
            return res.status(400).json({ error: 'Frist-Datum ist erforderlich wenn "Hat Frist" aktiviert ist' });
        }
        
        // SCHRITT 1: Aufgabe erstellen
        const aufgabenResult = await client.query(`
            INSERT INTO Aufgaben (
                beschreibung, 
                hat_frist,
                vorlaufzeit_tage, 
                users_id, 
                prio_id, 
                status_id
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [beschreibung, hat_frist || false, vorlaufzeit_tage || 0, users_id, prio_id, status_id]);
        
        const neue_aufgabe = aufgabenResult.rows[0];
        
        // SCHRITT 2: NUR wenn hat_frist=true, dann Frist-Eintrag erstellen
        if (hat_frist && frist_datum) {
            await client.query(`
                INSERT INTO Aufgaben_Fristen (aufgaben_id, frist_datum)
                VALUES ($1, $2)
            `, [neue_aufgabe.aufgaben_id, frist_datum]);
        }
        
        await client.query('COMMIT');                                  // Transaction bestätigen
        
        // Vollständige Aufgabe mit Frist-Info zurückgeben
        const vollstaendigeAufgabe = await pool.query(`
            SELECT 
                a.aufgaben_id,
                a.beschreibung,
                a.hat_frist,
                af.frist_datum,
                a.vorlaufzeit_tage,
                u.users_name,
                p.prio_name,
                s.status_name
            FROM Aufgaben a
            LEFT JOIN Aufgaben_Fristen af ON a.aufgaben_id = af.aufgaben_id
            LEFT JOIN Users u ON a.users_id = u.users_id
            LEFT JOIN Prioritaet p ON a.prio_id = p.prio_id
            LEFT JOIN Status s ON a.status_id = s.status_id
            WHERE a.aufgaben_id = $1
        `, [neue_aufgabe.aufgaben_id]);
        
        res.status(201).json(vollstaendigeAufgabe.rows[0]);            // HTTP 201 Created + vollständige Aufgabe
    } catch (err) {                                                     // Fängt alle DB-Fehler ab
        await client.query('ROLLBACK');                               // Transaction rückgängig machen bei Fehler
        console.error(err);                                             // Loggt Fehlerdetails in Server-Konsole  
        res.status(500).json({ error: 'Datenbankfehler' });             // Sendet HTTP 500 Status mit JSON-Fehlermeldung
    } finally {
        client.release();                                              // Database connection freigeben
    }
});    



// PUT /tasks/:id - Ganze Aufgabe bearbeiten  
router.put('/:id', async (req, res) => {
    const client = await pool.connect();                               // Database transaction für Konsistenz
    try {                                                               // try-catch für Fehlerbehandlung
        await client.query('BEGIN');                                   // Transaction starten
        
        const { id } = req.params;                                      // Destructuring: extrahiert id aus URL-Parameter (User-Input!)
        const { beschreibung, hat_frist, frist_datum, vorlaufzeit_tage, users_id, prio_id, status_id } = req.body;  // Destructuring mit neuen Feldern
        
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
        if (hat_frist && !frist_datum) {                              // Validierung: wenn hat_frist=true, dann muss frist_datum vorhanden sein
            return res.status(400).json({ error: 'Frist-Datum ist erforderlich wenn "Hat Frist" aktiviert ist' });
        }
        
        // SCHRITT 1: Aufgabe aktualisieren
        const aufgabenResult = await client.query(`
            UPDATE Aufgaben 
            SET beschreibung = $1,
                hat_frist = $2,
                vorlaufzeit_tage = $3,
                users_id = $4,
                prio_id = $5,
                status_id = $6
            WHERE aufgaben_id = $7
            RETURNING *
        `, [beschreibung, hat_frist || false, vorlaufzeit_tage || 0, users_id, prio_id, status_id, id]);
        
        if (aufgabenResult.rows.length === 0) {                        // Prüft ob Aufgabe gefunden wurde
            await client.query('ROLLBACK');                           // Transaction rückgängig machen
            return res.status(404).json({ error: 'Aufgabe nicht gefunden' });  // HTTP 404 Not Found wenn keine Zeile betroffen
        }
        
        // SCHRITT 2: Frist-Management (UPSERT-Logic)
        if (hat_frist && frist_datum) {
            // Wenn hat_frist=true, dann Frist setzen/aktualisieren
            await client.query(`
                INSERT INTO Aufgaben_Fristen (aufgaben_id, frist_datum)
                VALUES ($1, $2)
                ON CONFLICT (aufgaben_id) 
                DO UPDATE SET frist_datum = EXCLUDED.frist_datum
            `, [id, frist_datum]);
        } else {
            // Wenn hat_frist=false, dann Frist löschen falls vorhanden
            await client.query(`
                DELETE FROM Aufgaben_Fristen WHERE aufgaben_id = $1
            `, [id]);
        }
        
        await client.query('COMMIT');                                  // Transaction bestätigen
        
        // Vollständige aktualisierte Aufgabe zurückgeben
        const vollstaendigeAufgabe = await pool.query(`
            SELECT 
                a.aufgaben_id,
                a.beschreibung,
                a.hat_frist,
                af.frist_datum,
                a.vorlaufzeit_tage,
                u.users_name,
                p.prio_name,
                s.status_name
            FROM Aufgaben a
            LEFT JOIN Aufgaben_Fristen af ON a.aufgaben_id = af.aufgaben_id
            LEFT JOIN Users u ON a.users_id = u.users_id
            LEFT JOIN Prioritaet p ON a.prio_id = p.prio_id
            LEFT JOIN Status s ON a.status_id = s.status_id
            WHERE a.aufgaben_id = $1
        `, [id]);
        
        res.status(200).json(vollstaendigeAufgabe.rows[0]);            // HTTP 200 OK + die aktualisierte Aufgabe als JSON
    } catch (err) {                                                     // Fängt alle DB-Fehler ab
        await client.query('ROLLBACK');                               // Transaction rückgängig machen bei Fehler
        console.error(err);                                             // Loggt Fehlerdetails in Server-Konsole
        res.status(500).json({ error: 'Datenbankfehler' });             // Sendet HTTP 500 Status mit JSON-Fehlermeldung
    } finally {
        client.release();                                              // Database connection freigeben
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
