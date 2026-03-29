import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';
import { ApiUser, SwitchMapService } from '../../services/switchmap.service';

type Topic = {
  id: string;
  title: string;
  summary: string;
  analogy: string;
  useCases: string[];
  warning: string;
};

@Component({
  selector: 'switchmap-modal2',
  standalone: true,
  templateUrl: './switchmap-modal2.component.html',
  styleUrls: ['./switchmap-modal2.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    MatDialogModule,
  ],
})
export class SwitchMapComponent2 {
  private readonly destroyRef = inject(DestroyRef);
  private readonly switchMapService = inject(SwitchMapService);
  protected readonly data = inject<Topic>(MAT_DIALOG_DATA);

  protected readonly value = signal('');
  protected readonly isLoading = signal(false);
  protected readonly users = signal<ApiUser[]>([]);
  protected readonly explanation = signal('Type a name to call searchUsers() using switchMap.');

  constructor() {
    toObservable(this.value)
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((inputValue) => {
          const term = inputValue.trim();

        //   if (!term) {
        //     this.isLoading.set(false);
        //     return of({
        //       users: [],
        //       explanation: 'Type a name to call searchUsers() using switchMap.',
        //     });
        //   }

          this.isLoading.set(true);
          return this.switchMapService.searchUsers(term).pipe(
            switchMap((users) =>
              of({
                users,
                explanation: users.length
                  ? `searchUsers("${term}") returned ${users.length} user(s).`
                  : `searchUsers("${term}") returned no users.`,
              }),
            ),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        this.isLoading.set(false);
        this.users.set(result.users);
        this.explanation.set(result.explanation);
      });
  }

  protected updateValue(inputValue: string): void {
    this.value.set(inputValue);
  }

  protected clearValue(): void {
    this.value.set('');
  }
}
