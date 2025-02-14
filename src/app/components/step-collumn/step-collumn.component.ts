import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Card, CardComponent } from '../card/card.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { ModalService } from '../../services/modals/modal.service';
import { CreateModalComponent } from '../modals/create-modal/create-modal.component';
import { CreateNewModalService } from '../../services/modals/create-new-modal.service';
import { CardService } from '../../services/api/card.service';

export interface Step {
  title: string;
  id: string;
  cards: Card[];
}

@Component({
  selector: 'app-step-collumn',
  imports: [CardComponent, DragDropModule, MatIconModule, CreateModalComponent],
  templateUrl: './step-collumn.component.html',
  styleUrl: './step-collumn.component.css',
})
export class StepCollumnComponent {
  @Input() cards: any[] = [];
  @Input() step!: Step;

  newCardModal: boolean = false;

  constructor(private createNewModal: CreateNewModalService, private cardService: CardService) {
    this.createNewModal.newModal$.subscribe(value => {
      this.newCardModal = value;
    });
  }

  @Output() createTask = new EventEmitter<string>();

  onCreateTask() {
    this.cardService.setSelectedStep(this.step);
    this.createNewModal.openModal(true)
  }
}
