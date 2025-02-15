import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalService } from '../../services/modals/modal.service';
import { MatIconModule } from '@angular/material/icon';
import { CardService } from '../../services/api/card.service';
import { TaskService } from '../../services/api/task-service.service';

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

  constructor(private modalService: ModalService, private cardService: CardService, private taskService: TaskService) {
  }

  deleteTask(event: Event) {
    event.stopPropagation();
    this.cardService.removeCard(this.card).subscribe({
      next: () => {
        this.taskService.notifyTaskUpdate();
      }
    });
  }

  openDetailCardModal() {
    this.cardService.selectCard(this.card);
    this.modalService.openModal("detailModal");
  }
}
