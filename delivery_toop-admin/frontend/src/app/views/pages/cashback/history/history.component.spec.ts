import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { CampaignHistoryComponent } from "./history.component";

describe("TypePaymentsComponent", () => {
	let component: CampaignHistoryComponent;
	let fixture: ComponentFixture<CampaignHistoryComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CampaignHistoryComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CampaignHistoryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
