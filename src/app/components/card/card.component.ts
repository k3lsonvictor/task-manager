import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalService } from '../../services/modals/modal.service';
import { MatIconModule } from '@angular/material/icon';
import { CardService } from '../../services/api/card.service';
import { StepService } from '../../services/api/step-service.service';

export interface Card {
  title: string;
  tag?: string;
  limiteDate: string;
  stepId: string;
  id: string;
  description?: string;
}

@Component({
  selector: 'app-card',
  imports: [MatIconModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() card!: Card;
  @Input() cards!: Card[];

  @Output() openCard = new EventEmitter();

  detailCardModalIsOpen: boolean = false;

  constructor(private modalService: ModalService, private cardService: CardService, private stepService: StepService) {
  }

  deleteStep(event: Event) {
    event.stopPropagation();
    this.cardService.removeCard(this.card).subscribe({
      next: () => {
        this.stepService.notifyStepUpdate();
      }
    });
  }

  openDetailCardModal() {
    this.cardService.selectCard(this.card);
    this.modalService.openModal("detailModal");
  }
}
