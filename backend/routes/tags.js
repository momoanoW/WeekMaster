/**
 * TAGS.JS - Tags Resource Router
 * - CRUD-Operationen für Tags
 * - Tag-Management und Tag-Zuweisungen
 */

const express = require('express');
const router = express.Router();
const client = require('../db');

// TODO: Tag-Routen werden schrittweise hinzugefügt:
// GET /tags - Alle Tags (für Dropdown-Listen und Übersicht)

// TODO: CRUD-Operationen werden später hinzugefügt:
// POST /tags - Neuen Tag erstellen
// PUT /tags/:id - Tag bearbeiten
// DELETE /tags/:id - Tag löschen
// POST /tags/:tagId/aufgaben/:aufgabenId - Tag zu Aufgabe hinzufügen
// DELETE /tags/:tagId/aufgaben/:aufgabenId - Tag von Aufgabe entfernen

module.exports = router;
