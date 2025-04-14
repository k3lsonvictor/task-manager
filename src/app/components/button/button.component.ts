import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class ButtonComponent {
  @Input() clickFunction: (() => void) | null = null;
  @Input() content!: string;
  @Input() customClass: string = '';

  ngOnInit() {
    console.log('Button component initialized with content:', this.content);
    console.log('Button component initialized with class:', this.customClass);
  }
}
