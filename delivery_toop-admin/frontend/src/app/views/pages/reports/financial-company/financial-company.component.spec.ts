import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { FinacialCompanyComponent } from "./financial-company.component";

describe("TypePaymentsComponent", () => {
	let component: FinacialCompanyComponent;
	let fixture: ComponentFixture<FinacialCompanyComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [FinacialCompanyComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(FinacialCompanyComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
