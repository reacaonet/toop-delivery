import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabloidComponent } from './tabloid.component';

describe('TabloidComponent', () => {
  let component: TabloidComponent;
  let fixture: ComponentFixture<TabloidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabloidComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabloidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
