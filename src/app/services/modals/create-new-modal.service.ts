import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreateNewModalService {
private newModalSouce = new BehaviorSubject<boolean>(false);
  newModal$ = this.newModalSouce.asObservable();

  openModal(value: boolean) {
    this.newModalSouce.next(value);
  }

  closeModal() {
    this.newModalSouce.next(false);
  }
}
