import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NocCreatedUsersComponent } from './noc-created-users.component';

describe('NocCreatedUsersComponent', () => {
  let component: NocCreatedUsersComponent;
  let fixture: ComponentFixture<NocCreatedUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NocCreatedUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NocCreatedUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
