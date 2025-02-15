import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Observer, Subject } from 'rxjs';
import { Step } from '../../components/step-collumn/step-collumn.component';

@Injectable({
  providedIn: 'root'
})
export class StepService {
  private apiUrl = 'http://localhost:3000/tasks';

  private selectedStepSource = new BehaviorSubject<Step | null>(null);
  selectedStep$ = this.selectedStepSource.asObservable();

  private stepUpdatedSource = new Subject<void>();
  stepUpdated$ = this.stepUpdatedSource.asObservable();

  constructor(private http: HttpClient) { }

  setSelectedStep(step: Step) {
    this.selectedStepSource.next(step);
  }

  notifyStepUpdate() {
    this.stepUpdatedSource.next();
  }

  getSteps(projectId: string): Observable<Step[]> {
    return this.http.get<Step[]>(this.apiUrl).pipe(
      map((steps: Step[]) => steps.filter(step => step.projectId === projectId))
    );
  }

  createStep(step: Step): Observable<any> {
    return new Observable(observer => {
      this.http.post(this.apiUrl, step).subscribe({
        next: (response) => {
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  deleteStep(id: string): Observable<any> {
    console.log(id)
    return new Observable(observer => {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: (response) => {
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  editStepName(title: string, id: string): Observable<any> {
    console.log(title)
    return new Observable(observer => {
      this.http.patch(`${this.apiUrl}/${id}`, { title }).subscribe({
        next: (response) => {
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }
}