import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Observer, Subject } from 'rxjs';

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

  editTaskName(title: string, id: string): Observable<any> {
    console.log("entrou")
    return new Observable(observer => {
      console.log("entrou")
      this.http.get<any[]>(this.apiUrl).subscribe({
        next: (task) => {
          const step = task.find(task => task.id === id);
          console.log(step)

          if (step) {
            const updatedStep = {...step, title};
            console.log("encontrou o step", step, updatedStep)
            
            this.http.patch(`${this.apiUrl}/${step.id}`, {title}).subscribe({
              next: (response) => {
                observer.next(response)
                console.log("atualizou")
              },
              error: (err) => observer.error(err),
            })
          } else {
            observer.error("Step não encontrado")
          }
        },
        error: (err) => observer.error(err),
      })
    })
  }
}