-- ========================================
-- WeekMaster - Datenbankstruktur
-- HTW Berlin - Webtech Sommersemester 2025
-- ========================================

-- ========================================
-- TABELLEN ERSTELLEN
-- ========================================

-- Users Tabelle - Personen, die Aufgaben zugeordnet bekommen
CREATE TABLE Users (
    users_id SERIAL PRIMARY KEY,                   -- Auto-Increment ID (1,2,3...)
    users_name VARCHAR(100) NOT NULL UNIQUE        -- Eindeutige Benutzernamen (keine Duplikate)
);

-- Prioritaet Tabelle - Wichtigkeit von Aufgaben
CREATE TABLE Prioritaet (
    prio_id SERIAL PRIMARY KEY,                    -- Auto-Increment ID
    prio_name VARCHAR(50) NOT NULL UNIQUE          -- Eindeutige Prioritätsnamen
);

-- Status Tabelle - Bearbeitungsstand von Aufgaben
CREATE TABLE Status (
    status_id SERIAL PRIMARY KEY,                  -- Auto-Increment ID
    status_name VARCHAR(50) NOT NULL UNIQUE        -- Eindeutige Status-Namen
);

-- Tags Tabelle - Kategorisierung von Aufgaben (Many-to-Many)
CREATE TABLE Tags (
    tag_id SERIAL PRIMARY KEY,                     -- Auto-Increment ID  
    tag_name VARCHAR(100) NOT NULL UNIQUE          -- Eindeutige Tag-Namen (z.B. "Studium", "Arbeit")
);

-- Aufgaben Tabelle (Haupttabelle) - Zentrale Aufgabenverwaltung
CREATE TABLE Aufgaben (
    aufgaben_id SERIAL PRIMARY KEY,               -- Auto-Increment ID
    beschreibung TEXT NOT NULL,                   -- Aufgabenbeschreibung (Pflichtfeld)
    frist DATE,                                   -- Deadline (optional) - NULL für offene Aufgaben
    vorlaufzeit_tage INTEGER DEFAULT 0,          -- Tage vor Frist für Erinnerung (DB-Default: 0)
    kontrolliert BOOLEAN DEFAULT FALSE,          -- Wurde die Aufgabe kontrolliert? (DB-Default: false)
    users_id INTEGER NOT NULL,                   -- Zugewiesene Person (Pflichtfeld, Default-User ID 8)
    prio_id INTEGER NOT NULL,                    -- Priorität (Pflichtfeld, Default-Priorität ID 4)
    status_id INTEGER NOT NULL,                  -- Bearbeitungsstand (Pflichtfeld, Default-Status ID 4)
    
    -- Foreign Key Constraints (Fremdschlüssel-Beziehungen)
    CONSTRAINT fk_aufgaben_users FOREIGN KEY (users_id) REFERENCES Users(users_id),      -- Verweist auf Users Tabelle
    CONSTRAINT fk_aufgaben_prio FOREIGN KEY (prio_id) REFERENCES Prioritaet(prio_id),    -- Verweist auf Prioritaet Tabelle
    CONSTRAINT fk_aufgaben_status FOREIGN KEY (status_id) REFERENCES Status(status_id)   -- Verweist auf Status Tabelle
);

-- Junction Table für Many-to-Many Beziehung zwischen Aufgaben und Tags
CREATE TABLE aufgaben_tags (
    aufgaben_id INTEGER NOT NULL,                 -- Verweis auf Aufgabe
    tag_id INTEGER NOT NULL,                      -- Verweis auf Tag
    PRIMARY KEY (aufgaben_id, tag_id),            -- Zusammengesetzter Primärschlüssel (verhindert Duplikate)
    
    -- Fremdschlüssel mit CASCADE DELETE (Löschen der Aufgabe/Tag löscht auch die Verknüpfung)
    CONSTRAINT fk_aufgaben_tags_aufgaben FOREIGN KEY (aufgaben_id) REFERENCES Aufgaben(aufgaben_id) ON DELETE CASCADE,
    CONSTRAINT fk_aufgaben_tags_tags FOREIGN KEY (tag_id) REFERENCES Tags(tag_id) ON DELETE CASCADE
);

-- ========================================
-- STAMMDATEN EINFÜGEN
-- ========================================

-- Prioritäten einfügen
INSERT INTO Prioritaet (prio_name) VALUES
('Hoch'),
('Mittel'),
('Niedrig'),
('Default');

-- Status einfügen
INSERT INTO Status (status_name) VALUES
('Offen'),
('In Bearbeitung'),
('Erledigt'),
('Default');

-- Tags einfügen (Kategorien für bessere Organisation)
INSERT INTO Tags (tag_name) VALUES
('Wohnung'),
('Garten'),
('Atelier'),
('Auto'),
('Moped'),
('Familie'),
('Arbeit'),
('Studium'),
('Vertraege'),
('Versicherungen'),
('Kommunikation'),
('Einkauf'),
('Sonstiges');

