import { Component } from '@angular/core'; //ohne Import wüsste typescript nicht, was @Component bedeutet
import { TaskService } from '../../services/task.service'; //holt sich den TaskService (=Zusammenspiel von Backend und Bauplan-model)
import { DatePipe } from '@angular/common';

@Component({ //Dekorator= Component-Etikett
  selector: 'app-task-table', //Name der Component, die in allen HTMLs verwendet werden kann
  imports: [DatePipe], //DatePipe für Datumsformatierung im HTML
  templateUrl: './task-table.html', //sagt Angular, wo das Tabellen-Gesicht (HTML) zu finden ist
})

export class TaskTable { //Klasse, die der "Kellner" ist, der die Wünsche des HTMLs an die Küche aufnimmt und erfüllt

  constructor(public taskService: TaskService) {} // Dependency Injection: Anweisung an Angular: "Wenn du diese Komponente baust, mach ein Objekt 
  // vom TaskService und nenne es 'taskService'."

  getTasks() { //Eine Methode, die nichts anderes tut, als die gleichnamige Methode im Service aufzurufen
  return this.taskService.getTasks(); //
  }
}
