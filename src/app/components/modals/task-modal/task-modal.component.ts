import { Component } from '@angular/core';
import { ModalService } from '../../../services/modals/modal.service';
import { MatIconModule } from '@angular/material/icon';
import { Card } from '../../card/card.component';

@Component({
  selector: 'app-modal',
  imports: [MatIconModule],
  templateUrl: './task-modal.component.html',
  styleUrl: './task-modal.component.css'
})
export class ModalComponent {
  selectedCard: Card | null = null;

  constructor(private modalService: ModalService) {
    this.modalService.selectedCard$.subscribe(state => {
      this.selectedCard = state;
    });
  }

  closeModal() {
    this.modalService.closeModal();
  }
}
