import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { BanksComponent } from "./banks.component";

describe("TypePaymentsComponent", () => {
	let component: BanksComponent;
	let fixture: ComponentFixture<BanksComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [BanksComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(BanksComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
