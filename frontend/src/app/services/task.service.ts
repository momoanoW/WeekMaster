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

  // READ Users für Dropdown zu bekommen (aus Cache)
  getUsers(): Observable<any[]> {
    // Nutze of() um alle User als Observable zurückzugeben
    return of(this.users);
  }

  // READ AUFGABEN zum Abrufen der Aufgaben von der API - gibt Observable zurück (asynchroner Datenstrom)
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl); // Holt Array von Tasks vom Backend und gibt als Observable zurück
    // Observable = "Ich verspreche, dass hier später Task-Daten ankommen werden" (weil HTTP-Anfragen Zeit brauchen)
    // (wegen "providedIn: 'root'" bleibt es ein einziger Service im gesamten Projekt)
  }

  // READ Tags für Mehrfachauswahl in Dialog
  getTags(): Observable<any[]> {
  return this.http.get<any[]>(this.apiUrl.replace('tasks', 'tags'));
}

  // NEUE AUFGABE HINZUFÜGEN - send full form values matching backend
  createTask(neueAufgabe: any): Observable<Task> {
    // Backend erwartet names and selectedTags
    const payload = {
      beschreibung: neueAufgabe.beschreibung,
      hat_frist: neueAufgabe.hat_frist || false,
      frist_datum: neueAufgabe.hat_frist ? neueAufgabe.frist_datum : null,
      vorlaufzeit_tage: neueAufgabe.vorlaufzeit_tage,
      users_name: neueAufgabe.users_name,
      prio_name: neueAufgabe.prio_name,
      status_name: neueAufgabe.status_name,
      selectedTags: (neueAufgabe.selectedTags || []).map((id: any) => +id)
    };
    return this.http.post<Task>(this.apiUrl, payload);
  }

  // Kleine private Hilfsmethode für Übersetzung Prio
  private mapPriorityToId(prioName: 'Niedrig' | 'Mittel' | 'Hoch' | 'Default'): number {
    if (prioName === 'Default') return 1;
    if (prioName === 'Hoch') return 2;
    if (prioName === 'Mittel') return 3;
    if (prioName === 'Niedrig') return 4;
    return 1; // Fallback zu Default
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
  private mapStatusToId(statusName: 'Offen' | 'In Bearbeitung' | 'Erledigt' | 'Problem' | 'Beobachten' | 'Abstimmung nötig' | 'Default'): number {
    if (statusName === 'Default') return 1;
    if (statusName === 'Offen') return 2;
    if (statusName === 'In Bearbeitung') return 3;
    if (statusName === 'Problem') return 4;
    if (statusName === 'Beobachten') return 5;
    if (statusName === 'Abstimmung nötig') return 6;
    if (statusName === 'Erledigt') return 7;
    return 1; // Fallback zu Default
}

}
