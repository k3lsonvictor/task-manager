import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root' // Isso garante que o serviço seja injetável globalmente
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/tasks';

  constructor(private http: HttpClient) {}

  private taskUpdatedSource = new Subject<void>();  // 🔥 Subject para emitir eventos

  taskUpdated$ = this.taskUpdatedSource.asObservable();  // 🔄 Observable para os componentes assinarem

  notifyTaskUpdate() {
    this.taskUpdatedSource.next();  // 🚀 Emite o evento para atualizar tasks
  }

  getTasks(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}