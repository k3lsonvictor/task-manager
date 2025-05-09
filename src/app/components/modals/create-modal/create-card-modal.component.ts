import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CardService } from '../../../api/services/card.service';
import { Step } from '../../step-collumn/step-collumn.component';
import { StepService } from '../../../api/services/step-service.service';
import { BaseModalComponent } from '../base-modal/base-modal.component';
import { ModalService } from '../../../services/modals/modal.service';
import { Project, ProjectsService } from '../../../api/services/projects.service';
import { CommonModule } from '@angular/common';
import { Tag, TagsService } from '../../../api/services/tags.service';

@Component({
  selector: 'app-create-modal',
  imports: [BaseModalComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './create-card-modal.component.html',
  styleUrl: './create-card-modal.component.css',
})
export class CreateModalComponent {
  @Input() modalType!: string;
  selStep!: Step | null;
  @Input() project!: Project | null;
  typeModal: boolean = false;

  title = new FormControl<string>('');
  description = new FormControl<string>('');

  tags: Tag[] = [];

  selectedTag: Tag | null = null;

  constructor(
    private modalService: ModalService,
    private cardService: CardService,
    private stepService: StepService,
    private projectsService: ProjectsService,
    private tagsService: TagsService
  ) {
    this.modalService.modalsState$.subscribe(state => {
      this.typeModal = state['createProjectModal'] || false;
    });
    const projectId = window.location.pathname.split('/').pop();
    if (projectId) {
      this.tagsService.getTags(projectId).subscribe(tags => {
        this.tags = tags;  // Salva as tags no projeto
      });
    } else {
      console.error('ID do projeto não encontrado na URL');
    }
  }

  ngOnInit() {
    this.resetForm(); // 🔥 Resetando os valores ao abrir

    this.stepService.selectedStep$.subscribe(selectedStep => {
      this.selStep = selectedStep;
    });

    if (this.modalType === 'editProjectModal' && this.project) {
      this.title.setValue(this.project.name);
      this.description.setValue(this.project?.description ?? '');
    }
  }

  editProjectModal() {
    if (!this.project) return;

    this.projectsService.editProject(this.title.value!, this.description.value!, this.project.id).subscribe({
      next: () => {
        this.projectsService.notifyProjectUpdate();
        this.closeModal();
      },
    });
  }

  onSelectedTag(tag: any) {
    console.log('Tag selecionada:', tag);
    this.selectedTag = tag;
  }

  onCreateProject() {
    if (this.modalType !== 'createProjectModal') return;

    this.projectsService.createProject(this.title.value!, this.description.value!).subscribe({
      next: () => {
        this.projectsService.notifyProjectUpdate();
        this.closeModal();
      },
      error: err => console.error('Erro ao criar projeto:', err),
    });
  }

  createCard() {
    console.log('🟡 createCard() foi chamado!');

    if (this.modalType !== 'createModal' || !this.selStep) return;

    const newCard = this.cardService.createCard(
      this.title.value!,
      this.selectedTag ? this.selectedTag.id : null,
      this.selStep.id,
      this.description.value!
    );

    this.cardService.addCard(newCard, this.selStep.id).subscribe({
      next: () => {
        console.log('✅ Card criado com sucesso!');
        this.stepService.notifyStepUpdate();
        if (this.selStep?.projectId) {
          this.stepService.getSteps(this.selStep.projectId);
        }

        this.resetForm();
        this.modalService.closeModal('createModal');
      },
      error: err => console.error('❌ Erro ao criar card:', err),
    });
  }


  closeModal() {
    console.log('Fechando modal:', this.modalType);
    console.log('Antes de resetar:', this.title.value, this.description.value);
    this.resetForm();
    console.log('Depois de resetar:', this.title.value, this.description.value);
    this.resetForm(); // 🔥 Garante que o modal reabra com os valores vazios
    this.modalService.closeModal(this.modalType);
  }

  private resetForm() {
    this.title.setValue('');
    this.description.setValue('');
  }
}
