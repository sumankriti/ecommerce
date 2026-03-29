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

export interface PostPayload {
  title: string;
  body: string;
  userId: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

@Injectable({
  providedIn: 'root',
})
export class SwitchMapService {
  private readonly http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${API_URL}/users`);
  }

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${API_URL}/posts`);
  }

  searchUsers(term: string): Observable<ApiUser[]> {
    return this.http.get<ApiUser[]>(`${API_URL}/users`, {
      params: {
        name_like: term,
      },
    });
  }

  getPostsByUserIdMatchedUser(userId: number): Observable<ApiPost[]> {
    return this.http.get<ApiPost[]>(`${API_URL}/posts`, {
      params: {
        userId,
      },
    });
  }

  createPost(payload: PostPayload): Observable<any> {
    return this.http.post(`${API_URL}/posts`, payload);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${API_URL}/users/${id}`);
  }

  getPostsByUserId(userId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${API_URL}/posts?userId=${userId}`);
  }

}
