import { Injectable } from '@angular/core';
import { JwtPayload } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private accessToken: string | null = null;

  set(token: string): void {
    this.accessToken = token;
  }

  clear(): void {
    this.accessToken = null;
  }

  get(): string | null {
    return this.accessToken;
  }

  decode(token: string = this.accessToken ?? ''): JwtPayload | null {
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(payload.padEnd(payload.length + (4 - payload.length % 4) % 4, '='));
      return JSON.parse(json) as JwtPayload;
    } catch {
      return null;
    }
  }

  isExpired(bufferSeconds = 30): boolean {
    const payload = this.decode();
    if (!payload) return true;
    return payload.exp < Date.now() / 1000 + bufferSeconds;
  }

  secondsUntilExpiry(): number {
    const payload = this.decode();
    if (!payload) return 0;
    return Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
  }

  getRoles(): string[] {
    return this.decode()?.roles ?? [];
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getRoles();
    return roles.some((role) => userRoles.includes(role));
  }
}
