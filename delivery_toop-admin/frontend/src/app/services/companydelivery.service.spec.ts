import { TestBed } from '@angular/core/testing';

import { CompanyDeliveryService } from './companyDelivery.service';

describe('CompanyDeliveryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CompanyDeliveryService = TestBed.get(CompanyDeliveryService);
    expect(service).toBeTruthy();
  });
});
