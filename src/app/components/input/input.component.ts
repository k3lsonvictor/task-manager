import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  imports: [ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css'
})
export class InputComponent {
  @Input() label: string = "";
  @Input() control!: FormControl<string | null>;
  @Input() type: string = 'text';
  @Input() placeholder: string = "";
}
