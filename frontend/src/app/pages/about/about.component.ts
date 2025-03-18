import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VERSION } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="about-container">
      <div class="content">
        <p>This demo application demonstrates a modern web architecture using:</p>
        <div class="tech-stack">
          <div class="tech-item">
            <h3>Frontend</h3>
            <ul>
              <li>Angular {{ version }}</li>
              <li>Standalone Components</li>
              <li>Lazy Loading</li>
            </ul>
          </div>
          <div class="tech-item">
            <h3>Backend</h3>
            <ul>
              <li>AWS Lambda</li>
              <li>API Gateway</li>
              <li>DynamoDB</li>
            </ul>
          </div>
          <div class="tech-item">
            <h3>Hosting</h3>
            <ul>
              <li>S3 Static Website</li>
              <li>CloudFront</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  version = VERSION.major;
}
