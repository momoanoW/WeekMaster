import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard'; // Dashboard importieren

export const routes: Routes = [
  // leerer Pfad -> Dashboard
  { path: '', component: DashboardComponent },

  // Explizit "/dashboard" -> Dashboard
  { path: 'dashboard', component: DashboardComponent },   

  // Fallback für unbekannte URLs
  { path: '**', redirectTo: '' }  
];
