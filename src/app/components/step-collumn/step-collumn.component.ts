import { Component, ElementRef, HostListener, Input, ViewChild, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CardComponent } from '../card/card.component';
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
  createdAt?: string;
}

@Component({
  selector: 'app-step-collumn',
  imports: [CardComponent, DragDropModule, MatIconModule, FormsModule, CommonModule],
  templateUrl: './step-collumn.component.html',
  styleUrl: './step-collumn.component.css',
})
export class StepCollumnComponent implements OnInit, OnChanges {
  @ViewChild('titleInput') titleInputRef!: ElementRef;
  @Input() cards: any[] = [];
  @Input() step!: Step;

  setTitleStep: string = "";
  isEditing: boolean = false;
  isDeleting: boolean = false;
  isLoading: boolean = false;

  constructor(
    private modalService: ModalService,
    private stepService: StepService,
    private cardService: CardService
  ) { }

  ngOnInit() {
    this.cardService.updatedCard$.subscribe((updatedCard) => {
      if (updatedCard === this.step.id) {
        this.isLoading = true;
      } else if (updatedCard && typeof updatedCard === 'object' && updatedCard !== null && 'stageId' in updatedCard && updatedCard.stageId === this.step.id) {
        this.stepService.notifyStepUpdate();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.isLoading = true;
    if (this.step) {
      this.setTitleStep = this.step.name;
      this.isLoading = false;
    }
  }

  trackByTaskId(index: number, card: any): any {
    return card.id;
  }

  onCreateStep() {
    this.stepService.setSelectedStep(this.step);
    this.modalService.openModal("createCardModal");
  }

  onDeleteStep() {
    this.isDeleting = true;
    this.stepService.deleteStep(this.step.id).subscribe({
      next: () => {
        this.stepService.notifyStepUpdate();
      }
    });
  }

  onEditStep() {
    this.isEditing = true;
    setTimeout(() => {
      this.titleInputRef?.nativeElement.focus();
    });
  }

  onConfirmEditStep() {
    if (this.setTitleStep.trim()) {
      this.stepService.editStepName(this.setTitleStep, this.step.id).subscribe({
        next: () => {
          this.step.name = this.setTitleStep;
          this.isEditing = false;
          this.stepService.notifyStepUpdate();
        }
      });
    }
  }

  onCancelEditStep() {
    this.isEditing = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.titleInputRef?.nativeElement && this.setTitleStep !== this.step.name) {
      const clickedInsideTitle = this.titleInputRef.nativeElement.contains(event.target);
      if (!clickedInsideTitle && this.isEditing && this.setTitleStep) {
        this.isEditing = false;
        this.stepService.editStepName(this.setTitleStep, this.step.id).subscribe({
          next: () => {
            this.step.name = this.setTitleStep;
            this.isEditing = false;
            this.stepService.notifyStepUpdate();
          }
        });
      }
    }
  }
}