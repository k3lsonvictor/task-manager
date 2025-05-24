import { ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Step, StepCollumnComponent } from '../../components/step-collumn/step-collumn.component';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ButtonComponent } from '../../components/button/button.component';
import { Card, SimpleCard } from '../../components/card/card.component';
import { StepService } from '../../api/services/step-service.service';
import { ModalService } from '../../services/modals/modal.service';
import { CreateModalComponent } from '../../components/modals/create-modal/create-card-modal.component';
import { DetailCardModalComponent } from '../../components/modals/detail-modal/detail-card-modal.component';
import { Project, ProjectsService } from '../../api/services/projects.service';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CardService } from '../../api/services/card.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { User, UserService } from '../../api/services/user.service';
import { Tag, TagsService } from '../../api/services/tags.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [
    StepCollumnComponent,
    DragDropModule,
    ButtonComponent,
    CreateModalComponent,
    DetailCardModalComponent,
    MatIconModule,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [
    trigger('stepAnimation', [
      // Estado inicial (void) e final (*)
      state('void', style({ opacity: 0, transform: 'translateY(-20px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      // Transição de void para o estado final
      transition('void => *', [
        animate('300ms ease-out') // Duração e curva de animação
      ])
    ])
  ]
})
export class HomeComponent {
  project!: Project;
  steps: Step[] = [];
  user!: User;

  tags: Tag[] = [];

  selectedCard: Card | null = null;

  detailCardModalIsOpen: boolean = false;
  createCardModalIsOpen: boolean = false;

  isEditingProject: boolean = false;

  isCreatingProject: boolean = false;

  newStepId: string | null = null;

  createNewTag: boolean = false;

  modalPosition = { top: 0, left: 0 };

  tagName = new FormControl<string>('');
  tagColor = new FormControl<string>('');

  tagShowDelete: string = ""

  onCreateTag() {
    this.createNewTag = !this.createNewTag;

    if (this.createNewTag) {
      // Calcula a posição do botão
      const buttonRect = this.addTagButton.nativeElement.getBoundingClientRect();
      this.modalPosition = {
        top: buttonRect.bottom + window.scrollY, // Posição abaixo do botão
        left: buttonRect.left + window.scrollX // Alinha à esquerda do botão
      };
    }
  }

  @ViewChild('addTagButton', { static: false }) addTagButton!: ElementRef;

  trackByStepId(index: number, step: any): any {
    return step.id; // Substitua 'id' pelo campo único de cada step
  }

  @Input() set creteProject(activate: boolean) {
    if (activate) {
      this.onCreateProject();
    }
  }

  activeStepId: string | null = null;

  private sortStepsByCreatedAt(steps: Step[]): Step[] {
    return steps.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
  }

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

  createTag() {
    this.tagsService.createTag(this.tagName.value!, this.tagColor.value!, this.project.id).subscribe({
      next: (newTag) => {
        console.log('Tag criada:', newTag);
        this.tags.push(newTag); // Adiciona a nova tag à lista
        this.createNewTag = false; // Fecha o modal de criação de tag
      },
      error: (error) => {
        console.error('Erro ao criar tag:', error);
      }
    });
  }

  deleteTag(tagId: string) {
    this.tagsService.deleteTag(tagId).subscribe({
      next: () => {
        console.log('Tag deletada:', tagId);
        this.tags = this.tags.filter(tag => tag.id !== tagId); // Remove a tag da lista
        this.stepService.notifyStepUpdate();
      },
      error: (error) => {
        console.error('Erro ao deletar tag:', error);
      }
    });
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private stepService: StepService,
    private modalService: ModalService,
    private projectsService: ProjectsService,
    private cardService: CardService,
    private userService: UserService,
    private tagsService: TagsService
  ) { }

  onEditProject() {
    this.isEditingProject = true;
    this.modalService.openModal("editProjectModal")
  }

  onCreateProject() {
    this.isCreatingProject = true;
    this.modalService.openModal("createProjectModal")
  }

  ngOnInit() {
    this.modalService.modalsState$.subscribe(state => {
      this.detailCardModalIsOpen = state["detailModal"] || false;
      this.createCardModalIsOpen = state["createCardModal"] || false;
      this.isEditingProject = state["editProjectModal"] || false;
      this.isCreatingProject = state["createProjectModal"] || false;
    });

    this.projectsService.currentProject$.subscribe(state => {
      if (state) {
        this.project = state;
      }
    });

    this.projectsService.createProject$.subscribe(() => {
      this.onCreateProject();
    });

    const userId = localStorage.getItem('userId');
    if (userId) {
      this.userService.getUser(userId).subscribe(user => {
        console.log('Usuário recuperado:', user);
        this.user = user;
      });
    }

    this.route.paramMap.subscribe(params => {
      const projectId = params.get('projectId');
      if (projectId && projectId !== this.project?.id) {
        console.log('Mudou para o projeto:', projectId);

        this.projectsService.getProject(projectId).subscribe(project => {
          this.project = project;

          this.projectsService.setProject(project);

          this.stepService.getSteps(project.id).subscribe(steps => {
            this.steps = this.sortStepsByCreatedAt(steps);
          });

          this.tagsService.getTags(project.id).subscribe(tags => {
            console.log('Tags do projeto:', tags);
            this.tags = tags;
          });
        });
      }
    });

    this.stepService.stepUpdated$.subscribe(() => {
      this.stepService.getSteps(this.project.id).subscribe(steps => {
        this.steps = this.sortStepsByCreatedAt(steps);
        this.cdr.detectChanges();
      });
    });

    this.projectsService.projectUpdated$.subscribe(() => {
      this.projectsService.getProject(this.project.id).subscribe(project => {
        this.project = project;
      });
    });
  }

  createStep() {

    const tempStepId = 'temp-' + Date.now();
    const tempStep = {
      id: tempStepId,
      name: 'Nova Etapa',
      tasks: [],
      createdAt: new Date().toISOString(),
      projectId: this.project.id,
    };

    // Adiciona a etapa temporária à lista de etapas
    this.steps = [...this.steps, tempStep];
    this.newStepId = tempStepId; // Define o ID para ativar a animação

    // Envia a requisição para criar a etapa no backend
    this.stepService.createStep({ name: 'Nova Etapa', projectId: this.project.id }).subscribe({
      next: (newStep) => {
        this.stepService.notifyStepUpdate();

      },
      error: () => {
        // Remove a etapa temporária em caso de erro
        this.steps = this.steps.filter((step) => step.id !== tempStepId);
        // this.newStepId = null;
      },
    });
  }


  drop(event: CdkDragDrop<SimpleCard[]>) {
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
    }

    // 🔥 Capturamos o card e a posição correta
    const movedCard = event.container.data[event.currentIndex];
    const newPosition = event.currentIndex + 1;

    // 🔥 Agora chamamos `updateStepCard` passando a posição correta
    this.cardService.updateStepCard(movedCard.id, newStepId, newPosition, movedCard.tag?.id ? movedCard.tag.id : null).subscribe({
      next: () => console.log(`Card ${movedCard.id} atualizado para o Step ${newStepId} na posição ${newPosition}`),
      error: err => console.error('Erro ao atualizar o card:', err)
    });
  }


  // Função auxiliar para extrair o ID correto do step
  private extractStepId(dropListId: string): string {
    return dropListId.replace('step-', ''); // Remove "step-" para pegar apenas o número do ID
  }

  // Método para atualizar o card no backend
  // updateCardStep(cardId: string, stepId: string) {
  //   this.cardService.updateStepCard(cardId, stepId).subscribe({
  //     next: () => console.log(`Card ${cardId} atualizado para o Step ${stepId}`),
  //     error: err => console.error('Erro ao atualizar o card:', err)
  //   });
  // }
}
