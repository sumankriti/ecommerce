import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

const API_URL = 'https://jsonplaceholder.typicode.com';

export type ApiUser = {
  id: number;
  name: string;
  username: string;
  email: string;
};

export type ApiPost = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

@Injectable({
  providedIn: 'root',
})
export class SwitchMapService {
  private readonly http = inject(HttpClient);

  getUsers(): Observable<ApiUser[]> {
    return this.http.get<ApiUser[]>(`${API_URL}/users`);
  }

  searchUsers(term: string): Observable<ApiUser[]> {
    return this.http.get<ApiUser[]>(`${API_URL}/users`, {
      params: {
        name_like: term,
      },
    });
  }

  getPostsByUserId(userId: number): Observable<ApiPost[]> {
    return this.http.get<ApiPost[]>(`${API_URL}/posts`, {
      params: {
        userId,
      },
    });
  }
}
