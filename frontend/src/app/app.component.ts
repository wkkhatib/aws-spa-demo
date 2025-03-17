import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

// app.component.ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, FormsModule],
  template: `
    <div class="app-container">
      <div class="header-container">
        <h1 class="main-header">
          <span class="highlight">SPA</span> with AWS
        </h1>
        <p class="description">
          Enter your message below to store it through a serverless API
        </p>
      </div>

      <div class="form-container">
        <div class="search-container">
          <input [(ngModel)]="userMessage"
                 [disabled]="loading"
                 placeholder="Enter your message"
                 class="wide-input"
                 type="text">
          <button (click)="sendMessage()" 
                  [disabled]="loading"
                  class="search-button">
            <span *ngIf="!loading">Send Message</span>
            <span *ngIf="loading" class="loading-text">
              <span class="spinner"></span>
              Sending...
            </span>
          </button>
        </div>
      </div>

      <div class="result-container" *ngIf="message">
        <div class="result">
          {{ message }}
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  message: string | undefined;
  userMessage: string = '';
  loading = false;
  apiUrl = 'https://7krvz4i3eg.execute-api.us-east-2.amazonaws.com/Prod/items';

  constructor(private http: HttpClient) {}

  sendMessage() {
    if (!this.userMessage.trim()) {
      this.message = 'Please enter a message';
      return;
    }

    this.loading = true;

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    const body = {
      message: this.userMessage
    };

    this.http.post<{ message: string }>(this.apiUrl, body, { headers }).subscribe(
      response => {
        this.message = response.message;
        this.userMessage = ''; // Clear the input after successful send
        this.loading = false;
      },
      error => {
        console.error('Error sending message:', error);
        this.message = 'Error sending message';
        this.loading = false;
      }
    );
  }
}
