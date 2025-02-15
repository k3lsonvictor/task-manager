import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Step, StepCollumnComponent } from '../../components/step-collumn/step-collumn.component';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ButtonComponent } from '../../components/button/button.component';
import { Card } from '../../components/card/card.component';
import { StepService } from '../../services/api/step-service.service';
import { ModalService } from '../../services/modals/modal.service';
import { CreateModalComponent } from '../../components/modals/create-modal/create-card-modal.component';
import { DetailCardModalComponent } from '../../components/modals/detail-modal/detail-card-modalcomponent';
import { Project, ProjectsService } from '../../services/api/projects.service';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CardService } from '../../services/api/card.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [
    StepCollumnComponent,
    DragDropModule,
    ButtonComponent,
    CreateModalComponent,
    DetailCardModalComponent,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  project!: Project;
  steps: Step[] = [];

  selectedCard: Card | null = null;

  detailCardModalIsOpen: boolean = false;
  createCardModalIsOpen: boolean = false;

  isEditingProject: boolean = false;

  isCreatingProject: boolean = false;

  @Input() set creteProject(activate: boolean) {
    if (activate) {
      this.onCreateProject();
    }
  }

  activeStepId: string | null = null;

  onDragEnter(stepId: string) {
    console.log("Entrou no step:", stepId);
    this.activeStepId = stepId;
    this.cdr.detectChanges();  // Forçar atualização do Angular
  }
  
  onDragLeave() {
    console.log("Saiu do step");
    this.activeStepId = null;
    this.cdr.detectChanges();
  }

  constructor(private cdr: ChangeDetectorRef, private route: ActivatedRoute, private stepService: StepService, private modalService: ModalService, private projectsService: ProjectsService, private cardService: CardService) {
    this.modalService.modalsState$.subscribe(state => {
      this.detailCardModalIsOpen = state["detailModal"] || false;
      this.createCardModalIsOpen = state["createModal"] || false;
      this.isEditingProject = state["editProjectModal"] || false;
      this.isCreatingProject = state["createProjectModal"] || false;
    })
    this.projectsService.currentProject$.subscribe(state => {
      if (state) {
        this.project = state;
      }
    })
    this.projectsService.createProject$.subscribe(() => {
      this.onCreateProject();
    });
  }

  onEditProject() {
    this.isEditingProject = true;
    this.modalService.openModal("editProjectModal")
  }

  onCreateProject() {
    this.isCreatingProject = true;
    this.modalService.openModal("createProjectModal")
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const projectId = params.get('projectId');
      if (projectId) {
        console.log('Mudou para o projeto:', projectId);

        this.projectsService.getProject(projectId).subscribe(project => {
          this.project = project;

          this.projectsService.setProject(project);

          this.stepService.getSteps(project.id).subscribe(step => {
            console.log(step)
            this.steps = step;
          });
        });
      }
    });

    this.stepService.stepUpdated$.subscribe(() => {
      this.stepService.getSteps(this.project.id).subscribe(steps => {
        console.log(steps)
        this.steps = steps;
      });
    });

    this.projectsService.projectUpdated$.subscribe(() => {
      this.projectsService.getProject(this.project.id).subscribe(project => {
        this.project = project;
      })
    })
  }

  createStep() {
    const newStep: Step = { title: 'New Step', id: crypto.randomUUID(), cards: [], projectId: this.project.id };
    this.stepService.createStep(newStep).subscribe({
      next: () => {
        this.stepService.notifyStepUpdate();
        this.stepService.getSteps(this.project.id).subscribe(steps => {
          this.steps = steps;
        });
      },
    });
  }

  drop(event: CdkDragDrop<Card[]>) {
    const previousStepId = this.extractStepId(event.previousContainer.id);
    const newStepId = this.extractStepId(event.container.id);

    console.log('Step anterior:', previousStepId);
    console.log('Step novo:', newStepId);

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Atualizar o card para o novo step no backend
      const movedCard = event.container.data[event.currentIndex];
      this.updateCardStep(movedCard.id, newStepId);
    }
  }

  // Função auxiliar para extrair o ID correto do step
  private extractStepId(dropListId: string): string {
    return dropListId.replace('step-', ''); // Remove "step-" para pegar apenas o número do ID
  }

  // Método para atualizar o card no backend
  updateCardStep(cardId: string, stepId: string) {
    this.cardService.updateStepCard(cardId, stepId).subscribe({
      next: () => console.log(`Card ${cardId} atualizado para o Step ${stepId}`),
      error: err => console.error('Erro ao atualizar o card:', err)
    });
  }
}
