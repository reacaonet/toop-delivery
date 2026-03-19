import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TypesusersComponent } from './typesusers.component';

describe('TypesusersComponent', () => {
  let component: TypesusersComponent;
  let fixture: ComponentFixture<TypesusersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TypesusersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TypesusersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
