import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';

  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.setSession(res))
    );
  }

  register(userData: any) {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap(res => this.setSession(res))
    );
  }

  // ← AGREGADO: guarda el token que viene de Google OAuth
  saveToken(token: string): void {
    localStorage.setItem('botisfy_token', token);
  }

  private setSession(authResult: any) {
    localStorage.setItem('botisfy_token', authResult.access_token);
    localStorage.setItem('botisfy_user', JSON.stringify(authResult.user));
  }

  logout() {
    localStorage.removeItem('botisfy_token');
    localStorage.removeItem('botisfy_user');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('botisfy_token');
  }

  getToken(): string | null {
    return localStorage.getItem('botisfy_token');
  }

  getUser(): any {
    const user = localStorage.getItem('botisfy_user');
    return user ? JSON.parse(user) : null;
  }
}