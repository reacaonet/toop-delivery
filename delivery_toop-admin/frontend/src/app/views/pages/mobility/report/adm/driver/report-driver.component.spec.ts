import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ReportDriverComponent } from "./report-driver.component";

describe("TypePaymentsComponent", () => {
	let component: ReportDriverComponent;
	let fixture: ComponentFixture<ReportDriverComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ReportDriverComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ReportDriverComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
