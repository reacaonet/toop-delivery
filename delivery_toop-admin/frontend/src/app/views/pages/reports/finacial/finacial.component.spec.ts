import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { FinacialComponent } from "./finacial.component";

describe("TypePaymentsComponent", () => {
	let component: FinacialComponent;
	let fixture: ComponentFixture<FinacialComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [FinacialComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(FinacialComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
