import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthFacade } from '@ecommerce/core';
import { PageShellComponent } from '@ecommerce/shared-ui';

@Component({
  selector: 'feature-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PageShellComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authFacade = inject(AuthFacade);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly isLoading = signal(false);
  readonly showPassword = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly loginSuccess = signal(false);

  readonly features = [
    'Zero-trust architecture',
    'JWT refresh token rotation',
    'Role-based access control',
    'End-to-end encryption',
  ];

  form!: FormGroup;
  private returnUrl = '/dashboard';

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      remember: [false],
    });

    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
  }

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    const { email, password, remember } = this.form.getRawValue();
    this.authFacade
      .login({ email: email.trim().toLowerCase(), password, remember })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.loginSuccess.set(true);
          setTimeout(() => this.router.navigateByUrl(this.returnUrl), 600);
        },
        error: (err: { status?: number }) => this.handleError(err),
      });
  }

  showError(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  fieldError(field: string): string | null {
    const control = this.form.get(field);
    if (!control || control.valid || !control.touched) return null;

    if (control.hasError('required')) {
      return field === 'email' ? 'Email is required.' : 'Password is required.';
    }

    if (field === 'email' && control.hasError('email')) {
      return 'Please enter a valid email address.';
    }

    if (field === 'password' && control.hasError('minlength')) {
      return 'Password must be at least 8 characters.';
    }

    return null;
  }

  private handleError(err: { status?: number }): void {
    const map: Record<number, string> = {
      401: 'Incorrect email or password. Please try again.',
      403: 'Your account has been locked. Contact your administrator.',
      429: 'Too many attempts. Please wait a moment and retry.',
      500: 'A server error occurred. Please try again later.',
    };

    this.errorMessage.set(
      map[err?.status ?? 0] ?? 'An unexpected error occurred. Please try again.',
    );
  }
}
