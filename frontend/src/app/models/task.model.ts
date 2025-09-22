
// hiermit definiere ich, wie eine Aufgabenkarte exakt aussieht = interface
//ich hab mich an die Aufgaben-Entität aus der DB gehalten

export interface Task {
  aufgaben_id: number;
  beschreibung: string;
  frist: Date;
  vorlaufzeit_tage: number;
  kontrolliert: boolean;
  prioritaet: 'Niedrig' | 'Mittel' | 'Hoch';
  user: string;
  status: 'Offen' | 'In Bearbeitung' | 'Erledigt';

}