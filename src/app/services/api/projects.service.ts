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

  constructor(private http: HttpClient) { }

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
}
