/**
 * INDEX.JS - Haupt-Router
 * - Verknüpft alle Resource-Router
 * - Zentrale Stelle für Route-Organisation
 * - Importiert und registriert alle Endpunkte
 */

const express = require('express');
const router = express.Router();

// Importiert alle Resource-Router
const tasksRoutes = require('./tasks');
const tagsRoutes = require('./tags');
const usersRoutes = require('./users');
const dashboardRoutes = require('./dashboard');
const prioritiesRoutes = require('./priorities');
const statusRoutes = require('./status');

// Root-Route für API-Test
router.get('/', async (req, res) => {
    res.send({ message: "Hello FIW! WeekMaster API läuft." });
});

// Registriert alle Resource-Router mit ihren Pfaden
router.use('/tasks', tasksRoutes);          // Alle Aufgaben-CRUD unter /tasks/*
router.use('/tags', tagsRoutes);            // Alle Tag-CRUD unter /tags/*
router.use('/users', usersRoutes);          // Alle User-CRUD unter /users/*
router.use('/dashboard', dashboardRoutes);  // Dashboard/Stats unter /dashboard/*
router.use('/priorities', prioritiesRoutes); // Prioritäten unter /priorities/*
router.use('/status', statusRoutes);        // Status unter /status/*

module.exports = router;
