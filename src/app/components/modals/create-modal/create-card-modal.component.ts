import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CardService } from '../../../services/api/card.service';
import { Step } from '../../step-collumn/step-collumn.component';
import { StepService } from '../../../services/api/step-service.service';
import { BaseModalComponent } from '../base-modal/base-modal.component';
import { ModalService } from '../../../services/modals/modal.service';
import { Project, ProjectsService } from '../../../services/api/projects.service';

@Component({
  selector: 'app-create-modal',
  imports: [BaseModalComponent, ReactiveFormsModule],
  templateUrl: './create-card-modal.component.html',
  styleUrl: './create-card-modal.component.css',
})
export class CreateModalComponent {
  @Input() modalType!: string;
  selStep!: Step | null;
  @Input() project!: Project | null;
  typeModal: boolean = false;

  title = new FormControl<string>("")
  description = new FormControl<string>("")

  constructor(
    private modalService: ModalService,
    private cardService: CardService,
    private stepService: StepService,
    private projectsService: ProjectsService,
  ) {
    this.modalService.modalsState$.subscribe(state => {
      this.typeModal = state["createProjectModal"] || false;
    })
  }

  ngOnInit() {
    console.log(this.typeModal);

    this.stepService.selectedStep$.subscribe(selectedStep => {
      this.selStep = selectedStep
    });

    if (this.modalType === "editProjectModal" && this.project) {
      console.log(this.project)
      this.title.setValue(this.project.title);
      this.description.setValue(this.project?.description ?? "");
    }
  }

  editProjectModal() {
    if (this.project === null) {
      console.log("aqui")
      return
    }
    console.log("aqui")
    this.projectsService.editProject(this.title.value!, this.description.value!, this.project.id).subscribe({
      next: () => {
        this.projectsService.notifyProjectUpdate();
        this.closeModal();
      }
    })
  }

  onCreateProject() {
    if (this.modalType !== "createProjectModal") {
      return;
    }
    this.projectsService.createProject(this.title.value!, this.description.value!).subscribe({
      next: () => {
        this.projectsService.notifyProjectUpdate();
        this.closeModal();
      },
      error: (err) => console.error('Erro ao criar projeto:', err)
    });
  }

  createCard() {
    if (this.modalType !== "createModal" || this.selStep === null) {
      return;
    }
    const newCard = this.cardService.createCard(this.title.value!, "", this.selStep.id, this.description.value!);

    this.cardService.addCard(newCard).subscribe({
      next: () => {
        this.stepService.notifyStepUpdate();
        if (this.selStep?.projectId) {
          this.stepService.getSteps(this.selStep.projectId);
        }
        this.modalService.closeModal("createModal");
      },
      error: (err) => console.error('Erro ao criar card:', err)
    });
  }

  closeModal() {
    console.log(this.modalType);
    this.modalService.closeModal(this.modalType);
  }
}
