/**
 * AUFGABEN.JS - Aufgaben Resource Router
 * - Alle CRUD-Operationen für Aufgaben
 * - GET (Read), POST (Create), PUT (Update), DELETE (Delete)
 * - Komplexe Queries mit JOINs für vollständige Aufgaben-Details
 */

const express = require('express');
const router = express.Router();
const client = require('../db');

// TODO: Aufgaben-Routen werden schrittweise hinzugefügt:
// GET /aufgaben - Alle Aufgaben mit vollständigen Details
// GET /aufgaben/urgent - Dringende Aufgaben (nächste 7 Tage)  
// GET /aufgaben/user/:userId - Aufgaben nach Benutzer mit Statistiken
// GET /aufgaben/tag/:tagId - Aufgaben nach Tag

// TODO: CRUD-Operationen werden später hinzugefügt:
// POST /aufgaben - Neue Aufgabe erstellen
// PUT /aufgaben/:id - Aufgabe bearbeiten  
// PATCH /aufgaben/:id/status - Status ändern
// DELETE /aufgaben/:id - Aufgabe löschen

module.exports = router;
