// Root-Komponente der Angular-Anwendung = Vorstand der App (weiß, an wen sie was weitergibt. weiß aber nicht, was jeder einzelne MA tut)

import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // bürogebäude mit Türen zu verschiedenen Abteilungen
import { HeaderComponent } from './core/header/header.component'; // eingangsbereich
import { FooterComponent } from './core/footer/footer.component'; // ausgangsbereich
import { TaskDialogComponent } from './components/task-dialog/task-dialog.component';
import { UniversalDialogComponent } from './components/universal-dialog/universal-dialog.component';
import { CommonModule } from '@angular/common';
import { DialogService } from './services/dialog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,

  //Alle Bauteile hier bekannt machen
  imports: [RouterOutlet, HeaderComponent, FooterComponent, TaskDialogComponent, UniversalDialogComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit, OnDestroy {
  title = 'frontend';
  isDialogOpen = false; // Steuert Task-Dialog Anzeige
  isBetaDialogOpen = false; // Steuert Beta-Info Dialog Anzeige
  private subscription = new Subscription(); // Sammelt alle Event-Subscriptions

  constructor(private dialogService: DialogService) {}

  ngOnInit(): void {
    // Hört auf Header-Button Events vom DialogService
    this.subscription.add(
      this.dialogService.openDialog$.subscribe(() => {
        this.openDialog(); // Task-Dialog öffnen
      })
    );

    this.subscription.add(
      this.dialogService.betaDialog$.subscribe(() => {
        this.openBetaDialog(); // Beta-Info Dialog öffnen
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe(); // Verhindert Memory Leaks
  }

  // Task-Dialog Management
  openDialog(): void {
    this.isDialogOpen = true;
  }

  closeDialog(): void {
    this.isDialogOpen = false;
  }

  // Beta-Dialog Management
  openBetaDialog(): void {
    this.isBetaDialogOpen = true;
  }

  closeBetaDialog(): void {
    this.isBetaDialogOpen = false;
  }

  // Nach Task-Speicherung: Dialog schließen + andere Komponenten informieren
  onTaskSaved(): void {
    this.closeDialog();
    console.log('AppComponent sendet Task-Saved Event...');
    this.dialogService.triggerTaskSaved(); // Dashboard-Update auslösen
  }
}