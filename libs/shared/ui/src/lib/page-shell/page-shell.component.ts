import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'shared-page-shell',
  standalone: true,
  imports: [NgClass],
  template: `
    <section class="page-shell" [ngClass]="tone()">
      <header class="page-shell__header">
        <p class="page-shell__eyebrow">{{ eyebrow() }}</p>
        <h1>{{ title() }}</h1>
        @if (subtitle()) {
          <p class="page-shell__subtitle">{{ subtitle() }}</p>
        }
      </header>

      <div class="page-shell__content">
        <ng-content />
      </div>
    </section>
  `,
  styles: [`
    .page-shell {
      max-width: 1040px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
    }

    .page-shell__header {
      margin-bottom: 1.5rem;
    }

    .page-shell__eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.75rem;
      color: #476280;
      margin: 0 0 0.75rem;
    }

    .page-shell__subtitle {
      max-width: 52rem;
      color: #526072;
    }

    .page-shell.soft {
      background: rgba(255, 255, 255, 0.58);
      border: 1px solid rgba(15, 23, 42, 0.08);
      border-radius: 24px;
      backdrop-filter: blur(12px);
    }
  `],
})
export class PageShellComponent {
  readonly title = input.required<string>();
  readonly eyebrow = input('Workspace');
  readonly subtitle = input('');
  readonly tone = input<'default' | 'soft'>('soft');
}
