import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-container">
      <div class="header-container">
        <h1 class="main-header">
          <span class="highlight">SPA</span> with AWS
        </h1>
        
        <nav class="demo-nav">
          <a routerLink="/home" routerLinkActive="active">Home</a>
          <a routerLink="/messages" routerLinkActive="active">Messages</a>
          <a routerLink="/about" routerLinkActive="active">About</a>
        </nav>
      </div>

      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  constructor() {}
}
