import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <h1>Welcome to our Single Page Application</h1>
      <div class="logo-container">
        <div class="logo-item">
          <img 
            src="assets/angular.svg" 
            alt="Angular Logo" 
            class="logo angular-logo"
          >
        </div>
        <div class="logo-item">
          <img 
            src="https://d0.awsstatic.com/logos/powered-by-aws.png" 
            alt="Powered by AWS Cloud Computing" 
            class="aws-logo"
          >
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./home.component.css']
})
export class HomeComponent {}
