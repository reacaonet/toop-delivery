import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryRecordComponent } from './delivery-record.component';

describe('DeliveryRecordComponent', () => {
  let component: DeliveryRecordComponent;
  let fixture: ComponentFixture<DeliveryRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliveryRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
