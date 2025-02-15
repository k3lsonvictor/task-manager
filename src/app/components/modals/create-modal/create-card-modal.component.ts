import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CardService } from '../../../services/api/card.service';
import { Step } from '../../step-collumn/step-collumn.component';
import { StepService } from '../../../services/api/step-service.service';
import { BaseModalComponent } from '../base-modal/base-modal.component';
import { ModalService } from '../../../services/modals/modal.service';

@Component({
  selector: 'app-create-modal',
  imports: [BaseModalComponent, ReactiveFormsModule],
  templateUrl: './create-card-modal.component.html',
  styleUrl: './create-card-modal.component.css',
})
export class CreateModalComponent {
  selStep!: Step | null;

  title = new FormControl<string>("")
  description = new FormControl<string>("")

  constructor(
    private modalService: ModalService,
    private cardService: CardService,
    private stepService: StepService
  ) {}

  ngOnInit() {
    this.stepService.selectedStep$.subscribe(selectedStep => {
      this.selStep = selectedStep
    });
  }

  createCard() {
    if (this.selStep === null) {
      return
    }
    const newCard = this.cardService.createCard(this.title.value!, "", this.selStep.id, this.description.value!);

    this.cardService.addCard(newCard).subscribe({
      next: () => {
        this.stepService.notifyStepUpdate();
        if (this.selStep?.projectId) {
          this.stepService.getSteps(this.selStep.projectId);
        }
        this.modalService.closeModal("createModal");
      },
      error: (err) => console.error('Erro ao criar card:', err)
    });
  }

  closeModal() {
    this.modalService.closeModal("createModal");
  }
}
