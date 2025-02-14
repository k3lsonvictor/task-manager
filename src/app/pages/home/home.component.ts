import { Component } from '@angular/core';
import { Step, StepCollumnComponent } from '../../components/step-collumn/step-collumn.component';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ButtonComponent } from '../../components/button/button.component';
import { Card } from '../../components/card/card.component';
import { TaskService } from '../../services/api/task-service.service';
import { CardService } from '../../services/api/card.service';
import { ModalService } from '../../services/modals/modal.service';
import { ModalComponent } from '../../components/modals/task-modal/task-modal.component';
import { CreateModalComponent } from '../../components/modals/create-modal/create-modal.component';

@Component({
  selector: 'app-home',
  imports: [StepCollumnComponent, DragDropModule, ButtonComponent, ModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  steps: Step[] = [];

  selectedCard: Card | null = null;
  // newCardModalSource: boolean = false;

  constructor(private cardService: CardService, private taskService: TaskService, private modalService: ModalService) {
    this.modalService.selectedCard$.subscribe(state => {
      this.selectedCard = state;
    });
  }

  closeModal() {
    this.modalService.closeModal();
  }

  ngOnInit() {
    this.taskService.getTasks().subscribe(tasks => {
      this.steps = tasks;
    });

    this.taskService.taskUpdated$.subscribe(() => {
      this.taskService.getTasks().subscribe(tasks => {
        this.steps = tasks;
      });
    });
  }

  createTask(stepTitle: string) {
    const step = this.steps.find(s => s.title === stepTitle);
    if (step) {
      this.cardService.addCard(this.cardService.createCard("exemplo", "tag-exemplo", step.id))
    }
  }

  createStep() {
    console.log("aqui")
    this.steps.push({ title: "Nova Etapa", id: "10", cards: [] });
  }

  drop(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
}
