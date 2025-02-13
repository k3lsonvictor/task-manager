import { Component } from '@angular/core';
import { StepCollumnComponent } from '../../components/step-collumn/step-collumn.component';

@Component({
  selector: 'app-home',
  imports: [StepCollumnComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
}
