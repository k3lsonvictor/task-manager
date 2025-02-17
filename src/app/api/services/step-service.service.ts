import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ApiService } from './api.service';
import { Step } from '../../components/step-collumn/step-collumn.component';
import { map } from 'rxjs/operators';

interface createStepRequest {
  name: string;
  projectId: string;
  description?: string;
}
@Injectable({
  providedIn: 'root',
})
export class StepService {
  private selectedStepSource = new BehaviorSubject<Step | null>(null);
  selectedStep$ = this.selectedStepSource.asObservable();

  private stepUpdatedSource = new Subject<void>();
  stepUpdated$ = this.stepUpdatedSource.asObservable();

  constructor(private apiService: ApiService) { }

  setSelectedStep(step: Step) {
    this.selectedStepSource.next(step);
  }

  notifyStepUpdate() {
    this.stepUpdatedSource.next();
  }

  getSteps(projectId: string): Observable<Step[]> {
    return this.apiService.get<Step[]>(`stages/${projectId}`).pipe(
      map((steps: Step[]) => steps.filter(step => step.projectId === projectId))
    );
  }

  createStep({ projectId, name, description }: createStepRequest): Observable<any> {
    return this.apiService.post('stages', { projectId, name, description });
  }

  deleteStep(id: string): Observable<any> {
    return this.apiService.delete(`stages/${id}`);
  }

  editStepName(name: string, id: string): Observable<any> {
    return this.apiService.patch(`stages/${id}`, { name });
  }
}
