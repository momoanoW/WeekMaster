import { Component , OnInit, Output, EventEmitter } from '@angular/core'; //ohne Import wüsste typescript nicht, was @Component bedeutet und was OnInit ist
import { CommonModule } from '@angular/common'; // Stellt u.a. die DatePipe bereit
import { Task } from '../../models/task.model'; //holt sich den Bauplan-Interface Task, damit die Tabelle weiß, wie die Daten aussehen müssen
import { TaskService } from '../../services/task.service'; //holt sich den TaskService (=Zusammenspiel von Backend und Bauplan-model)

@Component({ //Dekorator= Komponenten-Etikett
  selector: 'app-task-table', //Name der Component, die in allen HTMLs verwendet werden kann
  standalone: true, //macht die Komponente eigenständig, ohne dass sie in einem Modul deklariert werden muss
  imports: [CommonModule], //CommonModule für grundlegende Angular-Sachen
  templateUrl: './task-table.component.html', //sagt Angular, wo das Tabellen-Gesicht (HTML) zu finden ist
  styleUrl: './task-table.component.css'
})

export class TaskTableComponent implements OnInit { //Klasse verspricht Angular: Ich besitze eine ngOnInit-Methode

  // Erstellt öffentliches Array 'tasks', HTML-Datei darf hier reinschauen (public)
  tasks: Task[] = [];

  // Event Emitter für Edit-Funktionalität
  @Output() editTaskEvent = new EventEmitter<Task>();

  // Bauplan der Komponente. Sagt Angular: "Um arbeiten zu können, brauche ich den TaskService.
  // Bitte gib ihn mir als privates Werkzeug, das nur ich hier drin verwenden kann."
  constructor(private taskService: TaskService) {}

  //passiert direkt nach Build
  ngOnInit(): void {
    this.loadTasks(); // Wir lagern das Laden in eine eigene Methode aus
  }

  // NEUE, WIEDERVERWENDBARE METHODE zum Laden/Aktualisieren der Tasks - PUBLIC damit Dashboard darauf zugreifen kann
  loadTasks(): void {
    // Benutze mein privates Werkzeug 'taskService' mit 'getTasks'-Methode, die ein Observable (zukünftigen Datenstrom) zurückgibt.
    // subscribe() abonniert den Datenstrom
    // sobald Daten eintreffen (datenVomServer), fülle meine öffentliche 'tasks' Array-Variable damit."
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
    });
  }

  // DELETE-FUNKTIONALITÄT
  deleteTask(taskId: number): void {
    // Bestätigungsdialog
    if (confirm('Aufgabe löschen?')) {
      this.taskService.deleteTask(taskId).subscribe(() => {
        console.log('Task erfolgreich gelöscht');
        // Nach erfolgreichem Löschen die Tabelle aktualisieren
        this.loadTasks();
      });
    }
  }

  // STATUS AKTUALISIEREN - Event Handler für Select-Element
  onStatusChange(event: Event, taskId: number): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value;
    console.log('Status ändern:', taskId, 'zu', newStatus); // Debug-Log
    this.taskService.updateTaskStatus(taskId, newStatus).subscribe({
      next: (response) => {
        console.log('Status erfolgreich geändert:', response);
        this.loadTasks(); // Tabelle aktualisieren
      },
      error: (error) => {
        console.error('Fehler beim Status-Update:', error);
        alert('Fehler beim Status-Update: ' + (error.error?.error || error.message));
      }
    });
  }

  // EDIT-FUNKTIONALITÄT - Event an Dashboard weiterleiten
  editTask(task: Task): void {
    this.editTaskEvent.emit(task);
  }
}

//    = HTML kann jetzt auf Array "tasks" zugreifen = effizient weil Datenbeschaffung über Service nur ein einziges Mal am Anfang passiert, nicht bei jeder Aktualisierung
// (wenn sich etwas ändert, ruft eine Methode von hier aktiv den Service erneut auf und aktualisiert das Array)
