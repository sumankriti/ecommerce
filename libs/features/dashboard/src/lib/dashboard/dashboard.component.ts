import { Component } from '@angular/core';
import { PageShellComponent } from '@ecommerce/shared-ui';

@Component({
  selector: 'feature-dashboard',
  standalone: true,
  imports: [PageShellComponent],
  template: `
    <shared-page-shell
      eyebrow="Operations"
      title="Commerce dashboard"
      subtitle="This feature comes from the dashboard library and consumes shared UI plus core auth guards."
    >
      <p>Protected dashboard content is now served from an Nx-style feature library.</p>
    </shared-page-shell>
  `,
})
export class DashboardComponent {}
