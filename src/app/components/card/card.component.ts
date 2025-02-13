import { Component, Input } from '@angular/core';

interface Card {
  title: string
}
@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() card!: Card;
}
