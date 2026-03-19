import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerCouponComponent } from './customer-coupon.component';

describe('CustomerCouponComponent', () => {
  let component: CustomerCouponComponent;
  let fixture: ComponentFixture<CustomerCouponComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerCouponComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerCouponComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
