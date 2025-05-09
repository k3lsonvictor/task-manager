import { Component, EventEmitter, HostListener, Output, ElementRef, ViewChild } from '@angular/core';
import { ModalService } from '../../../services/modals/modal.service';
import { MatIconModule } from '@angular/material/icon';
import { Card } from '../../card/card.component';
import { BaseModalComponent } from '../base-modal/base-modal.component';
import { CardService } from '../../../api/services/card.service';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../button/button.component';
import { Tag, TagsService } from '../../../api/services/tags.service';
import { ProjectsService } from '../../../api/services/projects.service';
import { CommonModule } from '@angular/common';
import { StepService } from '../../../api/services/step-service.service';

type SimpleCard = Omit<Card, 'stageId' | 'position' | "limiteDate">;

@Component({
  selector: 'app-detail-card-modal',
  imports: [BaseModalComponent, MatIconModule, FormsModule, CommonModule],
  templateUrl: './detail-card-modal.component.html',
  styleUrl: './detail-card-modal.component.css'
})
export class DetailCardModalComponent {
  @ViewChild('titleInput') titleInputRef!: ElementRef; // Referência ao elemento do input
  @ViewChild('descriptionInput') descriptionInputRef!: ElementRef;
  selectedCard: SimpleCard | null = null;
  setTitleCard: string = "";
  setDescriptionCard: string = "";
  currentProjectId: string = "";

  isEditingCardTitle: boolean = false;
  isEditingDescriptionCard: boolean = false;

  tags: Tag[] = [];


  constructor(
    private modalService: ModalService,
    private cardService: CardService,
    private tagsService: TagsService,
    private projectsService: ProjectsService,
    private StepService: StepService,
  ) {
    this.cardService.selectedCard$.subscribe(state => {
      this.selectedCard = state;
    });
    this.projectsService.currentProject$.subscribe(state => {
      if (state) {
        this.currentProjectId = state.id;
      }
    })
    const projectId = window.location.pathname.split('/').pop();
    console.log('ID do projeto:', projectId);  // Log para verificar
    if (projectId) {
      this.tagsService.getTags(projectId).subscribe(tags => {
        console.log('Tags do projeto:', tags, this.selectedCard);  // Log para verificar
        this.tags = tags;  // Salva as tags no projeto
      });
    } else {
      console.error('ID do projeto não encontrado na URL');
    }
  }

  ngOnInit() {
    if (this.selectedCard?.title) {
      this.setTitleCard = this.selectedCard.title;
    }
    if (this.selectedCard?.description) {
      this.setDescriptionCard = this.selectedCard.description;
    }
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
        }).subscribe({
          next: () => {
            this.cardService.getCard(this.selectedCard!.id).subscribe(card => {
              this.StepService.notifyStepUpdate();
              this.cardService.selectCard(card);
            });
          }
        });
        return;
      }
      this.selectedCard.tagId = tag.id;
      this.cardService.updateCard(this.selectedCard.id, {
        tagId: tag.id,
      }).subscribe({
        next: () => {
          this.cardService.getCard(this.selectedCard!.id).subscribe(card => {
            this.StepService.notifyStepUpdate();
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
        }).subscribe({
          next: () => {
            this.cardService.getCard(this.selectedCard!.id).subscribe(card => {
              this.StepService.notifyStepUpdate();
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
          description: this.setDescriptionCard
        }).subscribe({
          next: () => {
            this.cardService.getCard(this.selectedCard!.id).subscribe(card => {
              this.StepService.notifyStepUpdate();
              this.cardService.selectCard(card);
            });
          }
        });
      }
    }
  }
}
