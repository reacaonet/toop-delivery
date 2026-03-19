import { OnInit, ChangeDetectorRef } from "@angular/core";
// Angular
import { Component } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { CompanyDeliveryService } from "./../../../../services/companydelivery.service";

@Component({
	selector: "kt-topbar",
	templateUrl: "./topbar.component.html",
	styleUrls: ["./topbar.component.scss"],
})
export class TopbarComponent implements OnInit {
	loggedCompany = true;
	establishment: Boolean;
	manual: Boolean;

	constructor(
		public companyDeliveryService: CompanyDeliveryService,
		private cdr: ChangeDetectorRef,
		private modalService: NgbModal
	) {}

	async ngOnInit() {
		this.checkLocalStorage();
	}

	async checkLocalStorage() {
		const checkCompany = localStorage.getItem("@company-main")
			? JSON.parse(localStorage.getItem("@company-main"))
			: undefined;

		// console.log("checkCompany", checkCompany);

		if (checkCompany && checkCompany._id) {
			const compId: any = await this.companyDeliveryService
				.getCompanyId(checkCompany._id)
				.toPromise();

			if (compId && Array.isArray(compId) && compId.length > 0) {
				this.loggedCompany = true;
				this.establishment = compId[0].isOpen;
				this.manual = compId[0].isManual;
				this.cdr.markForCheck();
			} else {
				this.loggedCompany = false;
				this.cdr.markForCheck();
			}
		} else {
			this.loggedCompany = false;
			this.cdr.markForCheck();
			setTimeout(() => {
				this.checkLocalStorage();
			}, 5000);
		}
	}

	async toggleeCompany(value, modal) {
		const { _id } = JSON.parse(localStorage.getItem("@company-main"));
		const compId = await this.companyDeliveryService
			.getCompanyId(_id)
			.toPromise();
		const isManual = compId[0].isManual || false;

		if (!isManual) {
			value.source.checked = !value.checked;
			return this.modalService.open(modal, {
				ariaLabelledBy: "modal-create-user",
				size: "sm",
			});
		}

		this.establishment = value.checked;
		this.manual = true;
		this.cdr.markForCheck();
		await this.companyDeliveryService
			.updateOpenCompany({
				isOpen: value.checked,
				isManual: this.manual,
			})
			.toPromise();
	}

	async removeIsManual() {
		this.manual = false;
		await this.companyDeliveryService
			.updateOpenCompany({
				isOpen: this.establishment,
				isManual: this.manual,
			})
			.toPromise();
		this.cdr.detectChanges();
	}

	async confirmIsManual() {
		this.establishment = !this.establishment;
		this.manual = true;
		this.cdr.markForCheck();
		await this.companyDeliveryService
			.updateOpenCompany({
				isOpen: this.establishment,
				isManual: this.manual,
			})
			.toPromise();

		await this.checkLocalStorage();
		this.cdr.detectChanges();
	}
}
