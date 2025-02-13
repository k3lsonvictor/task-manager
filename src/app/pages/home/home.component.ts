import { Component, QueryList, ViewChildren } from '@angular/core';
import { Card, Step, StepCollumnComponent } from '../../components/step-collumn/step-collumn.component';
import { CdkDragDrop, CdkDropList, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-home',
  imports: [StepCollumnComponent, DragDropModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  steps = [
    { title: 'Backlog', cards: [{ title: 'Tarefa 1' }, { title: 'Tarefa 2' }] },
    { title: 'Em Andamento', cards: [{ title: 'Tarefa 3' }] },
    { title: 'Concluído', cards: [{ title: 'Tarefa 4' }] }
  ];

  drop(event: CdkDragDrop<{ title: string }[]>) {
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
