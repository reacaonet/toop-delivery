import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { EvaluationPassengerComponent } from "./evaluation-passenger.component";

describe("EvaluationPassengerComponent", () => {
	let component: EvaluationPassengerComponent;
	let fixture: ComponentFixture<EvaluationPassengerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [EvaluationPassengerComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(EvaluationPassengerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
