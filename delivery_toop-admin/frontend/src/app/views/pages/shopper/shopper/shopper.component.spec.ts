import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopperComponent } from './shopper.component';

describe('ShopperComponent', () => {
  let component: ShopperComponent;
  let fixture: ComponentFixture<ShopperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShopperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
