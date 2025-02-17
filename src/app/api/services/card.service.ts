import { Injectable } from '@angular/core';
import { Card } from '../../components/card/card.component';
import { Step } from '../../components/step-collumn/step-collumn.component';
import { BehaviorSubject, Observable, switchMap, map } from 'rxjs';
import { ApiService } from './api.service';
import { StepService } from './step-service.service';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  private selectedCardSource = new BehaviorSubject<Card | null>(null);
  selectedCard$ = this.selectedCardSource.asObservable();

  constructor(private apiService: ApiService) { }

  getCard(id: string): Observable<Card> {
    return this.apiService.get<Card>(`tasks/${id}`);
  }

  selectCard(card: Card | null) {
    this.selectedCardSource.next(card);
  }

  createCard(title: string, tag: string = 'tag-exemplo', stepId: string, description?: string): Card {
    return {
      title,
      tag,
      limiteDate: new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      stepId,
      id: crypto.randomUUID(),
      description,
    };
  }

  addCard(card: Card, stepId: string): Observable<any> {
    console.log('🔴 addCard foi chamado?');
  
    return this.apiService.post(`tasks`, {
      title: card.title,
      description: card.description,
      stageId: stepId
    }).pipe(
      map(response => {
        console.log('✅ Task criada:', response);
        this.selectCard(null);
        return response;
      })
    );
  }
  

  updateStepCard(cardId: string, newStepId: string, newPosition: number): Observable<any> {
    return this.apiService.patch(`tasks/${cardId}`, {
      stageId: newStepId,
      taskId: cardId,
      position: newPosition // 🔥 Envia a posição correta para o backend
    });
  }
  

  removeCard(id: string): Observable<any> {
    return this.apiService.delete(`tasks/${id}`);
  }
}
