
// hiermit definiere ich, wie eine Aufgabenkarte aussieht

export interface Task {
  id: number;
  title: string;
  status: 'Offen' | 'In Bearbeitung' | 'Erledigt';
  priority: 'Niedrig' | 'Mittel' | 'Hoch';
}