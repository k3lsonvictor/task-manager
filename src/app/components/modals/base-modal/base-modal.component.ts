import { Component } from '@angular/core';
import { ModalService } from '../../../services/modals/modal.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-base-modal',
  imports: [MatIconModule],
  templateUrl: './base-modal.component.html',
  styleUrl: './base-modal.component.css'
})
export class BaseModalComponent {
  constructor(private modalService: ModalService) {}

  closeModal() {
    this.modalService.closeModal();
  }
}
