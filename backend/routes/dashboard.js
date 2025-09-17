/**
 * DASHBOARD.JS - Dashboard Resource Router
 * - Statistische Daten und Übersichten
 * - Aggregierte Informationen für Dashboard-Views
 */

const express = require('express');
const router = express.Router();
const client = require('../db');

// GET /dashboard/stats - Dashboard-Statistiken mit komplexen Aggregationen

// GET /dashboard/stats - Dashboard-Statistiken mit komplexen Aggregationen
router.get('/stats', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        const result = await client.query(`                            // await wartet auf DB-Antwort, client.query() führt SQL aus
            SELECT 
                COUNT(*) as aufgaben_gesamt,                            -- Gesamtzahl aller Aufgaben
                COUNT(CASE WHEN s.status_name = 'Erledigt' THEN 1 END) as aufgaben_erledigt,  -- Nur erledigte Aufgaben zählen
                COUNT(CASE WHEN s.status_name = 'In Bearbeitung' THEN 1 END) as aufgaben_in_bearbeitung,  -- In Bearbeitung
                COUNT(CASE WHEN s.status_name = 'Offen' THEN 1 END) as aufgaben_offen,  -- Offene Aufgaben
                COUNT(CASE WHEN a.frist < CURRENT_DATE AND s.status_name != 'Erledigt' THEN 1 END) as aufgaben_ueberfaellig,  -- Überfällige Aufgaben
                COUNT(CASE WHEN a.frist BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' AND s.status_name != 'Erledigt' THEN 1 END) as aufgaben_diese_woche,  -- Diese Woche fällig
                ROUND(                                                  -- Rundet auf 2 Nachkommastellen
                    COUNT(CASE WHEN s.status_name = 'Erledigt' THEN 1 END)::DECIMAL / 
                    NULLIF(COUNT(*), 0) * 100, 2                       -- NULLIF verhindert Division durch 0
                ) as erledigungsquote_prozent                          -- Prozentuale Erledigungsquote
            FROM Aufgaben a                                             -- Haupttabelle
            LEFT JOIN Status s ON a.status_id = s.status_id            -- LEFT JOIN: auch Aufgaben ohne Status
        `);
        
        const stats = result.rows[0];                                   // Erste (und einzige) Zeile mit allen Statistiken
        
        // Zusätzliche berechnete Werte hinzufügen
        stats.aufgaben_nicht_erledigt = parseInt(stats.aufgaben_gesamt) - parseInt(stats.aufgaben_erledigt);  // Nicht erledigte Aufgaben
        
        res.json(stats);                                                // Alle Dashboard-Statistiken als JSON
    } catch (err) {                                                     // Fängt DB-Fehler ab
        console.error(err);                                             // Loggt Fehler in Server-Konsole
        res.status(500).json({ error: 'Datenbankfehler' });             // Sendet HTTP 500 mit Fehlermeldung
    }
});


//Ich schaue noch, ob ich das im Frontend umgesetzt bekomme
// GET /dashboard/recent - Kürzlich geänderte/erstellte Aufgaben für Activity Timeline
router.get('/recent', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        const result = await client.query(`                            // await wartet auf DB-Antwort, client.query() führt SQL aus
            SELECT 
                a.aufgaben_id,
                a.beschreibung,
                a.frist,
                u.users_name,
                s.status_name,
                p.prio_name
            FROM Aufgaben a                                             -- Haupttabelle
            LEFT JOIN Users u ON a.users_id = u.users_id               -- LEFT JOIN: auch ohne User
            LEFT JOIN Status s ON a.status_id = s.status_id            -- LEFT JOIN: auch ohne Status
            LEFT JOIN Prioritaet p ON a.prio_id = p.prio_id            -- LEFT JOIN: auch ohne Priorität
            ORDER BY a.aufgaben_id DESC                                 -- Neueste zuerst (höhere ID = später erstellt)
            LIMIT 10                                                    -- Nur die letzten 10 für Performance
        `);
        
        res.json(result.rows);                                          // Recent Activities als JSON
    } catch (err) {                                                     // Fängt DB-Fehler ab
        console.error(err);                                             // Loggt Fehler in Server-Konsole
        res.status(500).json({ error: 'Datenbankfehler' });             // Sendet HTTP 500 mit Fehlermeldung
    }
});

// GET /dashboard/priorities - Prioritäten-Verteilung für Charts
router.get('/priorities', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        const result = await client.query(`                            // await wartet auf DB-Antwort, client.query() führt SQL aus
            SELECT 
                p.prio_name,
                p.prio_id,
                COUNT(a.aufgaben_id) as aufgaben_anzahl,                -- Wie viele Aufgaben pro Priorität
                COUNT(CASE WHEN s.status_name = 'Erledigt' THEN 1 END) as erledigt_anzahl,  -- Erledigte pro Priorität
                ROUND(                                                  -- Prozent der erledigten pro Priorität
                    COUNT(CASE WHEN s.status_name = 'Erledigt' THEN 1 END)::DECIMAL / 
                    NULLIF(COUNT(a.aufgaben_id), 0) * 100, 1
                ) as erledigt_prozent
            FROM Prioritaet p                                           -- Haupttabelle: alle Prioritäten
            LEFT JOIN Aufgaben a ON p.prio_id = a.prio_id              -- LEFT JOIN: auch Prioritäten ohne Aufgaben
            LEFT JOIN Status s ON a.status_id = s.status_id            -- LEFT JOIN: für Status-Filter
            GROUP BY p.prio_id, p.prio_name                            -- Gruppierung nach Priorität
            ORDER BY p.prio_id                                         -- Sortierung nach Prioritäts-ID (meist: Hoch → Niedrig)
        `);
        
        res.json(result.rows);                                          // Prioritäten-Verteilung als JSON
    } catch (err) {                                                     // Fängt DB-Fehler ab
        console.error(err);                                             // Loggt Fehler in Server-Konsole
        res.status(500).json({ error: 'Datenbankfehler' });             // Sendet HTTP 500 mit Fehlermeldung
    }
});

module.exports = router;
