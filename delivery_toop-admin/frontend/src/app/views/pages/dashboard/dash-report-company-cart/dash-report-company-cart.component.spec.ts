import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashReportCompanyCartComponent } from './dash-report-company-cart.component';

describe('DashReportCompanyCartComponent', () => {
  let component: DashReportCompanyCartComponent;
  let fixture: ComponentFixture<DashReportCompanyCartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashReportCompanyCartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashReportCompanyCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