-- Nutzer einfügen (Initialen für Datenschutz)
INSERT INTO Users (users_name) VALUES
('MS'),
('RM'),
('KM'),
('MRK'),
('MR'),
('MK'),
('RK'),
('Default');

-- ========================================
-- BEISPIELDATEN
-- ========================================

-- Beispielaufgaben für verschiedene Lebensbereiche
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
('Zugtickets buchen fuer Mainz', '2025-09-11', 0, false, 2, 5, 1);

-- Tags zu Aufgaben zuordnen (Beispiele)
INSERT INTO aufgaben_tags (aufgaben_id, tag_id) VALUES
-- Versicherungen
(1, 10), (1, 1),  -- Hausrat: Versicherungen + Wohnung
(2, 10), (2, 1),  -- Haftpflicht: Versicherungen + Wohnung
-- Kommunikation  
(3, 11),          -- Danke-Email: Kommunikation
(4, 11),          -- AirBnB Bewertung: Kommunikation
(5, 6), (5, 11),  -- WhatsApp: Familie + Kommunikation
-- Familie
(6, 6),           -- Weihnachten: Familie
(8, 6), (8, 11),  -- Papa anrufen: Familie + Kommunikation
(10, 6),          -- Schulhefte: Familie
-- Arbeit/Studium
(7, 7),           -- VGBK: Arbeit
(15, 7),          -- Praktikum: Arbeit
(19, 8),          -- Tag der offenen Tür: Studium
-- Wohnung/Haushalt
(9, 1),           -- Glühbirne: Wohnung
(11, 1), (11, 12), -- Spülmittel: Wohnung + Einkauf
(14, 1);          -- Hausverwaltung: Wohnung

-- ========================================
-- DATENMODELL-KONZEPTE
-- ========================================

-- 1. VORLAUFZEIT-LOGIK:
-- vorlaufzeit_tage = Anzahl Tage vor der Frist für Erinnerungen
-- Beispiel: Geburtstag am 20.09, Vorlauf 5 Tage = Erinnerung ab 15.09
-- Berechnung: erinnerungs_datum = frist - vorlaufzeit_tage

-- 2. MANY-TO-MANY TAGS:
-- Eine Aufgabe kann mehrere Tags haben (z.B. Familie + Kommunikation)
-- Ein Tag kann mehreren Aufgaben zugeordnet sein

-- 3. STATUS-WORKFLOW:
-- Offen → In Bearbeitung → Erledigt

-- ========================================
-- NÜTZLICHE QUERIES FÜR FRONTEND
-- ========================================

/*
-- Alle Aufgaben mit Details (für Hauptansicht)
SELECT 
    a.aufgaben_id,
    a.beschreibung,
    a.frist,
    a.vorlaufzeit_tage,
    a.kontrolliert,
    u.users_name,
    p.prio_name,
    s.status_name,
    STRING_AGG(t.tag_name, ', ' ORDER BY t.tag_name) as tags
FROM Aufgaben a
LEFT JOIN Users u ON a.users_id = u.users_id
LEFT JOIN Prioritaet p ON a.prio_id = p.prio_id  
LEFT JOIN Status s ON a.status_id = s.status_id
LEFT JOIN aufgaben_tags at ON a.aufgaben_id = at.aufgaben_id
LEFT JOIN Tags t ON at.tag_id = t.tag_id
GROUP BY 
    a.aufgaben_id, a.beschreibung, a.frist, a.vorlaufzeit_tage, a.kontrolliert,
    u.users_name, p.prio_name, s.status_name
ORDER BY a.frist ASC NULLS LAST;

-- Aufgaben nach Priorität gruppiert
SELECT 
    p.prio_name,
    COUNT(*) as anzahl_aufgaben
FROM Aufgaben a
JOIN Prioritaet p ON a.prio_id = p.prio_id
GROUP BY p.prio_name
ORDER BY p.prio_id;

-- Aufgaben mit bald ablaufender Frist (nächste 7 Tage)
SELECT 
    a.beschreibung,
    a.frist,
    u.users_name,
    p.prio_name
FROM Aufgaben a
JOIN Users u ON a.users_id = u.users_id
JOIN Prioritaet p ON a.prio_id = p.prio_id
WHERE a.frist BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
AND a.status_id != 3  -- Nicht erledigt
ORDER BY a.frist;
*/

-- ========================================
-- RESET-BEFEHLE (für Entwicklung)
-- ========================================

/*
-- Alle Daten löschen (in richtiger Reihenfolge)
DELETE FROM aufgaben_tags;
DELETE FROM Aufgaben;
DELETE FROM Tags;
DELETE FROM Prioritaet;
DELETE FROM Status;
DELETE FROM Users;

-- Auto-Increment Sequenzen zurücksetzen
SELECT setval('public.prioritaet_prio_id_seq', 1, false);
SELECT setval('public.users_users_id_seq', 1, false);
SELECT setval('public.status_status_id_seq', 1, false);
SELECT setval('public.tags_tag_id_seq', 1, false);
SELECT setval('public.aufgaben_aufgaben_id_seq', 1, false);
*/
