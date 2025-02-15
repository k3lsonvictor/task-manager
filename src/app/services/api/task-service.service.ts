import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Observer, Subject } from 'rxjs';
import { Step } from '../../components/step-collumn/step-collumn.component';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/tasks';

  private selectedStepSource = new BehaviorSubject<Step | null>(null);
  selectedStep$ = this.selectedStepSource.asObservable();

  private taskUpdatedSource = new Subject<void>();
  taskUpdated$ = this.taskUpdatedSource.asObservable();

  constructor(private http: HttpClient) {}

  setSelectedStep(step: Step) {
    this.selectedStepSource.next(step);
  }

  notifyTaskUpdate() {
    this.taskUpdatedSource.next();
  }

  getTasks(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  editTaskName(title: string, id: string): Observable<any> {
    return new Observable(observer => {
      this.http.get<any[]>(this.apiUrl).subscribe({
        next: (task) => {
          const step = task.find(task => task.id === id);
          console.log(step)

          if (step) {
            const updatedStep = { ...step, title };
            console.log("encontrou o step", step, updatedStep)

            this.http.patch(`${this.apiUrl}/${step.id}`, { title }).subscribe({
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