//Service ist eine Klasse für spezif. Aufgaben, z.B. hier Abrufen von Daten aus DB und Bereitstellen für andere components über das Task Interface
// = Zusammenspiel von Backend und Bauplan-model


import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';

@Injectable({ //kennzeichnet diese Klasse als Service, damit ganze App darauf zugreifen kann
  providedIn: 'root' //erstellt eine einzige Instanzdieses Services, die in der ganzen App verwendet wird (Singleton Pattern)
})


export class TaskService { //Service-Klasse (importierbar wegen "export")

  //private Variable "tasks" ist ein Array von den Bauplänen Tasks aus (task.model.ts). Muss private sein, damit nicht verändert werden kann von außen.
  private tasks: Task[] = [ 
    { id: 1, beschreibung: 'Hausarbeit fertigstellen', frist: new Date('2023-05-01'), vorlaufzeit_tage: 5, kontrolliert: false, prioritaet: 'Hoch', user: 'Max', status: 'In Bearbeitung' },
    { id: 2, beschreibung: 'Für die Prüfung lernen', frist: new Date('2023-05-15'), vorlaufzeit_tage: 10, kontrolliert: false, prioritaet: 'Hoch', user: 'Anna', status: 'Offen' },
    { id: 3, beschreibung: 'Einkaufen gehen', frist: new Date('2023-05-10'), vorlaufzeit_tage: 3, kontrolliert: false, prioritaet: 'Mittel', user: 'Tom', status: 'Offen' },
  ]; //... jetzt wurden die Daten gespeichert. jedes Objekt hier MUSS exakt dem Bauplan vom Task Interface entsprechen.
  constructor() { }

  getTasks(): Task[] { //Methode, die als Schnittstelle das fertig erstellte (aber private) Array tasks zurückgibt
    return this.tasks; //dadurch wird das fertige Array öffentlich zugänglich
    // (weil "providedIn: 'root'"" bleibt es ein einziger Service mit nur diesem einen task-Array im gesamten Projekt)
  }
}