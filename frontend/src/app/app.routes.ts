import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component')
      .then(m => m.HomeComponent)
  },
  {
    path: 'messages',
    loadComponent: () => import('./pages/messages/messages.component')
      .then(m => m.MessagesComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component')
      .then(m => m.AboutComponent)
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];
