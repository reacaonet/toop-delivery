import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { CampaignReceivedComponent } from "./received.component";

describe("TypePaymentsComponent", () => {
	let component: CampaignReceivedComponent;
	let fixture: ComponentFixture<CampaignReceivedComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CampaignReceivedComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CampaignReceivedComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
