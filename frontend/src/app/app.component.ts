// Root-Komponente der Angular-Anwendung = Vorstand der App (weiß, an wen sie was weitergibt. weiß aber nicht, was jeder einzelne MA tut)

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // bürogebäude mit Türen zu verschiedenen Abteilungen
import { HeaderComponent } from './core/header/header.component'; // eingangsbereich
import { FooterComponent } from './core/footer/footer.component'; // ausgangsbereich

@Component({
  selector: 'app-root',
  standalone: true,

  //Alle Bauteile hier bekannt machen
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})


export class AppComponent {
  title = 'frontend';
}