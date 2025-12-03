import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebSocketService, WebSocketMessage } from '../../services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule],
  template: `
    <div class="messages-page">
      <div class="connection-status" [class.connected]="isConnected" [class.disconnected]="!isConnected">
        <span class="status-indicator"></span>
        <span class="status-text">{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
      </div>

      <p class="description">
        Send real-time messages via WebSocket. All connected users will see messages instantly!
      </p>
      
      <div class="form-container">
        <div class="search-container">
          <input [(ngModel)]="userMessage"
                 [disabled]="loading || !isConnected"
                 placeholder="Enter your message"
                 class="wide-input"
                 type="text"
                 (keyup.enter)="sendMessage()">
          <button (click)="sendMessage()" 
                  [disabled]="loading || !isConnected"
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
        <button (click)="loadMessageHistory()" 
                [disabled]="loadingMessages"
                class="get-messages-button">
          <span *ngIf="!loadingMessages">Load Message History</span>
          <span *ngIf="loadingMessages" class="loading-text">
            <span class="spinner"></span>
            Loading...
          </span>
        </button>
        <button (click)="toggleConnection()" 
                [class.disconnect-button]="isConnected"
                class="connection-button">
          {{ isConnected ? 'Disconnect' : 'Reconnect' }}
        </button>
      </div>

      <div class="result-container" *ngIf="statusMessage">
        <div class="result" [class.error]="isError">
          {{ statusMessage }}
        </div>
      </div>

      <div class="messages-list" *ngIf="messages.length > 0">
        <h2>Messages (Real-time)</h2>
        <div class="message-item" *ngFor="let msg of messages; trackBy: trackByMessageId">
          <div class="message-content">{{ msg.message }}</div>
          <div class="message-meta" *ngIf="msg.timestamp">
            {{ formatTimestamp(msg.timestamp) }}
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, OnDestroy {
  statusMessage: string | undefined;
  userMessage: string = '';
  loading = false;
  loadingMessages = false;
  messages: WebSocketMessage[] = [];
  isConnected = false;
  isError = false;
  
  // Replace with your actual WebSocket URL from SAM template output
  private websocketUrl = 'wss://your-websocket-api-id.execute-api.your-region.amazonaws.com/Prod';
  private httpApiUrl = 'https://vqj0dp8lc0.execute-api.us-east-2.amazonaws.com/Prod/items';
  
  private messageSubscription?: Subscription;
  private connectionSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private websocketService: WebSocketService
  ) {}

  ngOnInit() {
    // Subscribe to WebSocket messages
    this.messageSubscription = this.websocketService.getMessages().subscribe(
      (message: WebSocketMessage) => {
        console.log('New message received:', message);
        if (message.type === 'new_message') {
          // Add new message to the top of the list
          this.messages.unshift(message);
          this.statusMessage = 'New message received!';
          this.isError = false;
          setTimeout(() => this.statusMessage = undefined, 3000);
        }
      }
    );

    // Subscribe to connection status
    this.connectionSubscription = this.websocketService.getConnectionStatus().subscribe(
      (status: boolean) => {
        this.isConnected = status;
        if (status) {
          this.statusMessage = 'Connected to chat server';
          this.isError = false;
        } else {
          this.statusMessage = 'Disconnected from chat server';
          this.isError = true;
        }
        setTimeout(() => this.statusMessage = undefined, 3000);
      }
    );

    // Connect to WebSocket
    this.connectWebSocket();
  }

  ngOnDestroy() {
    // Clean up subscriptions
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
    // Disconnect WebSocket
    this.websocketService.disconnect();
  }

  private connectWebSocket() {
    this.websocketService.connect(this.websocketUrl);
  }

  sendMessage() {
    if (!this.userMessage.trim()) {
      this.statusMessage = 'Please enter a message';
      this.isError = true;
      return;
    }

    if (!this.isConnected) {
      this.statusMessage = 'Not connected to server. Please wait...';
      this.isError = true;
      return;
    }

    this.loading = true;
    this.isError = false;

    try {
      this.websocketService.sendMessage(this.userMessage);
      this.statusMessage = 'Message sent!';
      this.userMessage = ''; // Clear input after sending
      this.loading = false;
    } catch (error) {
      console.error('Error sending message:', error);
      this.statusMessage = 'Error sending message. Please try again.';
      this.isError = true;
      this.loading = false;
    }
  }

  loadMessageHistory() {
    this.loadingMessages = true;
    this.http.get<any[]>(this.httpApiUrl).subscribe({
      next: (response) => {
        // Sort messages by timestamp (newest first)
        this.messages = response.sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          }
          return 0;
        });
        this.loadingMessages = false;
        this.statusMessage = `Loaded ${this.messages.length} messages from history`;
        this.isError = false;
        setTimeout(() => this.statusMessage = undefined, 3000);
      },
      error: (error) => {
        console.error('Error fetching messages:', error);
        this.statusMessage = 'Error loading message history';
        this.isError = true;
        this.loadingMessages = false;
      }
    });
  }

  toggleConnection() {
    if (this.isConnected) {
      this.websocketService.disconnect();
    } else {
      this.connectWebSocket();
    }
  }

  trackByMessageId(index: number, message: WebSocketMessage): string {
    return message.id || index.toString();
  }

  formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  }
}