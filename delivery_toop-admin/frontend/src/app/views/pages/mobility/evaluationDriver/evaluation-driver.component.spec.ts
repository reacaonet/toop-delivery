import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { EvaluationDriverComponent } from "./evaluation-driver.component";

describe("EvaluationDriverComponent", () => {
	let component: EvaluationDriverComponent;
	let fixture: ComponentFixture<EvaluationDriverComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [EvaluationDriverComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(EvaluationDriverComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
