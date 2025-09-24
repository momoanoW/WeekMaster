// Importiere alle benötigten Angular-Module und Services
import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { TaskDisplayComponent } from '../../components/task-display/task-display.component';
import { CommonModule } from '@angular/common';
import { DialogService, DialogEvent } from '../../services/dialog.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',           // HTML-Tag: <app-dashboard>
  standalone: true,                   // Neue Angular-Art (keine Module nötig)
  imports: [TaskDisplayComponent, CommonModule],  // Welche anderen Komponenten werden benutzt
  templateUrl: './dashboard.component.html'       // Welche HTML-Datei gehört dazu
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Verbindung zur Aufgabenliste im HTML
  @ViewChild('taskDisplay') taskDisplay!: TaskDisplayComponent;
  
  // Verwaltung von Event-Abonnements (wichtig für Speicher-Verwaltung)
  private subscription = new Subscription();

  // Constructor: Wird aufgerufen, wenn die Komponente erstellt wird
  constructor(private dialogService: DialogService) {}

  
  ngOnInit(): void {
    // Wenn eine neue Aufgabe gespeichert wird, soll das Dashboard aktualisiert werden
    this.subscription.add(
      this.dialogService.dialogEvents$
        .pipe(filter((event: DialogEvent) => event.type === 'taskSaved'))
        .subscribe(() => {
          console.log('✅ Neue Aufgabe wurde gespeichert - Dashboard wird aktualisiert');
          this.updateDashboard();
        })
    );
  }

  // Wird aufgerufen, wenn die Komponente zerstört wird (wichtig für Aufräumen)
  ngOnDestroy(): void {
    // Stoppe alle Event-Abonnements, um Speicher freizugeben
    this.subscription.unsubscribe();
  }

  // Diese Methode zählt verschiedene Arten von Aufgaben
  getTaskStats(): { total: number; completed: number; pending: number; highPriority: number } {
    // Hole alle Aufgaben aus der Liste (falls vorhanden)
    const alleTasks = this.taskDisplay?.tasks || [];
    
    // Erstelle Datumsobjekte für die Zeitberechnung
    const heute = new Date();
    const in7Tagen = new Date(heute.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Zähler für verschiedene Task-Arten
    let tasksIn7Tagen = 0;
    let erledigteAufgaben = 0;
    let offeneAufgaben = 0;
    let wichtigeAufgaben = 0;

    // Gehe durch jede Aufgabe und zähle sie
    for (const aufgabe of alleTasks) {
      // 1. Zähle Aufgaben mit Frist in den nächsten 7 Tagen
      if (aufgabe.frist_datum) {
        const aufgabeDatum = new Date(aufgabe.frist_datum);
        if (aufgabeDatum >= heute && aufgabeDatum <= in7Tagen) {
          tasksIn7Tagen++;
        }
      }
      
      // 2. Zähle erledigte Aufgaben
      if (aufgabe.status_name === 'Erledigt') {
        erledigteAufgaben++;
      }
      
      // 3. Zähle noch offene Aufgaben (alle außer "Erledigt")
      if (aufgabe.status_name !== 'Erledigt') {
        offeneAufgaben++;
      }
      
      // 4. Zähle wichtige Aufgaben (hohe Priorität)
      if (aufgabe.prio_name === 'Hoch') {
        wichtigeAufgaben++;
      }
    }

    // Gib alle Zahlen zurück
    return { 
      total: tasksIn7Tagen, 
      completed: erledigteAufgaben, 
      pending: offeneAufgaben, 
      highPriority: wichtigeAufgaben 
    };
  }

  // Diese Methoden werden vom HTML-Template aufgerufen, um die Zahlen anzuzeigen
  
  // Wie viele Aufgaben sind in den nächsten 7 Tagen fällig?
  getTotalTasks(): number {
    return this.getTaskStats().total;
  }

  // Wie viele Aufgaben sind bereits erledigt?
  getCompletedTasks(): number {
    return this.getTaskStats().completed;
  }

  // Wie viele Aufgaben sind noch offen?
  getPendingTasks(): number {
    return this.getTaskStats().pending;
  }

  // Wie viele Aufgaben haben eine hohe Priorität?
  getHighPriorityTasks(): number {
    return this.getTaskStats().highPriority;
  }

  // Diese Methode wird aufgerufen, wenn eine neue Aufgabe gespeichert wurde
  updateDashboard(): void {
    // Lade die Aufgabenliste neu, damit die neuen Daten angezeigt werden
    this.taskDisplay.loadTasks();
  }
}