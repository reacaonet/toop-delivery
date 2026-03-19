import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentswithoutOrdersComponent } from './paymentswithout-orders.component';

describe('PaymentswithoutOrdersComponent', () => {
  let component: PaymentswithoutOrdersComponent;
  let fixture: ComponentFixture<PaymentswithoutOrdersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentswithoutOrdersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentswithoutOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
