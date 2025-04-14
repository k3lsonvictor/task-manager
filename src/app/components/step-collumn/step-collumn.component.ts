import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Card, CardComponent } from '../card/card.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { StepService } from '../../api/services/step-service.service';
import { ModalService } from '../../services/modals/modal.service';
import { FormsModule } from '@angular/forms';

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
  imports: [CardComponent, DragDropModule, MatIconModule, FormsModule],
  templateUrl: './step-collumn.component.html',
  styleUrl: './step-collumn.component.css',
})
export class StepCollumnComponent {
  @Input() cards: any[] = [];
  @Input() step!: Step;

  setTitleStep: string = "";

  isEditing: boolean = false;


  constructor(private modalService: ModalService, private stepService: StepService) { }

  ngOnInit() {
    this.setTitleStep = this.step.name;
    console.log(this.cards)
  }

  onCreateStep() {
    this.stepService.setSelectedStep(this.step);
    this.modalService.openModal("createModal")
  }

  onDeleteStep() {
    this.stepService.deleteStep(this.step.id).subscribe({
      next: () => {
        this.stepService.notifyStepUpdate();
        this.stepService.getSteps(this.step.projectId);
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
