//Service ist eine Klasse für spezif. Aufgaben, z.B. hier Abrufen von Daten aus DB und Bereitstellen für andere components über das Task Interface
// = Zusammenspiel von Backend und Bauplan-model


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from '../models/task.model';
import { Observable, of } from 'rxjs'; //für asynchrone Datenströme, z.B. HTTP-Antworten

@Injectable({ //kennzeichnet diese Klasse als Service, damit ganze App darauf zugreifen kann
  providedIn: 'root' //erstellt eine einzige Instanzdieses Services, die in der ganzen App verwendet wird (Singleton Pattern)
})


export class TaskService { //Service-Klasse (importierbar wegen "export")

  private apiUrl = 'http://localhost:3000/api/tasks'; // Backend-Endpunkt für Tasks. Andere Klassen können nicht URL ändern (wegen private)
  private usersUrl = 'http://localhost:3000/api/users'; // Backend-Endpunkt für Users
  
  // Cache für geladene User-Daten (um nicht bei jeder Aufgabe neu zu laden)
  private users: any[] = [];

  // HttpClient-Werkzeug per Dependency Injection geben lassen
  constructor(private http: HttpClient) { 
    // Beim Start des Services die User-Daten laden
    this.loadUsers();
  }

  // NEUE METHODE: Lade alle User aus der Datenbank
  private loadUsers(): void {
    this.http.get<any[]>(this.usersUrl).subscribe({
      next: (users) => {
        this.users = users;
        console.log('Users geladen:', this.users);
      },
      error: (error) => {
        console.error('Fehler beim Laden der Users:', error);
        this.users = [];
      }
    });
  }

  // METHODE: Öffentliche Methode um Users für Dropdown zu bekommen (aus Cache)
  getUsers(): Observable<any[]> {
    // Nutze of() um gecachte User als Observable zurückzugeben
    return of(this.users);
  }

  // READ AUFGABEN zum Abrufen der Aufgaben von der API - gibt Observable zurück (asynchroner Datenstrom)
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl); // Holt Array von Tasks vom Backend und gibt als Observable zurück
    // Observable = "Ich verspreche, dass hier später Task-Daten ankommen werden" (weil HTTP-Anfragen Zeit brauchen)
    // (wegen "providedIn: 'root'" bleibt es ein einziger Service im gesamten Projekt)
  }

  // NEUE AUFGABE HINZUFÜGEN
  createTask(neueAufgabe: Task): Observable<Task> {
   const datenFuerBackend = {   // Backend erwartet IDs, aber Formular liefert Namen -> manche übersetzen
    beschreibung: neueAufgabe.beschreibung,  // REQUIRED in DB
    frist: neueAufgabe.frist,                // OPTIONAL (kann NULL sein)
    vorlaufzeit_tage: neueAufgabe.vorlaufzeit_tage,  // OPTIONAL (DEFAULT 0)
    kontrolliert: neueAufgabe.kontrolliert,  // OPTIONAL (DEFAULT false)
   
    // Ab hier brauchts Übersetzungsmethoden - alle REQUIRED in DB
    users_id: this.mapUserToId(neueAufgabe.users_name),    // REQUIRED
    status_id: this.mapStatusToId('Offen'),                // REQUIRED - neue Aufgaben sind immer "Offen"
    prio_id: this.mapPriorityToId(neueAufgabe.prio_name)   // REQUIRED
  };
  return this.http.post<Task>(this.apiUrl, datenFuerBackend);
}

// Kleine private Hilfsmethode für Übersetzung Prio
private mapPriorityToId(prioName: 'Niedrig' | 'Mittel' | 'Hoch'): number {
  if (prioName === 'Hoch') return 1;
  if (prioName === 'Mittel') return 2;
  return 3; // Niedrig
}

// DYNAMISCHE Hilfsmethode für Übersetzung User (nutzt geladene Daten)
private mapUserToId(userName: string): number {
  const user = this.users.find(u => u.users_name === userName);
  if (user) {
    return user.users_id;
  }
  // Kein Fallback - wenn User nicht gefunden wird, dann stimmt etwas nicht
  console.error('User nicht gefunden:', userName, 'Verfügbare User:', this.users);
  return 0; // Ungültige ID - wird Backend-Fehler verursachen (was gut ist!)
}

// Kleine private Hilfsmethode für Übersetzung Status
private mapStatusToId(statusName: 'Offen' | 'In Bearbeitung' | 'Erledigt'): number {
  if (statusName === 'Offen') return 1;
  if (statusName === 'In Bearbeitung') return 2;
  return 3; // Erledigt
}

}
