import { Component, EventEmitter, Input, Output } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Card, CardComponent } from '../card/card.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { StepService } from '../../api/services/step-service.service';
import { ModalService } from '../../services/modals/modal.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardService } from '../../api/services/card.service';

export interface Step {
  name: string;
  id: string;
  tasks: {
    title: string,
    id: string,
    position: number;
    tag: {
      name: string;
      color: string;
      id: string;
    } | null;
  }[];
  projectId: string;
}

@Component({
  selector: 'app-step-collumn',
  imports: [CardComponent, DragDropModule, MatIconModule, FormsModule, CommonModule],
  templateUrl: './step-collumn.component.html',
  styleUrl: './step-collumn.component.css',
})
export class StepCollumnComponent {
  @Input() cards: any[] = [];
  @Input() step!: Step;

  setTitleStep: string = "";

  isEditing: boolean = false;

  isDeleting: boolean = false;

  isLoading: boolean = false;


  constructor(private modalService: ModalService, private stepService: StepService, cardService: CardService) {
    cardService.updatedCard$.subscribe((updatedCard) => {
      console.log('updatedCard:', updatedCard);
      if (updatedCard === this.step.id) {
        this.isLoading = true;
      }
      else {
        if (updatedCard) { // Verifica se updatedCard não é null ou undefined
          console.log('Card atualizado:', updatedCard);
          if (typeof updatedCard === 'object' && updatedCard !== null && 'stageId' in updatedCard && updatedCard.stageId === this.step.id) {
            console.log('Card atualizado:', updatedCard);
            this.stepService.notifyStepUpdate();
            // setTimeout(() => {
            //   this.isLoading = false;

            // }, 1000)
          }
        }
      }
    });
  }

  trackByTaskId(index: number, card: any): any {
    return card.id; // Substitua 'id' pelo campo único da sua tarefa
  }

  // ngOnInit() {
  //   this.isLoading = true;
  //   this.setTitleStep = this.step.name;
  //   if (this.step.tasks.length > 0) {
  //     this.isLoading = false;
  //   }
  // }

  ngOnChanges() {
    this.isLoading = true;
    if (this.step) {
      this.setTitleStep = this.step.name;
      if (this.step.tasks.length > 0) {
        this.isLoading = false;
      }
    }
  }

  onCreateStep() {
    this.stepService.setSelectedStep(this.step);
    this.modalService.openModal("createCardModal")
  }

  onDeleteStep() {
    this.isDeleting = true;
    this.stepService.deleteStep(this.step.id).pipe(
      finalize(() => {
        this.isDeleting = false;
      })
    ).subscribe({
      next: () => {
        // Notifica a atualização e busca os steps atualizados
        this.stepService.notifyStepUpdate();
        this.stepService.getSteps(this.step.projectId).subscribe({
          next: (steps) => {
            console.log('Steps atualizados:', steps);
          }
        });
      }
    })
  }

  onEditStep() {
    this.isEditing = true;
  }

  onConfirmEditStep() {
    if (this.setTitleStep.trim()) {
      this.stepService.editStepName(this.setTitleStep, this.step.id).subscribe({
        next: () => {
          this.step.name = this.setTitleStep; // Atualiza a exibição
          this.isEditing = false;
          this.stepService.notifyStepUpdate();
        }
      });
    }
  }

  onCancelEditStep() {
    this.isEditing = false;
  }
}
