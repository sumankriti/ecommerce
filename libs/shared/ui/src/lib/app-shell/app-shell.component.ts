import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { AuthFacade } from '@ecommerce/core';

type NavItem = {
  label: string;
  route: string;
  exact?: boolean;
  adminOnly?: boolean;
};

@Component({
  selector: 'shared-app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
  ],
  template: `
    <mat-sidenav-container class="workspace-shell">
      <mat-sidenav class="workspace-shell__nav" mode="side" [opened]="true">
        <div class="workspace-shell__brand">
          <p class="workspace-shell__eyebrow">Commerce Suite</p>
          <h2>Control Panel</h2>
          <p>Shared workspace navigation for protected application routes.</p>
        </div>

        <mat-divider />

        <mat-nav-list>
          @for (item of visibleNavItems(); track item.route) {
            <a
              mat-list-item
              [routerLink]="item.route"
              routerLinkActive="is-active"
              [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
            >
              {{ item.label }}
            </a>
          }
        </mat-nav-list>

        <div class="workspace-shell__footer">
          @if (authFacade.currentUser(); as user) {
            <div class="workspace-shell__user">
              <p>{{ user.name }}</p>
              <span>{{ user.roles.join(' • ') }}</span>
            </div>
          }

          <button mat-flat-button class="workspace-shell__logout" (click)="logout()">
            Sign out
          </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="workspace-shell__content">
        <mat-toolbar class="workspace-shell__toolbar">
          <div>
            <p class="workspace-shell__toolbar-label">Workspace</p>
            <h1>{{ pageTitle() }}</h1>
          </div>
        </mat-toolbar>

        <div class="workspace-shell__page">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .workspace-shell {
        min-height: 100vh;
        background: transparent;
      }

      .workspace-shell__nav {
        width: 290px;
        padding: 1.25rem 1rem 1rem;
        border-right: 1px solid rgba(19, 36, 58, 0.12);
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(245, 248, 252, 0.86)),
          rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(16px);
        box-shadow: 18px 0 48px rgba(15, 23, 42, 0.08);
        display: grid;
        grid-template-rows: auto auto 1fr auto;
        gap: 1rem;
      }

      .workspace-shell__brand h2,
      .workspace-shell__toolbar h1 {
        margin: 0;
      }

      .workspace-shell__brand p,
      .workspace-shell__toolbar-label,
      .workspace-shell__user span {
        color: #5c6a7e;
      }

      .workspace-shell__eyebrow,
      .workspace-shell__toolbar-label {
        margin: 0 0 0.35rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.72rem;
      }

      .workspace-shell__footer {
        display: grid;
        gap: 1rem;
        align-self: end;
      }

      .workspace-shell__user {
        padding: 1rem;
        border-radius: 20px;
        background: rgba(236, 242, 248, 0.9);
      }

      .workspace-shell__user p,
      .workspace-shell__user span {
        margin: 0;
      }

      .workspace-shell__user p {
        font-weight: 700;
        color: #172334;
      }

      .workspace-shell__logout {
        width: 100%;
        min-height: 46px;
        border-radius: 16px;
      }

      .workspace-shell__content {
        background: transparent;
      }

      .workspace-shell__toolbar {
        position: sticky;
        top: 0;
        z-index: 5;
        display: flex;
        align-items: center;
        min-height: 88px;
        padding: 1rem 1.5rem;
        background: rgba(250, 251, 252, 0.55);
        border-bottom: 1px solid rgba(19, 36, 58, 0.08);
        backdrop-filter: blur(12px);
      }

      .workspace-shell__page {
        padding: 1rem 1rem 2rem;
      }

      a[mat-list-item] {
        border-radius: 16px;
        margin-bottom: 0.35rem;
      }

      a[mat-list-item].is-active {
        background: rgba(15, 108, 189, 0.12);
      }

      @media (max-width: 900px) {
        .workspace-shell__nav {
          width: 250px;
        }

        .workspace-shell__toolbar {
          min-height: 76px;
          padding: 1rem;
        }

        .workspace-shell__page {
          padding: 0.75rem 0.75rem 1.5rem;
        }
      }
    `,
  ],
})
export class AppShellComponent {
  private readonly router = inject(Router);
  protected readonly authFacade = inject(AuthFacade);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  private readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', exact: true },
    { label: 'RxJS', route: '/rxjs', exact: true },
    { label: 'Admin', route: '/admin', exact: true, adminOnly: true },
  ];

  protected readonly visibleNavItems = computed(() =>
    this.navItems.filter((item) => !item.adminOnly || this.authFacade.isAdmin()),
  );

  protected readonly pageTitle = computed(() => {
    const url = this.currentUrl();

    if (url.startsWith('/admin')) return 'Admin Control';
    if (url.startsWith('/dashboard')) return 'Operations Overview';
    return 'Commerce Workspace';
  });

  protected logout(): void {
    this.authFacade.logout();
  }
}
