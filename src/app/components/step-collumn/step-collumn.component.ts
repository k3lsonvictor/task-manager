import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Card, CardComponent } from '../card/card.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { CreateModalComponent } from '../modals/create-modal/create-card-modal.component';
import { CreateNewModalService } from '../../services/modals/create-new-modal.service';
import { CardService } from '../../services/api/card.service';
import { TaskService } from '../../services/api/task-service.service';
import { BaseModalComponent } from '../modals/base-modal/base-modal.component';
import { ModalService } from '../../services/modals/modal.service';

export interface Step {
  title: string;
  id: string;
  cards: Card[];
}

@Component({
  selector: 'app-step-collumn',
  imports: [CardComponent, DragDropModule, MatIconModule],
  templateUrl: './step-collumn.component.html',
  styleUrl: './step-collumn.component.css',
})
export class StepCollumnComponent {
  @Input() cards: any[] = [];
  @Input() step!: Step;
  @Output() createTask = new EventEmitter<string>();
  newCardModal: boolean = false;

  constructor(private modalService: ModalService, private cardService: CardService, private taskService: TaskService) {}

  onCreateTask() {
    this.taskService.setSelectedStep(this.step);
    this.modalService.openModal("createModal")
  }

  onEditTask() {
    this.taskService.editTaskName("novo título", this.step.id).subscribe({
      next: () => {
        this.taskService.notifyTaskUpdate();
      }
    })
  }
}
