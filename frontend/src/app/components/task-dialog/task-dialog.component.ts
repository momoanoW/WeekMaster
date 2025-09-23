//Logik für wiederverwendbare Dialog-Komponente

import { Component, OnInit, Output, EventEmitter } from '@angular/core'; //verschiedene Standardelemente importieren
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms'; // Für reaktive Formulare
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
  tags: any[] = []; // Liste aller verfügbaren Tags für Mehrfachauswahl
  confirmationMessage: string | null = null; // Bestätigungsmeldung nach Speichern
  showConfirmDialog: boolean = false; // Steuert Anzeige des Custom Confirm Dialogs

  constructor(private fb: FormBuilder, private taskService: TaskService) { //Dependency Injection: private "fb" wird Werkzeug zum Erstellen von Formularen (nach Bauplan von FormBuilder)

    this.taskForm = this.fb.group({ //FormBuilder erstellt neue Formular-Gruppe (=Container) und speichert sie in "taskForm"
      beschreibung: ['', Validators.required], // REQUIRED - einziges Muss-Feld für User
      hat_frist: [false], // EXPLICIT boolean - false als Standard für neue Aufgaben
      frist_datum: [null], // OPTIONAL - nur gefüllt wenn hat_frist=true
      prio_name: ['Default', Validators.required], // REQUIRED mit explizitem Default-Wert
      vorlaufzeit_tage: [0], // OPTIONAL - 0 als Standard (entspricht DB-Default)
      users_name: ['Default', Validators.required], // REQUIRED mit explizitem Default-Wert
      status_name: ['Default', Validators.required], // REQUIRED mit explizitem Default-Wert
      // kontrolliert entfernt - DB-Default false übernimmt automatisch
      selectedTags: this.fb.array([]) // NEU: FormArray für die ausgewählten Tags
    });
  }

   //passiert direkt nach Build
  ngOnInit(): void { 
    // User-Liste beim Initialisieren laden
    this.loadUsers();
    // Tag-Liste beim Initialisieren laden
    this.loadTags();
  }

  //  User-Liste für Dropdown laden
  private loadUsers(): void {
    this.taskService.getUsers().subscribe({ // subscribe() abonniert den Datenstrom
      next: (users) => { // sobald Daten eintreffen (users), fülle meine öffentliche 'users' Array-Variable damit."
        this.users = users; 
        console.log('Users für Dropdown geladen:', this.users); 
      },
      error: (error) => {
        console.error('Fehler beim Laden der Users für Dropdown:', error);
      }
    });
  }

  //  Tags für Mehrfachauswahl laden
  private loadTags(): void {
    this.taskService.getTags().subscribe({
      next: (tags) => {
        this.tags = tags;
        console.log('Tags für Checkboxen geladen:', this.tags);
      },
      error: (error) => console.error('Fehler beim Laden der Tags:', error)
    });
  }

  // Wird aufgerufen, wenn eine Checkbox geändert wird
  onTagChange(event: any): void {
    const selectedTags = this.taskForm.controls['selectedTags'] as FormArray;

    if (event.target.checked) {
      selectedTags.push(new FormControl(event.target.value));
    } else {
      const index = selectedTags.controls.findIndex(x => x.value === event.target.value);
      selectedTags.removeAt(index);
    }
  }

  // Folgendes passiert wenn User auf "Speichern" (type="submit") klickt
  onSubmit(): void {
    // Prüfen, ob alle Pflichtfelder ausgefüllt sind
    if (this.taskForm.valid) {
      // this.taskForm.value= MAGISCHER BEFEHL; gibt alle aktuellen Werte des Formulars als Objekt zurück, um später an Service zu senden
      const formValue = this.taskForm.value;
      console.log('Formular abgeschickt:', formValue); // Bestätigung für korrekte Usereingabe
      
      this.taskService.createTask(formValue).subscribe({
        next: (response) => {
          console.log('Aufgabe erfolgreich erstellt:', response); // Bestätigung für erfolgreiche Speicherung
          this.confirmationMessage = 'Aufgabe wurde erfolgreich hinzugefügt. 📌';
          // Nach kurzer Anzeige automatisch schließen
          setTimeout(() => {
          this.taskSaved.emit(); // SENDE EVENT AN DASHBOARD
          this.sendCloseSignal(); // Schließt den Dialog nach erfolgreichem Speichern
          }, 1500);
        },
        error: (error) => {
          console.error('Fehler beim Erstellen der Aufgabe:', error);
        }
      });
    }
  }

  confirmCloseDialog(): void {
    console.log('confirmCloseDialog aufgerufen');
    console.log('taskForm.dirty:', this.taskForm.dirty);
    console.log('showConfirmDialog vor Änderung:', this.showConfirmDialog);
    
    if (this.taskForm.dirty) {
      this.showConfirmDialog = true; // Zeige Custom Dialog
      console.log('showConfirmDialog nach Änderung:', this.showConfirmDialog);
    } else {
      console.log('Formular ist nicht dirty - schließe direkt');
      this.sendCloseSignal();
    }
  }

  // Custom Dialog Methoden
  cancelClose(): void {
    console.log('cancelClose aufgerufen');
    this.showConfirmDialog = false; // Dialog schließen ohne Aktion
  }

  confirmClose(): void {
    console.log('confirmClose aufgerufen');
    this.showConfirmDialog = false; // Dialog schließen
    this.sendCloseSignal(); // Hauptdialog schließen
  }

  sendCloseSignal(): void { // Methode, um das Ereignis auszulösen
    this.close.emit(); // Ereignis "close" auslösen
  }
}
  //= sendet Signal an Elten-Komponente wenn ein bestimmtes Ereignis eintritt (hier wenn User auf "Schließen" im Popup der Eltern-KOmp "Dashboard" klickt)

