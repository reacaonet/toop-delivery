import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubordinateComponent } from './subordinate.component';

describe('SubordinateComponent', () => {
  let component: SubordinateComponent;
  let fixture: ComponentFixture<SubordinateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubordinateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubordinateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
