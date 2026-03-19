import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportSubjectComponent } from './supportSubject.component';

describe('SupportSubjectComponent', () => {
	let component: SupportSubjectComponent;
	let fixture: ComponentFixture<SupportSubjectComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SupportSubjectComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SupportSubjectComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
