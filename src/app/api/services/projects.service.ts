import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ApiService } from './api.service';

export interface Project {
  id: string;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private projectSource = new BehaviorSubject<Project | null>(null);
  currentProject$ = this.projectSource.asObservable();

  private projectUpdatedSource = new Subject<void>();
  projectUpdated$ = this.projectUpdatedSource.asObservable();

  private createProjectSubject = new Subject<void>();
  createProject$ = this.createProjectSubject.asObservable();

  private selectedProjectSource = new BehaviorSubject<string | null>(null);
  selectedProject$ = this.selectedProjectSource.asObservable();

  constructor(private apiService: ApiService) { }

  triggerCreateProject() {
    this.createProjectSubject.next();
  }

  projetSelected(id: string) {
    this.selectedProjectSource.next(id);
  }

  notifyProjectUpdate() {
    this.projectUpdatedSource.next();
  }

  setProject(project: Project) {
    this.projectSource.next(project);
  }

  getProject(projectId: string): Observable<any> {
    return this.apiService.get(`projects/${projectId}`);
  }

  getProjects(): Observable<any> {
    return this.apiService.get(`projects`);
  }

  createProject(name: string, description: string): Observable<any> {
    return this.apiService.post('projects', { name, description });
  }

  editProject(name: string, description: string, id: string): Observable<any> {
    return this.apiService.patch(`projects/${id}`, { name, description });
  }

  deleteProject(id: string): Observable<any> {
    return this.apiService.delete(`projects/${id}`);
  }
}
