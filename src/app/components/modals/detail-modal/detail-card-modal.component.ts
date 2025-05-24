import { Component, EventEmitter, HostListener, Output, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ModalService } from '../../../services/modals/modal.service';
import { MatIconModule } from '@angular/material/icon';
import { Card } from '../../card/card.component';
import { BaseModalComponent } from '../base-modal/base-modal.component';
import { CardService } from '../../../api/services/card.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../button/button.component';
import { Tag, TagsService } from '../../../api/services/tags.service';
import { ProjectsService } from '../../../api/services/projects.service';
import { CommonModule } from '@angular/common';
import { StepService } from '../../../api/services/step-service.service';

type SimpleCard = Omit<Card, 'position' | "limiteDate">;

@Component({
  selector: 'app-detail-card-modal',
  imports: [BaseModalComponent, MatIconModule, FormsModule, CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './detail-card-modal.component.html',
  styleUrl: './detail-card-modal.component.css'
})
export class DetailCardModalComponent implements OnInit {
  @ViewChild('titleInput') titleInputRef!: ElementRef;
  @ViewChild('descriptionInput') descriptionInputRef!: ElementRef;
  selectedCard: SimpleCard | null = null;
  setTitleCard: string = "";
  setDescriptionCard: string = "";
  currentProjectId: string = "";

  isEditingCardTitle: boolean = false;
  isEditingDescriptionCard: boolean = false;

  tags: Tag[] = [];

  createNewTag: boolean = false;

  tagName = new FormControl<string>('');
  tagColor = new FormControl<string>('');

  constructor(
    private modalService: ModalService,
    private cardService: CardService,
    private tagsService: TagsService,
    private projectsService: ProjectsService,
    private stepService: StepService,
  ) { }

  ngOnInit() {
    // Observa o card selecionado
    this.cardService.selectedCard$.subscribe(state => {
      this.selectedCard = state;
      if (this.selectedCard?.title) {
        this.setTitleCard = this.selectedCard.title;
      }
      if (this.selectedCard?.description) {
        this.setDescriptionCard = this.selectedCard.description;
      }
    });

    // Observa o projeto atual
    this.projectsService.currentProject$.subscribe(state => {
      if (state) {
        this.currentProjectId = state.id;
        this.loadTags(state.id);
      }
    });

    // Caso queira pegar o id do projeto pela URL (fallback)
    if (!this.currentProjectId) {
      const projectId = window.location.pathname.split('/').pop();
      if (projectId) {
        this.currentProjectId = projectId;
        this.loadTags(projectId);
      } else {
        console.error('ID do projeto não encontrado na URL');
      }
    }
  }

  loadTags(projectId: string) {
    this.tagsService.getTags(projectId).subscribe(tags => {
      this.tags = tags;
    });
  }

  onCreateTag() {
    this.createNewTag = !this.createNewTag;
  }

  createTag() {
    this.tagsService.createTag(this.tagName.value!, this.tagColor.value!, this.currentProjectId).subscribe({
      next: (newTag) => {
        this.tags.push(newTag);
        this.createNewTag = false;
      },
      error: (error) => {
        console.error('Erro ao criar tag:', error);
      }
    });
  }

  onEditCardTitle() {
    this.isEditingCardTitle = true;
    setTimeout(() => {
      this.titleInputRef.nativeElement.focus();
    }, 0);
  }

  onEditDescriptionCard() {
    this.isEditingDescriptionCard = true;
    setTimeout(() => {
      this.descriptionInputRef.nativeElement.focus();
    }, 0);
  }

  onEditTagCard(tag: Tag) {
    if (this.selectedCard) {
      if (this.selectedCard.tagId === tag.id) {
        this.selectedCard.tagId = "";
        this.cardService.updateCard(this.selectedCard.id, {
          tagId: null,
          stageId: this.selectedCard.stageId
        }).subscribe({
          next: () => {
            this.cardService.getCard(this.selectedCard!.id).subscribe(card => {
              this.stepService.notifyStepUpdate();
              this.cardService.selectCard(card);
            });
          }
        });
        return;
      }
      this.selectedCard.tagId = tag.id;
      this.cardService.updateCard(this.selectedCard.id, {
        tagId: tag.id,
        stageId: this.selectedCard.stageId
      }).subscribe({
        next: () => {
          this.cardService.getCard(this.selectedCard!.id).subscribe(card => {
            this.stepService.notifyStepUpdate();
            this.cardService.selectCard(card);
          });
        }
      });
    }
  }

  closeModal() {
    this.modalService.closeModal("detailModal");
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Verifica se o clique ocorreu dentro do título
    if (this.titleInputRef?.nativeElement) {
      const clickedInsideTitle = this.titleInputRef.nativeElement.contains(event.target);
      if (!clickedInsideTitle && this.isEditingCardTitle && this.selectedCard) {
        this.isEditingCardTitle = false;
        this.cardService.updateCard(this.selectedCard.id, {
          title: this.setTitleCard,
          tagId: this.selectedCard?.tagId,
          stageId: this.selectedCard?.stageId,
        }).subscribe({
          next: () => {
            this.cardService.getCard(this.selectedCard!.id).subscribe(card => {
              this.stepService.notifyStepUpdate();
              this.cardService.selectCard(card);
            });
          }
        });
      }
    }

    // Verifica se o clique ocorreu dentro da descrição
    if (this.descriptionInputRef?.nativeElement) {
      const clickedInsideDescription = this.descriptionInputRef.nativeElement.contains(event.target);
      if (!clickedInsideDescription && this.isEditingDescriptionCard) {
        this.isEditingDescriptionCard = false;
        this.cardService.updateCard(this.selectedCard!.id, {
          description: this.setDescriptionCard,
          tagId: this.selectedCard?.tagId ? this.selectedCard?.tagId : "",
          stageId: this.selectedCard?.stageId,
        }).subscribe({
          next: () => {
            this.cardService.getCard(this.selectedCard!.id).subscribe(card => {
              this.stepService.notifyStepUpdate();
              this.cardService.selectCard(card);
            });
          }
        });
      }
    }
  }
}