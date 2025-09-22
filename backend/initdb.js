const express = require("express");
const pool = require("./db");
const initdb = express.Router();
const format = require("pg-format");

initdb.get("/", async (req, res) => {
  try {
    console.log("Starte Datenbank-Initialisierung...");

    // SCHRITT 1: Alle Tabellen löschen (in richtiger Reihenfolge)
    await pool.query(`
        DROP TABLE IF EXISTS aufgaben_tags CASCADE;
        DROP TABLE IF EXISTS Aufgaben CASCADE;
        DROP TABLE IF EXISTS Tags CASCADE;
        DROP TABLE IF EXISTS Prioritaet CASCADE;
        DROP TABLE IF EXISTS Status CASCADE;
        DROP TABLE IF EXISTS Users CASCADE;
    `);
    console.log("Alte Tabellen gelöscht...");

    // SCHRITT 2: Tabellen neu erstellen
    await pool.query(`
        CREATE TABLE Users (
            users_id SERIAL PRIMARY KEY,
            users_name VARCHAR(50) NOT NULL
        );
        
        CREATE TABLE Prioritaet (
            prio_id SERIAL PRIMARY KEY,
            prio_name VARCHAR(20) NOT NULL
        );
        
        CREATE TABLE Status (
            status_id SERIAL PRIMARY KEY,
            status_name VARCHAR(20) NOT NULL
        );
        
        CREATE TABLE Tags (
            tag_id SERIAL PRIMARY KEY,
            tag_name VARCHAR(50) NOT NULL
        );
        
        CREATE TABLE Aufgaben (
            aufgaben_id SERIAL PRIMARY KEY,
            beschreibung TEXT NOT NULL,                         -- REQUIRED: Jede Aufgabe braucht Beschreibung
            frist DATE,                                          -- OPTIONAL: NULL für offene Aufgaben ohne Deadline
            vorlaufzeit_tage INTEGER DEFAULT 0,                 -- OPTIONAL: DB-Default 0 (keine Vorlaufzeit)
            kontrolliert BOOLEAN DEFAULT false,                 -- OPTIONAL: DB-Default false (neue Aufgaben ungeprüft)
            prio_id INTEGER NOT NULL REFERENCES Prioritaet(prio_id),     -- REQUIRED: Immer Priorität (Default-ID: 4)
            users_id INTEGER NOT NULL REFERENCES Users(users_id),        -- REQUIRED: Immer User zugeordnet (Default-ID: 8)
            status_id INTEGER NOT NULL REFERENCES Status(status_id)      -- REQUIRED: Immer Status (Default-ID: 4)
        );
        
        CREATE TABLE aufgaben_tags (
            aufgaben_id INTEGER REFERENCES Aufgaben(aufgaben_id) ON DELETE CASCADE,
            tag_id INTEGER REFERENCES Tags(tag_id) ON DELETE CASCADE,
            PRIMARY KEY (aufgaben_id, tag_id)
        );
    `);
    console.log("Neue Tabellen erstellt...");

    // SCHRITT 3: Stammdaten einfügen
    await pool.query(`
        INSERT INTO Prioritaet (prio_name) VALUES
        ('Hoch'), ('Mittel'), ('Niedrig'), ('Default');
        
        INSERT INTO Status (status_name) VALUES
        ('Offen'), ('In Bearbeitung'), ('Erledigt'), ('Default');
        
        INSERT INTO Tags (tag_name) VALUES
        ('Wohnung'), ('Garten'), ('Atelier'), ('Auto'), ('Moped'),
        ('Familie'), ('Arbeit'), ('Studium'), ('Vertraege'), 
        ('Versicherungen'), ('Kommunikation'), ('Einkauf'), ('Sonstiges');
        
        INSERT INTO Users (users_name) VALUES
        ('MS'), ('RM'), ('KM'), ('MRK'), ('MR'), ('MK'), ('RK'), ('Default');
    `);
    console.log("Stammdaten eingefügt...");

    // SCHRITT 4: Beispielaufgaben einfügen
    const result = await pool.query(`
        INSERT INTO Aufgaben 
        (beschreibung, frist, vorlaufzeit_tage, kontrolliert, prio_id, users_id, status_id) VALUES
        ('Kuendigungsfrist Hausratversicherung online', '2025-10-01', 0, false, 2, 1, 1),
        ('Kuendigungsfrist Haftpflichtversicherung online', '2025-10-15', 0, false, 2, 1, 1),
        ('Danke-Email an Domaine schicken', '2025-09-30', 0, false, 3, 1, 2),
        ('Bewertung AirBnB Cottbus schreiben', '2025-09-30', 0, false, 3, 1, 2),
        ('WhatsApp von Lisa beantworten', NULL, 0, false, 3, 5, 1),
        ('Weihnachten planen', '2025-12-15', 20, false, 2, 4, 1),
        ('Anmeldung bei VGBK per Post abschicken', '2025-10-30', 4, false, 1, 1, 1),
        ('Anruf Papa wegen Besuch', NULL, 0, false, 2, 2, 1),
        ('Gluehbirne für Backofen kaufen', NULL, 0, false, 3, 5, 1),
        ('Schulhefte besorgen', '2025-09-08', 4, false, 1, 5, 2),
        ('Spülmittel im Supermarkt kaufen', NULL, 0, false, 1, 5, 1),
        ('Einladungen zur Feier von K basteln', '2025-09-08', 0, false, 1, 4, 1),
        ('Widerspruch bei Krankenkasse einlegen online', '2025-09-15', 0, false, 1, 1, 2),
        ('Anruf bei Hausverwaltung wegen Therme', '2025-09-08', 0, false, 1, 5, 2),
        ('Praktikumsbescheinigung einholen', '2025-10-15', 0, false, 2, 1, 1),
        ('Rueckmeldung Stundenerhoehung geben an Sabine', NULL, 0, false, 2, 1, 1),
        ('Ruecklicht Auto reparieren lassen', NULL, 0, false, 2, 2, 1),
        ('Logopaedie anmelden', NULL, 0, false, 2, 6, 1),
        ('Tag der offenen Tuer Termine notieren', '2025-09-15', 0, false, 2, 5, 1),
        ('Rueckmeldung KuBiz beobachten', '2025-09-25', 0, false, 2, 5, 1),
        ('Zugtickets buchen fuer Mainz', '2025-09-11', 0, false, 2, 5, 1)
        RETURNING aufgaben_id;
    `);
    console.log("Beispielaufgaben eingefügt...");

    // SCHRITT 5: Tags zu Aufgaben zuordnen
    await pool.query(`
        INSERT INTO aufgaben_tags (aufgaben_id, tag_id) VALUES
        (1, 10), (1, 1),
        (2, 10), (2, 1),
        (3, 13),
        (4, 13),
        (5, 6),
        (6, 6),
        (7, 7),
        (8, 6),
        (9, 1),
        (10, 6);
    `);
    console.log("Tag-Zuordnungen erstellt...");

    // Erfolgsmeldung
    res.status(200).json({
      message: "WeekMaster Datenbank erfolgreich initialisiert!",
      created: {
        users: 8,        // 7 echte + 1 Default
        priorities: 4,   // 3 echte + 1 Default
        statuses: 4,     // 3 echte + 1 Default
        tags: 13,
        aufgaben: 21,
        tag_assignments: 10,
      },
    });
  } catch (err) {
    console.error("Fehler bei DB-Initialisierung:", err);
    res.status(500).json({
      error: "Fehler bei der Datenbank-Initialisierung",
      details: err.message,
    });
  }
});

module.exports = initdb;

// ANLEITUNG FÜR STUDIS:
// 1. Starte den Server: npm run dev
// 2. Gehe im Browser zu: http://localhost:3000/init
// 3. Fertig! Die DB ist jetzt initialisiert.
// 4. Du kannst jetzt zu http://localhost:3000/users gehen, um die Users zu sehen.
// 5. Du kannst auch Änderungen vornehmen an den Datensätzen.
// 6. Wenn du die DB neu initialisieren willst, einfach wieder zu /init gehen.
//    ACHTUNG: Alle alten Daten gehen dabei verloren!
