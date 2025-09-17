/**
 * DASHBOARD.JS - Dashboard Resource Router
 * - Statistische Daten und Übersichten
 * - Aggregierte Informationen für Dashboard-Views
 */

const express = require('express');
const router = express.Router();
const client = require('../db');

// TODO: Dashboard-Routen werden schrittweise hinzugefügt:
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
        res.status(500).json({ error: 'Database error' });             // Sendet HTTP 500 mit Fehlermeldung
    }
});

// TODO: Weitere Dashboard-Routen:
// GET /dashboard/charts - Daten für Diagramme und Charts
// GET /dashboard/recent - Kürzlich geänderte/erstellte Aufgaben
// GET /dashboard/priorities - Prioritäten-Verteilung

module.exports = router;
