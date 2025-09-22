//Logik für wiederverwendbare Dialog-Komponente

import { Component, OnInit, Output, EventEmitter } from '@angular/core'; //verschiedene Standardelemente importieren
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Für reaktive Formulare
import { TaskService } from '../../services/task.service'; // Service importieren, um neue Aufgaben zu speichern


@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-dialog.component.html',
  styleUrl: './task-dialog.component.css'
})
export class TaskDialogComponent implements OnInit { // Komp für einen Dialog (Popup fesnter). Klasse verspricht Angular: Ich besitze eine ngOnInit-Methode

  @Output() close = new EventEmitter<void>(); // =Ereignis mit Namen "close"-> sagt Elternkomponente Bescheid, dass der Dialog geschlossen werden soll

  taskForm: FormGroup; // in "taskForm" wird das gesamte Formular-Modell aus den nächsten Schritten gespeichert

  constructor(private fb: FormBuilder, private taskService: TaskService) { //Dependency Injection: private "fb" wird Werkzeug zum Erstellen von Formularen (nach Bauplan von FormBuilder)

    this.taskForm = this.fb.group({ //FormBuilder erstellt neue Formular-Gruppe (=Container) und speichert sie in "taskForm"
      beschreibung: ['', Validators.required], // Feldtext (muss leer bleiben), Feld ist ein Pflichtfeld
      frist: [null], //Datumswert (leer)
      prio_name: ['Mittel', Validators.required], // Standardwert ist 'Mittel', Feld ist ein Pflichtfeld
      vorlaufzeit_tage: [7], // Beispiel-Startwert von 7 Tagen
      users_name: ['MS', Validators.required], // Beispiel-Startwert, Feld ist ein Pflichtfeld
      kontrolliert: [false], // Startwert für Checkbox ist 'nicht angehakt'
      status_name: ['Offen', Validators.required] // Beispiel-Startwert, Feld ist ein Pflichtfeld
    });
  }

   //passiert direkt nach Build
  ngOnInit(): void { }

  // Folgendes passiert wenn User auf "Speichern" (type="submit") klickt
  onSubmit(): void {
    // Prüfen, ob alle Pflichtfelder ausgefüllt sind
    if (this.taskForm.valid) {
      // this.taskForm.value= MAGISCHER BEFEHL; gibt alle aktuellen Werte des Formulars als Objekt zurück, um später an Service zu senden
      console.log('Formular abgeschickt:', this.taskForm.value); // Bestätigung für korrekte Usereingabe
      this.taskService.createTask(this.taskForm.value).subscribe({
        next: (response) => {
          console.log('Aufgabe erfolgreich erstellt:', response); // Bestätigung für erfolgreiche Speicherung
          this.sendCloseSignal(); // Schließt den Dialog nach erfolgreichem Speichern
        },
        error: (error) => {
          console.error('Fehler beim Erstellen der Aufgabe:', error);
        }
      });
    }
  }  
  
  sendCloseSignal(): void { // Methode, um das Ereignis auszulösen
    this.close.emit(); // Ereignis "close" auslösen
  }

  //= sendet Signal an Elten-Komponente wenn ein bestimmtes Ereignis eintritt (hier wenn User auf "Schließen" im Popup der Eltern-KOmp "Dashboard" klickt)

}
