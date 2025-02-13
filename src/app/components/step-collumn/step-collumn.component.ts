import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

export interface Step {
 title: string;
 cards: Card[];
}

export interface Card {
  title: string;
}

@Component({
  selector: 'app-step-collumn',
  imports: [CardComponent, DragDropModule],
  templateUrl: './step-collumn.component.html',
  styleUrl: './step-collumn.component.css'
})
export class StepCollumnComponent {
  @Input() cards: any[] = [];

  // Lista conectada com outras colunas
  // @Input() connectedLists: string[] = [];

  @Input() step!: Step;

  // @Output() stepsUpdated = new EventEmitter<Step[]>(); // Emite os steps atualizados

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['step'] && changes['step'].currentValue) {
  //     console.log('Step atualizado:', changes['step'].currentValue);
  //   }
  // }
}
