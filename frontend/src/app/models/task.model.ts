
// hiermit definiere ich, wie eine Aufgabenkarte exakt aussieht = interface
//ich hab mich an die Aufgaben-Entität aus der DB gehalten

export interface Task {
  aufgaben_id: number;
  beschreibung: string;
  hat_frist: boolean;                                    // EXPLICIT: true/false statt NULL für bessere Datenqualität
  frist_datum: Date | null;                              // Nur gefüllt wenn hat_frist=true
  vorlaufzeit_tage: number;                              // DB-Default: 0
  prio_name: 'Niedrig' | 'Mittel' | 'Hoch' | 'Default'; // Erweitert um Default-Option
  users_name: string;                                    // Inkl. "Default"-User möglich
  status_name: 'Offen' | 'In Bearbeitung' | 'Erledigt' | 'Problem' | 'Beobachten' | 'Abstimmung nötig' | 'Default'; // Erweitert um neue Status
  tags?: string;                                         // Optional: Tag-Namen als String
}