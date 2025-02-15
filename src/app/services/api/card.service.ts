import { Injectable } from '@angular/core';
import { Card } from '../../components/card/card.component';
import { HttpClient } from '@angular/common/http';
import { Step } from '../../components/step-collumn/step-collumn.component';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private selectedStepSource = new BehaviorSubject<Step | null>(null);
  selectedStep$ = this.selectedStepSource.asObservable();

  private selectedCardSource = new BehaviorSubject<Card | null>(null);
  selectedCard$ = this.selectedCardSource.asObservable();

  selectCard(card: Card) {
    this.selectedCardSource.next(card);
  }

  private fetchSteps(): Observable<Step[]> {
    return this.http.get<Step[]>(this.apiUrl);
  }

  private apiUrl = 'https://task-manager-json-service-1.onrender.com/tasks';
  constructor(private http: HttpClient) { }

  formatDateToBrazilian(date: Date): string {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  createCard(title: string, tag: string = 'tag-exemplo', stepId: string, description?: string): Card {
    return {
      title,
      tag,
      limiteDate: this.formatDateToBrazilian(new Date()),
      stepId,
      id: crypto.randomUUID(),
      description
    };
  }

  addCard(card: Card): Observable<any> {
    return this.fetchSteps().pipe(
      map(steps => steps.find(step => step.id === card.stepId)),
      switchMap(step => {
        if (!step) throw new Error('Step não encontrado');
        return this.http.patch(`${this.apiUrl}/${step.id}`, { cards: [...step.cards, card] });
      })
    );
  }

  updateStepCard(cardId: string, newStepId: string): Observable<any> {
    return this.fetchSteps().pipe(
      switchMap(steps => {
        const oldStep = steps.find(step => step.cards.some(card => card.id === cardId));
        const newStep = steps.find(step => step.id === newStepId);
        if (!oldStep || !newStep) throw new Error('Step não encontrado');

        const card = oldStep.cards.find(card => card.id === cardId);
        if (!card) throw new Error('Card não encontrado');

        return this.http.patch(`${this.apiUrl}/${oldStep.id}`, {
          cards: oldStep.cards.filter(c => c.id !== cardId)
        }).pipe(
          switchMap(() => this.http.patch(`${this.apiUrl}/${newStep.id}`, {
            cards: [...newStep.cards, { ...card, stepId: newStepId }]
          }))
        );
      })
    );
  }

  removeCard(card: Card): Observable<any> {
    return this.fetchSteps().pipe(
      switchMap(steps => {
        const step = steps.find(s => s.id === card.stepId);
        if (!step) throw new Error('Step não encontrado');
        return this.http.patch(`${this.apiUrl}/${step.id}`, {
          cards: step.cards.filter(c => c.id !== card.id)
        });
      })
    );
  }
}
