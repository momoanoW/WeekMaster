import { Routes } from '@angular/router';
import { Dashboard } from './task-dashboard/task-dashboard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard }
];
