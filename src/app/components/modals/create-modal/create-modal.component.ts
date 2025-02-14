import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CreateNewModalService } from '../../../services/modals/create-new-modal.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CardService } from '../../../services/api/card.service';
import { Step } from '../../step-collumn/step-collumn.component';
import { TaskService } from '../../../services/api/task-service.service';

@Component({
  selector: 'app-create-modal',
  imports: [MatIconModule, ReactiveFormsModule],
  templateUrl: './create-modal.component.html',
  styleUrl: './create-modal.component.css'
})
export class CreateModalComponent {
  newCardModal: boolean = false;
  selStep!: Step | null;

  @Input() step!: Step;

  title = new FormControl<string>("")
  description = new FormControl<string>("")

  constructor(private createNewModalService: CreateNewModalService, private cardService: CardService, private taskService: TaskService) {
    this.createNewModalService.newModal$.subscribe(value => {
      this.newCardModal = value;
    })
  }

  ngOnInit() {
    this.cardService.selectedStep$.subscribe(selectedStep => {
      this.selStep = selectedStep
    });
  }

  createCard() {
    if(this.selStep === null){
      return
    }
    const newCard = this.cardService.createCard(this.title.value!, "", this.selStep.id, this.description.value!);

    this.cardService.addCard(newCard).subscribe({
      next: () => {
        this.taskService.notifyTaskUpdate();
        this.taskService.getTasks(); // Atualiza as tarefas após a criação do card
        this.createNewModalService.closeModal();
      },
      error: (err) => console.error('Erro ao criar card:', err)
    });
  }

  closeModal() {
    this.createNewModalService.closeModal();
  }
}
