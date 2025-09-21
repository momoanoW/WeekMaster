// Ist die Hauptkonfigurationsdatei der Angular-Anwendung

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core'; // Für Change Detection 
import { provideRouter } from '@angular/router'; // Für Routing
import { routes } from './app.routes'; // Importiere die Routen (Straßenkarte)
import { provideHttpClient } from '@angular/common/http'; // Für HTTP-Anfragen

//
export const appConfig: ApplicationConfig = { // Konstante, die die Spielregeln und Werkzeuge der gesamten App definiert(= für alle Komponenten, Services, etc.)
  // Hier wird ein Array von "Providern" definiert für alle
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), // Jede Komp ist an autom. Überwachung angeschlossen
    provideRouter(routes),     // Jede Komp kann Router nutzen, damit sie navigieren kann und weiß, wo sie ist                        
    provideHttpClient()        // Jede Komp kann mit Außenwelt kommunizieren (Backend oder andere APIs)                        
  ]
};
