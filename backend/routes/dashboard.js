/**
 * DASHBOARD.JS - Dashboard Resource Router
 * - Statistische Daten und Übersichten
 * - Aggregierte Informationen für Dashboard-Views
 */

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /dashboard/stats - Dashboard-Statistiken mit komplexen Aggregationen

// GET /dashboard/stats - Dashboard-Statistiken mit komplexen Aggregationen
router.get('/stats', async (req, res) => {
    try {                                                               // try-catch für Fehlerbehandlung
        // SQL-Query: Dashboard-Statistiken mit komplexen Aggregationen
        // - COUNT mit CASE zählt Aufgaben nach Status
        // - Überfällige Aufgaben: frist < CURRENT_DATE
        // - Diese Woche fällig: BETWEEN CURRENT_DATE AND +7 days
        // - Erledigungsquote in Prozent mit ROUND
        // - NULLIF verhindert Division durch 0
        const result = await pool.query(`
            SELECT 
                COUNT(*) as aufgaben_gesamt,
                COUNT(CASE WHEN s.status_name = 'Erledigt' THEN 1 END) as aufgaben_erledigt,
                COUNT(CASE WHEN s.status_name = 'In Bearbeitung' THEN 1 END) as aufgaben_in_bearbeitung,
                COUNT(CASE WHEN s.status_name = 'Offen' THEN 1 END) as aufgaben_offen,
                COUNT(CASE WHEN af.frist_datum < CURRENT_DATE AND s.status_name != 'Erledigt' THEN 1 END) as aufgaben_ueberfaellig,
                COUNT(CASE WHEN af.frist_datum BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' AND s.status_name != 'Erledigt' THEN 1 END) as aufgaben_diese_woche,
                ROUND(
                    COUNT(CASE WHEN s.status_name = 'Erledigt' THEN 1 END)::DECIMAL / 
                    NULLIF(COUNT(*), 0) * 100, 2
                ) as erledigungsquote_prozent
            FROM Aufgaben a
            LEFT JOIN Aufgaben_Fristen af ON a.aufgaben_id = af.aufgaben_id
            LEFT JOIN Status s ON a.status_id = s.status_id
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
        // SQL-Query: Kürzlich geänderte/erstellte Aufgaben für Activity Timeline
        // - LEFT JOINs für vollständige Daten auch ohne Verknüpfungen (inkl. Fristen)
        // - ORDER BY aufgaben_id DESC: Neueste zuerst (höhere ID = später erstellt)
        // - LIMIT 10 für Performance und übersichtliche Darstellung
        const result = await pool.query(`
            SELECT 
                a.aufgaben_id,
                a.beschreibung,
                a.hat_frist,
                af.frist_datum,
                u.users_name,
                s.status_name,
                p.prio_name
            FROM Aufgaben a
            LEFT JOIN Aufgaben_Fristen af ON a.aufgaben_id = af.aufgaben_id
            LEFT JOIN Users u ON a.users_id = u.users_id
            LEFT JOIN Status s ON a.status_id = s.status_id
            LEFT JOIN Prioritaet p ON a.prio_id = p.prio_id
            ORDER BY a.aufgaben_id DESC
            LIMIT 10
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
        // SQL-Query: Prioritäten-Verteilung für Charts und Statistiken
        // - COUNT zählt Aufgaben pro Priorität
        // - COUNT mit CASE zählt nur erledigte Aufgaben
        // - ROUND berechnet Prozent der erledigten pro Priorität
        // - LEFT JOIN zeigt auch Prioritäten ohne Aufgaben
        // - GROUP BY für Aggregation nach Priorität
        const result = await pool.query(`
            SELECT 
                p.prio_name,
                p.prio_id,
                COUNT(a.aufgaben_id) as aufgaben_anzahl,
                COUNT(CASE WHEN s.status_name = 'Erledigt' THEN 1 END) as erledigt_anzahl,
                ROUND(
                    COUNT(CASE WHEN s.status_name = 'Erledigt' THEN 1 END)::DECIMAL / 
                    NULLIF(COUNT(a.aufgaben_id), 0) * 100, 1
                ) as erledigt_prozent
            FROM Prioritaet p
            LEFT JOIN Aufgaben a ON p.prio_id = a.prio_id
            LEFT JOIN Status s ON a.status_id = s.status_id
            GROUP BY p.prio_id, p.prio_name
            ORDER BY p.prio_id
        `);
        
        res.json(result.rows);                                          // Prioritäten-Verteilung als JSON
    } catch (err) {                                                     // Fängt DB-Fehler ab
        console.error(err);                                             // Loggt Fehler in Server-Konsole
        res.status(500).json({ error: 'Datenbankfehler' });             // Sendet HTTP 500 mit Fehlermeldung
    }
});

module.exports = router;
