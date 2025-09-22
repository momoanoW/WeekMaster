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
  @Output() taskSaved = new EventEmitter<void>(); // Ereignis, um Elternkomponente zu informieren, dass eine neue Aufgabe erstellt wurde

  // NEUE EIGENSCHAFT: Liste aller verfügbaren User für das Dropdown
  users: any[] = [];
  taskForm: FormGroup; // in "taskForm" wird das gesamte Formular-Modell aus den nächsten Schritten gespeichert

  constructor(private fb: FormBuilder, private taskService: TaskService) { //Dependency Injection: private "fb" wird Werkzeug zum Erstellen von Formularen (nach Bauplan von FormBuilder)

    this.taskForm = this.fb.group({ //FormBuilder erstellt neue Formular-Gruppe (=Container) und speichert sie in "taskForm"
      beschreibung: ['', Validators.required], // REQUIRED - einziges Muss-Feld für User
      frist: [null], // OPTIONAL - NULL für offene Aufgaben ohne Deadline
      prio_name: ['Default', Validators.required], // REQUIRED mit explizitem Default-Wert
      vorlaufzeit_tage: [0], // OPTIONAL - 0 als Standard (entspricht DB-Default)
      users_name: ['Default', Validators.required], // REQUIRED mit explizitem Default-Wert
      status_name: ['Default', Validators.required] // REQUIRED mit explizitem Default-Wert
      // kontrolliert entfernt - DB-Default false übernimmt automatisch
    });
  }

   //passiert direkt nach Build
  ngOnInit(): void { 
    // User-Liste beim Initialisieren laden
    this.loadUsers();
  }

  // NEUE METHODE: User-Liste für Dropdown laden
  private loadUsers(): void {
    this.taskService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        console.log('Users für Dropdown geladen:', this.users);
        // "Default" (1) als Startwert
        // Benutzer kann bewusst auswählen oder "Default" verwenden
      },
      error: (error) => {
        console.error('Fehler beim Laden der Users für Dropdown:', error);
        // Kein Fallback nötig - TaskService hat bereits Fallback-Mechanismus
      }
    });
  }

  // Folgendes passiert wenn User auf "Speichern" (type="submit") klickt
  onSubmit(): void {
    // Prüfen, ob alle Pflichtfelder ausgefüllt sind
    if (this.taskForm.valid) {
      // this.taskForm.value= MAGISCHER BEFEHL; gibt alle aktuellen Werte des Formulars als Objekt zurück, um später an Service zu senden
      console.log('Formular abgeschickt:', this.taskForm.value); // Bestätigung für korrekte Usereingabe
      this.taskService.createTask(this.taskForm.value).subscribe({
        next: (response) => {
          console.log('Aufgabe erfolgreich erstellt:', response); // Bestätigung für erfolgreiche Speicherung
          this.taskSaved.emit(); // SENDE EVENT AN DASHBOARD
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
