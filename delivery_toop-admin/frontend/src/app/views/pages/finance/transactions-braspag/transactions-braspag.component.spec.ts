import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionsBraspagComponent } from './transactions-braspag.component';

describe('TransactionsBraspagComponent', () => {
  let component: TransactionsBraspagComponent;
  let fixture: ComponentFixture<TransactionsBraspagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionsBraspagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionsBraspagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
