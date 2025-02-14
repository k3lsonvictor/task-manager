import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Card } from '../../components/card/card.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private selectedCardSource = new BehaviorSubject<Card | null>(null);
  selectedCard$ = this.selectedCardSource.asObservable();

  openModal(card: Card) {
    this.selectedCardSource.next(card);
  }

  closeModal() {
    this.selectedCardSource.next(null);
  }
}
