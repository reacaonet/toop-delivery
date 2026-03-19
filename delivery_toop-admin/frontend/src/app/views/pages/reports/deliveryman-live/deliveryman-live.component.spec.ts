import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverymanLiveComponent } from './deliveryman-live.component';

describe('DeliverymanLiveComponent', () => {
  let component: DeliverymanLiveComponent;
  let fixture: ComponentFixture<DeliverymanLiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliverymanLiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliverymanLiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
