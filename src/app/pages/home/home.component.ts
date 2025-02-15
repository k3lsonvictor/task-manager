import { Component } from '@angular/core';
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

@Component({
  selector: 'app-home',
  imports: [StepCollumnComponent, DragDropModule, ButtonComponent, CreateModalComponent, DetailCardModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  project!: Project;
  steps: Step[] = [];

  selectedCard: Card | null = null;

  detailModal: string = 'detailModal';

  detailCardModalIsOpen: boolean = false;
  createCardModalIsOpen: boolean = false;

  constructor(private route: ActivatedRoute, private stepService: StepService, private modalService: ModalService, private projectsService: ProjectsService) {
    this.modalService.modalsState$.subscribe(state => {
      this.detailCardModalIsOpen = state["detailModal"] || false;
      this.createCardModalIsOpen = state["createModal"] || false;
    })
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
  }
}
