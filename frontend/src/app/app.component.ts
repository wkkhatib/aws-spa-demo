import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf], 
  template: `
    <h1>SPA with AWS</h1>
    <button (click)="fetchMessage()">Get Message</button>
    <p *ngIf="message">{{ message }}</p>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  message: string | undefined;
  apiUrl = 'https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/messages';

  constructor(private http: HttpClient) {}

  fetchMessage() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    this.http.get<{ message: string }>(this.apiUrl).subscribe(response => {
      this.message = response.message;
    },
    error => {
      console.error('Error fetching message:', error);
      this.message = 'Error fetching message';
    }
  );
  }
}


// import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';

// @Component({
//   selector: 'app-root',
//   imports: [RouterOutlet],
//   templateUrl: './app.component.html',
//   styleUrl: './app.component.css'
// })
// export class AppComponent {
//   title = 'aws-spa-demo';
// }
