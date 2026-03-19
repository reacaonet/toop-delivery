import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsToolsComponent } from './notifications-tools.component';

describe('NotificationsToolsComponent', () => {
  let component: NotificationsToolsComponent;
  let fixture: ComponentFixture<NotificationsToolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationsToolsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
