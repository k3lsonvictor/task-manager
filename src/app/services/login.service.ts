import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../api/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private authStatus = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private router: Router, private apiService: ApiService) { }

  login(email: string, password: string): Observable<{ access_token: string, userId: string }> {
    return this.apiService.post<{ access_token: string, userId: string }>('signIn', { email, password }).pipe(
      tap(response => {
        console.log('Token e userId retornados do backend:', response);  // Verifique os valores aqui
        if (response?.access_token) {
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('userId', response.userId);  // Salve o userId também
          this.authStatus.next(true);
        } else {
          console.error('Access token não encontrado');
        }
      })
    );
  }


  logout(): void {
    localStorage.removeItem('token');
    this.authStatus.next(false);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): Observable<boolean> {
    return this.authStatus.asObservable();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
}
