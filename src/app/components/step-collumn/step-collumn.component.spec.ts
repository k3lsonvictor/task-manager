import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepCollumnComponent } from './step-collumn.component';

describe('StepCollumnComponent', () => {
  let component: StepCollumnComponent;
  let fixture: ComponentFixture<StepCollumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepCollumnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepCollumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
