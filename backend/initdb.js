const express = require("express");
const pool = require("./db");
const initdb = express.Router();
const format = require("pg-format");

initdb.get("/", async (req, res) => {
  try {
    console.log("Starte Datenbank-Initialisierung...");

    // SCHRITT 1: Alle Tabellen löschen (in richtiger Reihenfolge)
    await pool.query(`
        DROP TABLE IF EXISTS Aufgaben_Fristen CASCADE;
        DROP TABLE IF EXISTS Aufgaben_Tags CASCADE;
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
            hat_frist BOOLEAN NOT NULL DEFAULT false,           -- EXPLICIT: true/false statt NULL für bessere Datenqualität
            vorlaufzeit_tage INTEGER NOT NULL DEFAULT 0,        -- EXPLICIT: Immer numerischer Wert statt NULL
            prio_id INTEGER NOT NULL REFERENCES Prioritaet(prio_id),     -- REQUIRED: Immer Priorität (Default-ID: 1)
            users_id INTEGER NOT NULL REFERENCES Users(users_id),        -- REQUIRED: Immer User zugeordnet (Default-ID: 1)
            status_id INTEGER NOT NULL REFERENCES Status(status_id)      -- REQUIRED: Immer Status (Default-ID: 1)
        );
        
        CREATE TABLE Aufgaben_Fristen (
            aufgaben_id INTEGER PRIMARY KEY REFERENCES Aufgaben(aufgaben_id) ON DELETE CASCADE,
            frist_datum DATE NOT NULL                           -- REQUIRED: Kein NULL möglich - nur Einträge wenn hat_frist=true
        );
        
        CREATE TABLE Aufgaben_Tags (
            aufgaben_id INTEGER NOT NULL REFERENCES Aufgaben(aufgaben_id) ON DELETE CASCADE,
            tag_id INTEGER NOT NULL REFERENCES Tags(tag_id) ON DELETE CASCADE,
            PRIMARY KEY (aufgaben_id, tag_id)
        );
    `);
    console.log("Neue Tabellen erstellt...");

    // SCHRITT 2a: SERIAL-Sequenzen zurücksetzen (vor Dateneinfügung)
    await pool.query(`
        ALTER SEQUENCE users_users_id_seq RESTART WITH 1;
        ALTER SEQUENCE prioritaet_prio_id_seq RESTART WITH 1;
        ALTER SEQUENCE status_status_id_seq RESTART WITH 1;
        ALTER SEQUENCE tags_tag_id_seq RESTART WITH 1;
        ALTER SEQUENCE aufgaben_aufgaben_id_seq RESTART WITH 1;
    `);
    console.log("SERIAL-Sequenzen zurückgesetzt...");

    // SCHRITT 3: Stammdaten einfügen
    await pool.query(`
        INSERT INTO Prioritaet (prio_name) VALUES
        ('Default'), ('Hoch'), ('Mittel'), ('Niedrig');
        
        INSERT INTO Status (status_name) VALUES
        ('Default'), ('Offen'), ('In Bearbeitung'), ('Problem'), 
        ('Beobachten'), ('Abstimmung nötig'), ('Erledigt');
        
        INSERT INTO Tags (tag_name) VALUES
        ('Wohnung'), ('Garten'), ('Atelier'), ('Auto'), ('Moped'),
        ('Familie'), ('Arbeit'), ('Studium'), ('Vertraege'), 
        ('Versicherungen'), ('Kommunikation'), ('Einkauf'), ('Sonstiges');
        
        INSERT INTO Users (users_name) VALUES
        ('Default'), ('MS'), ('RM'), ('KM'), ('MRK'), ('MR'), ('MK'), ('RK');
    `);
    console.log("Stammdaten eingefügt...");

    // SCHRITT 4: Beispielaufgaben einfügen
    const result = await pool.query(`
        INSERT INTO Aufgaben 
        (beschreibung, hat_frist, vorlaufzeit_tage, prio_id, users_id, status_id) VALUES
        ('Kuendigungsfrist Hausratversicherung online', true, 0, 2, 2, 2),
        ('Kuendigungsfrist Haftpflichtversicherung online', true, 0, 2, 2, 2),
        ('Danke-Email an Domaine schicken', true, 0, 3, 2, 3),
        ('Bewertung AirBnB Cottbus schreiben', true, 0, 3, 2, 3),
        ('WhatsApp von Lisa beantworten', false, 0, 3, 6, 2),
        ('Weihnachten planen', true, 20, 2, 5, 5),      -- Status: Beobachten
        ('Anmeldung bei VGBK per Post abschicken', true, 4, 2, 2, 2),
        ('Anruf Papa wegen Besuch', false, 0, 2, 3, 2),
        ('Gluehbirne für Backofen kaufen', false, 0, 3, 6, 4),  -- Status: Problem
        ('Schulhefte besorgen', true, 4, 2, 6, 3),
        ('Spülmittel im Supermarkt kaufen', false, 0, 2, 6, 2),
        ('Einladungen zur Feier von K basteln', true, 0, 2, 5, 6), -- Status: Abstimmung nötig
        ('Widerspruch bei Krankenkasse einlegen online', true, 0, 2, 2, 3),
        ('Anruf bei Hausverwaltung wegen Therme', true, 0, 2, 6, 4), -- Status: Problem
        ('Praktikumsbescheinigung einholen', true, 0, 2, 2, 2),
        ('Rueckmeldung Stundenerhoehung geben an Sabine', false, 0, 2, 2, 6), -- Status: Abstimmung nötig
        ('Ruecklicht Auto reparieren lassen', false, 0, 2, 3, 5), -- Status: Beobachten
        ('Logopaedie anmelden', false, 0, 2, 7, 2),
        ('Tag der offenen Tuer Termine notieren', true, 0, 2, 6, 2),
        ('Rueckmeldung KuBiz beobachten', true, 0, 2, 6, 5), -- Status: Beobachten
        ('Zugtickets buchen fuer Mainz', true, 0, 2, 6, 2)
        RETURNING aufgaben_id;
    `);
    console.log("Beispielaufgaben eingefügt...");

    // SCHRITT 4a: Fristen für Aufgaben mit hat_frist=true einfügen
    await pool.query(`
        INSERT INTO Aufgaben_Fristen (aufgaben_id, frist_datum) VALUES
        (1, '2025-10-01'),   -- Kuendigungsfrist Hausratversicherung
        (2, '2025-10-15'),   -- Kuendigungsfrist Haftpflichtversicherung
        (3, '2025-09-30'),   -- Danke-Email an Domaine
        (4, '2025-09-30'),   -- Bewertung AirBnB Cottbus
        (6, '2025-12-15'),   -- Weihnachten planen
        (7, '2025-10-30'),   -- Anmeldung bei VGBK
        (10, '2025-09-08'),  -- Schulhefte besorgen
        (12, '2025-09-08'),  -- Einladungen zur Feier
        (13, '2025-09-15'),  -- Widerspruch bei Krankenkasse
        (14, '2025-09-08'),  -- Anruf bei Hausverwaltung
        (15, '2025-10-15'),  -- Praktikumsbescheinigung
        (19, '2025-09-15'),  -- Tag der offenen Tuer
        (20, '2025-09-25'),  -- Rueckmeldung KuBiz
        (21, '2025-09-11');  -- Zugtickets buchen
    `);
    console.log("Fristen für Aufgaben eingefügt...");

    // SCHRITT 5: Tags zu Aufgaben zuordnen
    await pool.query(`
        INSERT INTO Aufgaben_Tags (aufgaben_id, tag_id) VALUES
        (1, 10), (1, 1),     -- Hausratversicherung: Versicherungen + Wohnung
        (2, 10), (2, 1),     -- Haftpflichtversicherung: Versicherungen + Wohnung
        (3, 11),             -- Danke-Email: Kommunikation
        (4, 11),             -- Bewertung AirBnB: Kommunikation
        (5, 6),              -- WhatsApp Lisa: Familie
        (6, 6),              -- Weihnachten: Familie
        (7, 7),              -- VGBK Anmeldung: Arbeit
        (8, 6),              -- Anruf Papa: Familie
        (9, 1), (9, 12),     -- Gluehbirne Backofen: Wohnung + Einkauf
        (10, 6), (10, 12),   -- Schulhefte: Familie + Einkauf
        (11, 1), (11, 12),   -- Spülmittel: Wohnung + Einkauf
        (12, 6),             -- Einladungen Feier: Familie
        (13, 10),            -- Widerspruch Krankenkasse: Versicherungen
        (14, 1),             -- Anruf Hausverwaltung: Wohnung
        (15, 8),             -- Praktikumsbescheinigung: Studium
        (16, 7),             -- Stundenerhoehung Sabine: Arbeit
        (17, 4),             -- Ruecklicht Auto: Auto
        (18, 6),             -- Logopaedie: Familie
        (19, 8),             -- Tag der offenen Tuer: Studium
        (20, 8),             -- Rueckmeldung KuBiz: Studium
        (21, 12);            -- Zugtickets: Einkauf
    `);
    console.log("Tag-Zuordnungen erstellt...");

    // Erfolgsmeldung
    res.status(200).json({
      message: "WeekMaster Datenbank erfolgreich initialisiert!",
      created: {
        Users: 8,              // 7 echte + 1 Default
        Prioritaet: 4,         // 3 echte + 1 Default
        Status: 7,             // 6 echte + 1 Default
        Tags: 13,
        Aufgaben: 21,
        Aufgaben_Fristen: 14,  // 14 Aufgaben mit Fristen
        Aufgaben_Tags: 24,
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
