import { Component, inject } from "@angular/core";
import { CommonModule } from '@angular/common';
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";

type Topic = {
    id: string;
    title: string;
    summary: string;
    analogy: string;
    useCases: string[];
    warning: string;
  };
  
@Component({
    selector: 'feature-rxjs-topic-dialog',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatDialogModule],
    template: `
      <h2 mat-dialog-title>{{ data.title }}</h2>
  
      <mat-dialog-content>
        <section class="dialog-section">
          <p class="dialog-label">Summary</p>
          <p>{{ data.summary }}</p>
        </section>
  
        <section class="dialog-section">
          <p class="dialog-label">Mental model</p>
          <p>{{ data.analogy }}</p>
        </section>
  
        <section class="dialog-section">
          <p class="dialog-label">Best for</p>
          <ul>
            @for (useCase of data.useCases; track useCase) {
              <li>{{ useCase }}</li>
            }
          </ul>
        </section>
  
        <section class="dialog-section dialog-section--alert">
          <p class="dialog-label">Watch out</p>
          <p>{{ data.warning }}</p>
        </section>
      </mat-dialog-content>
  
      <mat-dialog-actions align="end">
        <button mat-flat-button mat-dialog-close>Close</button>
      </mat-dialog-actions>
    `,
    styles: [`
      .dialog-section {
        margin-bottom: 1rem;
        padding: 1rem;
        border-radius: 18px;
        background: rgba(245, 248, 252, 0.9);
      }
  
      .dialog-section--alert {
        background: rgba(255, 244, 236, 0.95);
      }
  
      .dialog-label {
        margin: 0 0 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.72rem;
        color: #607082;
      }
  
      p,
      li {
        color: #425164;
        line-height: 1.6;
      }
    `],
  })
  export class RxjsTopicDialogComponent {
    protected readonly data = inject<Topic>(MAT_DIALOG_DATA);
  }
  