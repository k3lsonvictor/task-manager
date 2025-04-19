import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalService } from '../../services/modals/modal.service';
import { MatIconModule } from '@angular/material/icon';
import { CardService } from '../../api/services/card.service';
import { StepService } from '../../api/services/step-service.service';
import { CommonModule } from '@angular/common';

export interface Card {
  title: string;
  tagId: string | null;
  limiteDate: string;
  stageId: string;
  id: string;
  description?: string;
  position?: number;
}

export interface SimpleCard {
  title: string;
  id: string;
  position: number;
  tag: {
    id: string;
    name: string;
    color: string;
  } | null;
}

@Component({
  selector: 'app-card',
  imports: [MatIconModule, CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() card!: SimpleCard;
  @Input() cards!: SimpleCard[]; 

  @Output() openCard = new EventEmitter();

  detailCardModalIsOpen: boolean = false;

  constructor(private modalService: ModalService, private cardService: CardService, private stepService: StepService) {
  }

  ngOnInit() {
    console.log(this.card)
  }

  deleteStep(event: Event) {
    event.stopPropagation();
    this.cardService.removeCard(this.card.id).subscribe({
      next: () => {
        this.stepService.notifyStepUpdate();
      }
    });
  }

  openDetailCardModal() {
    this.cardService.getCard(this.card.id).subscribe(card => {
      // O card retornado agora está armazenado no selectedCardSource
      // A qualquer momento, você pode acessar o card via o BehaviorSubject
      this.cardService.selectCard(card);
      this.modalService.openModal("detailModal");
    });
  }
}
