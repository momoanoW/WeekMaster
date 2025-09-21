import { Component , OnInit } from '@angular/core'; //ohne Import wüsste typescript nicht, was @Component bedeutet und was OnInit ist
import { CommonModule } from '@angular/common'; // Stellt u.a. die DatePipe bereit
import { Task } from '../../models/task.model'; //holt sich den Bauplan-Interface Task, damit die Tabelle weiß, wie die Daten aussehen müssen
import { TaskService } from '../../services/task.service'; //holt sich den TaskService (=Zusammenspiel von Backend und Bauplan-model)

@Component({ //Dekorator= Komponenten-Etikett
  selector: 'app-task-table', //Name der Component, die in allen HTMLs verwendet werden kann
  standalone: true, //macht die Komponente eigenständig, ohne dass sie in einem Modul deklariert werden muss
  imports: [CommonModule], //CommonModule für grundlegende Angular-Sachen
  templateUrl: './task-table.html', //sagt Angular, wo das Tabellen-Gesicht (HTML) zu finden ist
})


export class TaskTableComponent implements OnInit { //Klasse verspricht Angular: Ich besitze eine ngOnInit-Methode

  // Erstellt öffentliches Array 'tasks', HTML-Datei darf hier reinschauen (public)
  public tasks: Task[] = [];

  // Bauplan der Komponente. Sagt Angular: "Um arbeiten zu können, brauche ich den TaskService.
  // Bitte gib ihn mir als privates Werkzeug, das nur ich hier drin verwenden kann."
  constructor(private taskService: TaskService) {}

  //passiert direkt nach Build
  ngOnInit(): void {
    // Benutze mein privates Werkzeug 'taskService' mit 'getTasks'-Methode und fülle meine öffentliche 'tasks' Array-Variable damit."
    this.tasks = this.taskService.getTasks();
  }
}

//    = HTML kann jetzt auf Array "tasks" zugreifen = effizient weil Datenbeschaffung über Service nur ein einziges Mal am Anfang passiert, nicht bei jeder Aktualisierung
// (wenn sich etwas ändert, ruft eine Methode von hier aktiv den Service erneut auf und aktualisiert das Array)