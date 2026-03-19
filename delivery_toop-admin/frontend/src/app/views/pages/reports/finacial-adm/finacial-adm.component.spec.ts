import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { FinacialAdmComponent } from "./finacial-adm.component";

describe("TypePaymentsComponent", () => {
	let component: FinacialAdmComponent;
	let fixture: ComponentFixture<FinacialAdmComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [FinacialAdmComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(FinacialAdmComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
