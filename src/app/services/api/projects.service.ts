import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Project{
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

  constructor(private http: HttpClient) { }

  setProject(project: Project) {
    this.projectSource.next(project);
  }

  getProject(projectId: string) {
    return this.http.get<any>(`${this.apiUrl}/${projectId}`);
  }

  getProjects() {
    return this.http.get<any>(`${this.apiUrl}`);
  }
}
  