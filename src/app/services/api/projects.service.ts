import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface Project {
  id: string;
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private apiUrl = 'http://localhost:3000/projects';
  private projectSource = new BehaviorSubject<Project | null>(null);
  currentProject$ = this.projectSource.asObservable();

  private projectUpdatedSource = new Subject<void>();
  projectUpdated$ = this.projectUpdatedSource.asObservable();

  private createProjectSubject = new Subject<void>();
  createProject$ = this.createProjectSubject.asObservable();

  private selectedProjectSource = new BehaviorSubject<string | null>(null);
  selectedProject$ = this.selectedProjectSource.asObservable();

  triggerCreateProject() {
    this.createProjectSubject.next();
  }

  constructor(private http: HttpClient) { }

  projetSelected(id: string) {
    this.selectedProjectSource.next(id);
  }

  notifyProjectUpdate() {
    this.projectUpdatedSource.next();
  }

  setProject(project: Project) {
    this.projectSource.next(project);
  }

  getProject(projectId: string) {
    return this.http.get<any>(`${this.apiUrl}/${projectId}`);
  }

  getProjects() {
    return this.http.get<any>(`${this.apiUrl}`);
  }

  createProject(title: string, description: string): Observable<any> {
    const newProject = { title, description, id: crypto.randomUUID() };
    return new Observable(observer => {
      this.http.post(this.apiUrl, newProject).subscribe({
        next: (response) => {
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  editProject(title: string, description: string, id: string): Observable<any> {
    console.log("entrou")
    return new Observable(observer => {
      this.http.patch(`${this.apiUrl}/${id}`, { title: title, description: description }).subscribe({
        next: (response) => {
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      })
    })
  }

  deleteProject(id: string): Observable<any> {
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
}
