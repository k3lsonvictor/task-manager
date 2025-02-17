import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { ApiService } from './api.service';

export interface User {
  id: string;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private selectedUserSource = new BehaviorSubject<User | null>(null);
  selectedUser$ = this.selectedUserSource.asObservable();

  constructor(private apiService: ApiService) { }

  // Método para selecionar um usuário (por exemplo, ao clicar em um usuário na interface)
  selectUser(user: User | null) {
    this.selectedUserSource.next(user);
  }

  // Método para criar um novo usuário
  createUser(name: string, email: string, password: string): Observable<User> {
    const newUser = {
      name,
      email,
      password, // Atenção com segurança aqui! Normalmente, você não envia senha diretamente
    };

    return this.apiService.post<User>('users', newUser).pipe(
      map(response => {
        console.log('✅ User criado:', response);
        return response;
      })
    );
  }

  // Método para buscar um usuário por ID
  getUser(id: string): Observable<User> {
    return this.apiService.get<User>(`users/${id}`).pipe(
      map(response => {
        console.log('✅ User encontrado:', response);
        this.selectUser(response); // Armazena o usuário encontrado
        return response;
      })
    );
  }

  // Método para atualizar os detalhes de um usuário
  updateUser(id: string, userData: Partial<User>): Observable<User> {
    return this.apiService.patch<User>(`users/${id}`, userData).pipe(
      map(response => {
        console.log('✅ User atualizado:', response);
        return response;
      })
    );
  }

  // Método para remover um usuário
  removeUser(id: string): Observable<any> {
    return this.apiService.delete(`users/${id}`).pipe(
      map(response => {
        console.log('✅ User removido:', response);
        return response;
      })
    );
  }
}
