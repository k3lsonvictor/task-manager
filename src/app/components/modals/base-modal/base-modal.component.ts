import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalService } from '../../../services/modals/modal.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-base-modal',
  imports: [MatIconModule],
  templateUrl: './base-modal.component.html',
  styleUrl: './base-modal.component.css'
})
export class BaseModalComponent {
  @Input() modalType!: string;
  @Output() closed = new EventEmitter<string>(); // 🔹 Criação do Output

  constructor(private modalService: ModalService) {}

  onCloseModal() {
    this.modalService.closeModal(this.modalType);
    this.closed.emit(); // 🔹 Emite o evento para o pai
  }
}
