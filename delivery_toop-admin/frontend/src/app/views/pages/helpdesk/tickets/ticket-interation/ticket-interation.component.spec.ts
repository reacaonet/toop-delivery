import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketInterationComponent } from './ticket-interation.component';

describe('TicketInterationComponent', () => {
  let component: TicketInterationComponent;
  let fixture: ComponentFixture<TicketInterationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketInterationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketInterationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
