import { Component, Input } from '@angular/core';
import { CreateNewModalService } from '../../../services/modals/create-new-modal.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CardService } from '../../../services/api/card.service';
import { Step } from '../../step-collumn/step-collumn.component';
import { TaskService } from '../../../services/api/task-service.service';
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

  @Input() step!: Step;

  title = new FormControl<string>("")
  description = new FormControl<string>("")

  constructor(
    private createNewModalService: CreateNewModalService,
    private modalService: ModalService,
    private cardService: CardService,
    private taskService: TaskService
  ) {
    // this.createNewModalService.newModal$.subscribe(value => {
    //   this.newCardModal = value;
    //   this.isOpen = !!value;
    // })
  }

  ngOnInit() {
    this.cardService.selectedStep$.subscribe(selectedStep => {
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
        this.taskService.notifyTaskUpdate();
        this.taskService.getTasks(); // Atualiza as tarefas após a criação do card
        this.modalService.closeModal("createModal");
      },
      error: (err) => console.error('Erro ao criar card:', err)
    });
  }

  closeModal() {
    this.modalService.closeModal("createModal");
  }
}
