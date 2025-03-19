import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule],
  template: `
    <div class="messages-page">
      <p class="description">
        Enter your message below to store it through a serverless API
      </p>
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

      <div class="button-container">
        <button (click)="getMessages()" 
                [disabled]="loadingMessages"
                class="get-messages-button">
          <span *ngIf="!loadingMessages">Get All Messages</span>
          <span *ngIf="loadingMessages" class="loading-text">
            <span class="spinner"></span>
            Loading...
          </span>
        </button>
      </div>

      <div class="result-container" *ngIf="message">
        <div class="result">
          {{ message }}
        </div>
      </div>

      <div class="messages-list" *ngIf="messages.length > 0">
        <h2>Stored Messages</h2>
        <div class="message-item" *ngFor="let msg of messages">
          {{ msg.message }}
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent {
  message: string | undefined;
  userMessage: string = '';
  loading = false;
  loadingMessages = false;
  messages: any[] = [];
  apiUrl = process.env['API_URL'] || 'https://vqj0dp8lc0.execute-api.us-east-2.amazonaws.com/Prod/items';

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
  getMessages() {
    this.loadingMessages = true;
    this.http.get<any[]>(this.apiUrl).subscribe(
      response => {
        this.messages = response;
        this.loadingMessages = false;
      },
      error => {
        console.error('Error fetching messages:', error);
        this.loadingMessages = false;
      }
    );
  }
}