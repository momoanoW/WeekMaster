
// hiermit definiere ich, wie eine Aufgabenkarte exakt aussieht = interface
//ich hab mich an die Aufgaben-Entität aus der DB gehalten

export interface Task {
  aufgaben_id: number;
  beschreibung: string;
  frist: Date | null;                                    // NULL für offene Aufgaben ohne Deadline
  vorlaufzeit_tage: number;                              // DB-Default: 0
  kontrolliert: boolean;                                 // DB-Default: false (nicht mehr im Frontend gesetzt)
  prio_name: 'Niedrig' | 'Mittel' | 'Hoch' | 'Default'; // Erweitert um Default-Option
  users_name: string;                                    // Inkl. "Default"-User möglich
  status_name: 'Offen' | 'In Bearbeitung' | 'Erledigt' | 'Default'; // Erweitert um Default-Option

}