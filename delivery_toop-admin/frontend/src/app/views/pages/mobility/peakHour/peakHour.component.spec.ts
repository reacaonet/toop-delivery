import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { PeakHourComponent } from "./peakHour.component";

describe("PeakHourComponent", () => {
	let component: PeakHourComponent;
	let fixture: ComponentFixture<PeakHourComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [PeakHourComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PeakHourComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
