import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyDeliveryComponent } from './company-delivery.component';

describe('CompanyDeliveryComponent', () => {
  let component: CompanyDeliveryComponent;
  let fixture: ComponentFixture<CompanyDeliveryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyDeliveryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyDeliveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
