import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Card } from '../../components/card/card.component';

@Injectable({
  providedIn: 'root'
})

export class ModalService {
  private modalsState = new BehaviorSubject<{ [key: string]: boolean }>({});
  modalsState$ = this.modalsState.asObservable();

  openModal(modalId: string) {
    this.modalsState.next({ ...this.modalsState.value, [modalId]: true });
  }

  closeModal(modalId: string) {
    this.modalsState.next({ ...this.modalsState.value, [modalId]: false });
  }
}
