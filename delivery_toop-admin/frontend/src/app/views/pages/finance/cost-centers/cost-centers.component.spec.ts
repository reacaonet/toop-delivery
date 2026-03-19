import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { TypePaymentsComponent } from "./cost-centers.component";

describe("TypePaymentsComponent", () => {
	let component: TypePaymentsComponent;
	let fixture: ComponentFixture<TypePaymentsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TypePaymentsComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TypePaymentsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
