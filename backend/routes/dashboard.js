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

// TODO: Weitere Dashboard-Routen:
// GET /dashboard/charts - Daten für Diagramme und Charts
// GET /dashboard/recent - Kürzlich geänderte/erstellte Aufgaben
// GET /dashboard/priorities - Prioritäten-Verteilung

module.exports = router;
