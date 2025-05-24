import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailCardModalComponent } from './detail-card-modal.component';

describe('ModalComponent', () => {
  let component: DetailCardModalComponent;
  let fixture: ComponentFixture<DetailCardModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailCardModalComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DetailCardModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
