import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitBraspagComponent } from './split-braspag.component';

describe('SplitBraspagComponent', () => {
  let component: SplitBraspagComponent;
  let fixture: ComponentFixture<SplitBraspagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplitBraspagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitBraspagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
