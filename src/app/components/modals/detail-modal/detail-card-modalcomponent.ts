import { Component, EventEmitter, Output } from '@angular/core';
import { ModalService } from '../../../services/modals/modal.service';
import { MatIconModule } from '@angular/material/icon';
import { Card } from '../../card/card.component';
import { BaseModalComponent } from '../base-modal/base-modal.component';
import { CardService } from '../../../api/services/card.service';

@Component({
  selector: 'app-detail-card-modal',
  imports: [BaseModalComponent, MatIconModule],
  templateUrl: './detail-card-modal.component.html',
  styleUrl: './detail-card-modal.component.css'
})
export class DetailCardModalComponent {
  selectedCard: Card | null = null;
  
  constructor(private modalService: ModalService, private cardService: CardService) {
    this.cardService.selectedCard$.subscribe(state => {
      this.selectedCard = state;
    });
  }

  closeModal() {
    this.modalService.closeModal("detailModal");
  }
}
