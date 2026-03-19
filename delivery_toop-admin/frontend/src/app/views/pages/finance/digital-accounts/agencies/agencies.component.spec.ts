import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AgenciesComponent } from "./agencies.component";

describe("TypePaymentsComponent", () => {
	let component: AgenciesComponent;
	let fixture: ComponentFixture<AgenciesComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AgenciesComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AgenciesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
