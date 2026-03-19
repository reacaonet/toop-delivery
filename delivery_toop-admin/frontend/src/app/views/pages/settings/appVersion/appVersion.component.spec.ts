import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AppVersionComponent } from "./appVersion.component";

describe("AppVersionComponent", () => {
	let component: AppVersionComponent;
	let fixture: ComponentFixture<AppVersionComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AppVersionComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AppVersionComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
