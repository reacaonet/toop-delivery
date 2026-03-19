import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductBankComponent } from './product-bank.component';

describe('ProductBankComponent', () => {
  let component: ProductBankComponent;
  let fixture: ComponentFixture<ProductBankComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductBankComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
