import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  projectId: string;
}
@Injectable({
  providedIn: 'root'
})
export class TagsService {

  constructor(private apiService: ApiService) { }

  getTags(projectId: string): Observable<Tag[]> {
    return this.apiService.get(`tags/project/${projectId}`);
  }

  getTag(id: string): Observable<Tag> {
    return this.apiService.get(`tags/${id}`);
  }

}
