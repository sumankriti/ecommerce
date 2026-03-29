import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { ApiPost, ApiUser, SwitchMapService } from '../../services/switchmap.service';

type Topic = {
  id: string;
  title: string;
  summary: string;
  analogy: string;
  useCases: string[];
  warning: string;
};

type PostWithUser = ApiPost & { matchedUser: ApiUser | null };
type SearchResult = {
  matchedUser: ApiUser | null;
  posts: PostWithUser[];
};

@Component({
  selector: 'switchmap-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './switchmap-modal.component.html',
  styleUrls: ['./switchmap-modal.component.scss'],
})
export class SwitchMapDialogComponent {
  protected readonly data = inject<Topic>(MAT_DIALOG_DATA);
  private readonly destroyRef = inject(DestroyRef);
  private readonly switchMapService = inject(SwitchMapService);

  protected readonly value = signal('');
  protected readonly activeSearchTerm = signal('');
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly matchedUser = signal<ApiUser | null>(null);
  protected postsWithMatchedUsers: PostWithUser[] = [];

  constructor() {
    toObservable(this.value)
      .pipe(
        debounceTime(350),
        map((term) => term.trim()),
        distinctUntilChanged(),
        tap(() => {
          this.errorMessage.set(null);
          this.isLoading.set(true);
        }),
        switchMap((term) => {
          this.activeSearchTerm.set(term);

          if (!term) {
            this.matchedUser.set(null);
            return of<SearchResult>({
              matchedUser: null,
              posts: [],
            });
          }

          return this.switchMapService.searchUsers(term).pipe(
            switchMap((users) => {
              const matchedUser = users[0];

              if (!matchedUser) {
                return of<SearchResult>({
                  matchedUser: null,
                  posts: [],
                });
              }

              return this.switchMapService.getPostsByUserIdMatchedUser(matchedUser.id).pipe(
                map((posts) => ({
                  matchedUser,
                  posts: posts.map((post) => ({
                    ...post,
                    matchedUser,
                  })),
                })),
              );
            }),
          );
        }),
        tap(() => this.isLoading.set(false)),
        catchError(() => {
          this.isLoading.set(false);
          this.matchedUser.set(null);
          this.errorMessage.set('Unable to load search results right now.');
          return of<SearchResult>({
            matchedUser: null,
            posts: [],
          });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        this.matchedUser.set(result.matchedUser);
        this.postsWithMatchedUsers = result.posts;
      });
  }

  protected updateValue(nextValue: string): void {
    this.value.set(nextValue);
  }

  protected clearValue(): void {
    this.value.set('');
  }
}
