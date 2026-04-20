import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  surname: string;
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  verificationCode: string;
}

export interface ResendCodeRequest {
  email: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    surname?: string;
    isActive?: boolean;
  };
}

export interface RegisterUserResponse {
  token?: string;
  user: {
    id: string;
    email: string;
    name: string;
    surname: string;
    isActive: boolean;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth'; // Actualizado
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (this.isBrowser) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        this.currentUserSubject.next(response.user);
      }),
    );
  }

  register(data: RegisterRequest): Observable<RegisterUserResponse> {
    return this.http.post<RegisterUserResponse>(`${this.apiUrl}/signup`, data);
  }

  verifyEmail(data: VerifyEmailRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/verify`, data);
  }

  resendVerificationCode(data: ResendCodeRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/resend`, data, { 
        responseType: 'text' as 'json' 
    });
}

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser) {
      return false;
    }
    const token = localStorage.getItem('token');
    return !!token && token !== 'undefined' && token !== 'null';
  }

  getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage.getItem('token');
  }

  private loadUserFromStorage(): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      const user = localStorage.getItem('user');
      if (user) {
        this.currentUserSubject.next(JSON.parse(user));
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
}
