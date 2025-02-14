import { TestBed } from '@angular/core/testing';

import { CreateNewModalService } from './create-new-modal.service';

describe('CreateNewModalService', () => {
  let service: CreateNewModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateNewModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
