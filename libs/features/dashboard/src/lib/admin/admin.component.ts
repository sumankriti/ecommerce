import { Component } from '@angular/core';
import { PageShellComponent } from '@ecommerce/shared-ui';

@Component({
  selector: 'feature-admin',
  standalone: true,
  imports: [PageShellComponent],
  template: `
    <shared-page-shell
      eyebrow="Admin"
      title="Role-protected admin area"
      subtitle="Only users with ADMIN or SUPER_ADMIN roles should reach this route once the backend enforces matching authorization."
    >
      <p>This route demonstrates a feature slice guarded by both authentication and role checks.</p>
    </shared-page-shell>
  `,
})
export class AdminComponent {}
