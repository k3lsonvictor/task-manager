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

  private updatedCardSource = new BehaviorSubject<Card | string | null>(null);
  updatedCard$ = this.updatedCardSource.asObservable();


  constructor(private apiService: ApiService) { }

  getCard(id: string): Observable<Card> {
    return this.apiService.get<Card>(`tasks/${id}`);
  }

  selectCard(card: Card | null) {
    this.selectedCardSource.next(card);
    console.log('🔵 Card selecionado:', card);
  }

  createCard(title: string, tagId: string | null, stageId: string, description?: string): Card {
    return {
      title,
      tagId,
      limiteDate: new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      stageId,
      id: crypto.randomUUID(),
      description,
    };
  }

  addCard(card: Card, stepId: string): Observable<any> {
    console.log('🔴 addCard foi chamado?');

    return this.apiService.post(`tasks`, {
      title: card.title,
      description: card.description,
      stageId: stepId,
      tagId: card.tagId,
    }).pipe(
      map(response => {
        console.log('✅ Task criada:', response);
        this.selectCard(null);
        return response;
      })
    );
  }


  updateStepCard(cardId: string, newStepId: string, newPosition: number, tagId: string | null): Observable<any> {
    return this.apiService.patch(`tasks/${cardId}`, {
      stageId: newStepId,
      taskId: cardId,
      position: newPosition,
      tagId: tagId,
    });
  }
  updateCard(cardId: string, updates: Partial<{ title: string; description: string; stageId: string; position: number; tagId: string | null }>): Observable<any> {
    // Emit a signal to indicate the update process has started (e.g., for loading state)
    this.updatedCardSource.next(updates.stageId ?? null);

    const updatedCard = { ...this.selectedCardSource.value, ...updates } as Card;
    this.selectCard(updatedCard);

    return this.apiService.patch(`tasks/${cardId}`, updates).pipe(
      switchMap(() => this.getCard(cardId)),
      map((card: Card) => {
        // Emit the updated card to indicate the update process is complete
        this.selectCard(card);
        this.updatedCardSource.next(card);
        return card;
      })
    );
  }


  removeCard(id: string): Observable<any> {
    return this.apiService.delete(`tasks/${id}`);
  }
}
