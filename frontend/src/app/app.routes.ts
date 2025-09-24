import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component'; // Dashboard importieren
import { TablesComponent } from './pages/tables/tables.component'; // Tables importieren

export const routes: Routes = [
  // leerer Pfad -> Dashboard
  { path: '', component: DashboardComponent },

  // Explizit "/dashboard" -> Dashboard
  { path: 'dashboard', component: DashboardComponent },   

  // Tables-Seite
  { path: 'tables', component: TablesComponent },

  // Fallback für unbekannte URLs
  { path: '**', redirectTo: '' }  
];
