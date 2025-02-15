import { Component } from '@angular/core';
import { Step, StepCollumnComponent } from '../../components/step-collumn/step-collumn.component';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ButtonComponent } from '../../components/button/button.component';
import { Card, CardComponent } from '../../components/card/card.component';
import { TaskService } from '../../services/api/task-service.service';
import { CardService } from '../../services/api/card.service';
import { ModalService } from '../../services/modals/modal.service';
import { CreateModalComponent } from '../../components/modals/create-modal/create-card-modal.component';
import { DetailCardModalComponent } from '../../components/modals/detail-modal/detail-card-modalcomponent';

@Component({
  selector: 'app-home',
  imports: [StepCollumnComponent, DragDropModule, ButtonComponent, CreateModalComponent, DetailCardModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  steps: Step[] = [];

  selectedCard: Card | null = null;

  detailModal: string = 'detailModal';

  detailCardModalIsOpen: boolean = false;
  createCardModalIsOpen: boolean = false;

  constructor(private cardService: CardService, private taskService: TaskService, private modalService: ModalService) {
    this.modalService.modalsState$.subscribe(state => {
      this.detailCardModalIsOpen = state["detailModal"] || false;
      this.createCardModalIsOpen = state["createModal"] || false;
    })
    
    // this.modalService.selectedCard$.subscribe(state => {
    //   this.selectedCard = state;
    // });
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
