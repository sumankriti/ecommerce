import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, Type } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PageShellComponent } from '@ecommerce/shared-ui';
import { RxjsService, RxjsTopic } from '../services/rxjs.service';
import { RxjsTopicDialogComponent } from './rxjs-modal.component';
import { SwitchMapDialogComponent } from './switchmap-modal/switchmap-modal.component';
import { SwitchMapComponent2 } from './switcmap-modal2/switchmap-modal2.component';
import { SwitchMap3Component } from './switchmap3-modal/switchmap3.component';
import { ConcatMapModalComponent } from './concatmap-modal/concatmap-modal.component';
import { MergeMapModalComponent } from './mergemap-modal/mergemap-modal.compoent';
import { ExhaustMapModalComponent } from './exhaustmap-modal/exhaustmap-modal.component';

@Component({
  selector: 'feature-rxjs',
  standalone: true,
  imports: [CommonModule, PageShellComponent, MatButtonModule, MatDialogModule],
  template: `
    <shared-page-shell
      eyebrow="Reactive Patterns"
      title="RxJS feature workspace"
      subtitle="Explore higher-order RxJS mapping operators through a topic menu, practical guidance, and quick mental models."
    >
      <div class="rxjs-layout">
        <aside class="rxjs-menu">
          <p class="rxjs-menu__label">Operator Topics</p>

          @for (topic of topics; track topic.id) {
            <button
              type="button"
              class="rxjs-menu__item"
              [class.is-active]="selectedTopic().id === topic.id"
              (click)="selectTopic(topic.id)"
            >
              <strong>{{ topic.title }}</strong>
              <span>{{ topic.summary }}</span>
            </button>
          }
        </aside>

        <section class="rxjs-detail">
          <button
            type="button"
            class="rxjs-detail__hero"
            (click)="openTopicDialog(selectedTopic())"
          >
            <p class="rxjs-detail__eyebrow">Selected Topic</p>
            <h2>{{ selectedTopic().title }}</h2>
            <p>{{ selectedTopic().summary }}</p>
          </button>

          <div class="rxjs-grid">
            <article class="rxjs-card">
              <h3>Mental model</h3>
              <p>{{ selectedTopic().analogy }}</p>
            </article>

            <article class="rxjs-card">
              <h3>Best for</h3>
              <ul>
                @for (useCase of selectedTopic().useCases; track useCase) {
                  <li>{{ useCase }}</li>
                }
              </ul>
            </article>

            <article class="rxjs-card rxjs-card--alert">
              <h3>Watch out</h3>
              <p>{{ selectedTopic().warning }}</p>
            </article>
          </div>

          <article class="rxjs-cheatsheet">
            <h3>Quick comparison</h3>
            <div class="rxjs-cheatsheet__row">
              <code>switchMap</code>
              <span>Cancels the previous inner stream when a new value arrives.</span>
            </div>
            <div class="rxjs-cheatsheet__row">
              <code>concatMap</code>
              <span>Queues work and runs each inner stream one after another.</span>
            </div>
            <div class="rxjs-cheatsheet__row">
              <code>mergeMap</code>
              <span>Runs inner streams in parallel when order does not matter.</span>
            </div>
            <div class="rxjs-cheatsheet__row">
              <code>exhaustMap</code>
              <span>Ignores new source values while the current inner stream is still running.</span>
            </div>
          </article>
        </section>
      </div>
    </shared-page-shell>
  `,
  styles: [`
    .rxjs-layout {
      display: grid;
      gap: 1.25rem;
      grid-template-columns: 280px minmax(0, 1fr);
      align-items: start;
    }

    .rxjs-menu {
      position: sticky;
      top: 1rem;
      padding: 1rem;
      border-radius: 24px;
      border: 1px solid rgba(15, 23, 42, 0.08);
      background: rgba(255, 255, 255, 0.84);
      box-shadow: 0 18px 40px rgba(15, 23, 42, 0.05);
      display: grid;
      gap: 0.75rem;
    }

    .rxjs-menu__label,
    .rxjs-detail__eyebrow {
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.72rem;
      color: #5f6d80;
    }

    .rxjs-menu__item {
      border: 1px solid rgba(15, 23, 42, 0.08);
      border-radius: 18px;
      background: #f7fafc;
      padding: 0.95rem 1rem;
      text-align: left;
      display: grid;
      gap: 0.35rem;
      cursor: pointer;
    }

    .rxjs-menu__item strong {
      color: #182536;
      font-size: 0.98rem;
    }

    .rxjs-menu__item span {
      color: #607082;
      font-size: 0.92rem;
      line-height: 1.45;
    }

    .rxjs-menu__item.is-active {
      background: rgba(15, 108, 189, 0.12);
      border-color: rgba(15, 108, 189, 0.25);
    }

    .rxjs-detail {
      display: grid;
      gap: 1rem;
    }

    .rxjs-detail__hero {
      width: 100%;
      text-align: left;
      cursor: pointer;
      padding: 1.25rem;
      border-radius: 24px;
      background: linear-gradient(135deg, rgba(230, 243, 255, 0.9), rgba(255, 255, 255, 0.8));
      border: 1px solid rgba(15, 23, 42, 0.08);
    }

    .rxjs-detail__hero:hover {
      box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
    }

    .rxjs-detail__hero h2,
    .rxjs-cheatsheet h3,
    .rxjs-card h3 {
      margin-top: 0;
    }

    .rxjs-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }

    .rxjs-card {
      padding: 1.25rem;
      border-radius: 20px;
      border: 1px solid rgba(15, 23, 42, 0.08);
      background: rgba(255, 255, 255, 0.82);
      box-shadow: 0 14px 32px rgba(15, 23, 42, 0.05);
    }

    .rxjs-card p,
    .rxjs-card li,
    .rxjs-cheatsheet__row span {
      margin-bottom: 0;
      color: #526072;
      line-height: 1.6;
    }

    .rxjs-card--alert {
      background: rgba(255, 246, 236, 0.9);
    }

    .rxjs-cheatsheet {
      padding: 1.25rem;
      border-radius: 24px;
      border: 1px solid rgba(15, 23, 42, 0.08);
      background: rgba(255, 255, 255, 0.82);
      box-shadow: 0 14px 32px rgba(15, 23, 42, 0.05);
    }

    .rxjs-cheatsheet__row {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 1rem;
      padding: 0.8rem 0;
      border-top: 1px solid rgba(15, 23, 42, 0.08);
    }

    .rxjs-cheatsheet__row:first-of-type {
      border-top: 0;
      padding-top: 0;
    }

    .rxjs-card code {
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 0.92em;
    }

    @media (max-width: 900px) {
      .rxjs-layout {
        grid-template-columns: 1fr;
      }

      .rxjs-menu {
        position: static;
      }

      .rxjs-cheatsheet__row {
        grid-template-columns: 1fr;
        gap: 0.35rem;
      }
    }
  `],
})
export class RxjsComponent {
  private readonly dialog = inject(MatDialog);
  private readonly rxjsService = inject(RxjsService);
  private readonly topicDialogComponents: Record<string, Type<unknown>> = {
    switchmap: SwitchMapDialogComponent,
    switchmap2: SwitchMapComponent2,
    switchmap3: SwitchMap3Component,
    concatmap: ConcatMapModalComponent,
    mergemap: MergeMapModalComponent,
    exhaustmap: ExhaustMapModalComponent,
  };

  protected readonly topics = this.rxjsService.getTopics();

  protected readonly selectedTopicId = signal(this.topics[0].id);
  protected readonly selectedTopic = computed(
    () => this.rxjsService.getTopicById(this.selectedTopicId()) ?? this.topics[0],
  );

  protected selectTopic(topicId: string): void {
    if (this.topics.some((topic) => topic.id === topicId)) {
      this.selectedTopicId.set(topicId);
    }
  }

  protected openTopicDialog(topic: RxjsTopic): void {
    const component = this.topicDialogComponents[topic.id] ?? RxjsTopicDialogComponent;

    this.dialog.open(component, {
      width: '680px',
      maxWidth: '92vw',
      data: topic,
    });
  }
}
