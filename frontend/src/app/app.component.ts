import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, FormsModule], 
  template: `
    <h1>SPA with AWS</h1>
    <div>
      <input [(ngModel)]="userMessage" 
             placeholder="Enter your message"
             type="text">
      <button (click)="sendMessage()">Send Message</button>
    </div>
    <p *ngIf="message">{{ message }}</p>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  message: string | undefined;
  userMessage: string = '';
  apiUrl = 'https://7krvz4i3eg.execute-api.us-east-2.amazonaws.com/Prod/items';

  constructor(private http: HttpClient) {}

  sendMessage() {
    if (!this.userMessage.trim()) {
      this.message = 'Please enter a message';
      return;
    }

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
      },
      error => {
        console.error('Error sending message:', error);
        this.message = 'Error sending message';
      }
    );
  }
}
