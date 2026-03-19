import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessFlowComponent } from './access-flow.component';

describe('AccessFlowComponent', () => {
  let component: AccessFlowComponent;
  let fixture: ComponentFixture<AccessFlowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessFlowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
