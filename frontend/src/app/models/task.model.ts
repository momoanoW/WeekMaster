
// hiermit definiere ich, wie eine Aufgabenkarte exakt aussieht = interface
//ich hab mich an die Aufgaben-Entität aus der DB gehalten

export interface Task {
  aufgaben_id: number;
  beschreibung: string;
  frist: Date;
  vorlaufzeit_tage: number;
  kontrolliert: boolean;
  prio_name: 'Niedrig' | 'Mittel' | 'Hoch';
  users_name: string;
  status_name: 'Offen' | 'In Bearbeitung' | 'Erledigt';

}