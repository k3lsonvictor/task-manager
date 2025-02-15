import { Injectable } from '@angular/core';
import { Card } from '../../components/card/card.component';
import { HttpClient } from '@angular/common/http';
import { Step } from '../../components/step-collumn/step-collumn.component';
import { BehaviorSubject, Observable } from 'rxjs';

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

  private apiUrl = 'http://localhost:3000/tasks';
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
    return new Observable(observer => {
      this.http.get<any[]>(this.apiUrl).subscribe({
        next: (tasks) => {
          // Encontrar o step correto
          const step = tasks.find(task => task.id === card.stepId);

          if (step) {
            const updatedCards = [...step.cards, card]; // Adicionar o novo card ao array de cards

            // Atualizar apenas esse step no JSON Server
            this.http.patch(`${this.apiUrl}/${step.id}`, { cards: updatedCards }).subscribe({
              next: (response) => {
                observer.next(response);
                observer.complete();
              },
              error: (err) => observer.error(err)
            });
          } else {
            observer.error('Step não encontrado');
          }
        },
        error: (err) => observer.error(err),
      });
    });
  }

  removeCard(card: Card): Observable<any> {
    return new Observable(observer => {
      this.http.get<any[]>(this.apiUrl).subscribe({
        next: (tasks: Step[]) => {
          // Encontrar o step correto
          const step = tasks.find(task => task.id === card.stepId);

          if (step) {
            // Remover o card do array de cards do step
            const updatedCards = step.cards.filter((c: Card) => c.id !== card.id);
            console.log(updatedCards)
            // Atualizar o JSON Server com o novo array de cards
            this.http.patch(`${this.apiUrl}/${step.id}`, { cards: updatedCards }).subscribe({
              next: (response) => {
                observer.next(response);
                observer.complete();
              },
              error: (err) => observer.error(err)
            });
          } else {
            observer.error('Step não encontrado');
          }
        },
        error: (err) => observer.error(err),
      });
    });
  }
}
