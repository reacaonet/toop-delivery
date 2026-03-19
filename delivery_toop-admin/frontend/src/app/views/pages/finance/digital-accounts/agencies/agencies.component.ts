import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators } from "@angular/forms";

import { ToastrService } from "ngx-toastr";

import { Alert } from "./../../../../../../models/alert";
import { Agency } from "./../../../../../../models/finance/DigitalAccounts/agency";
import { Bank } from "./../../../../../../models/finance/DigitalAccounts/bank";
import { Franchise } from "./../../../../../../models/franchise";
import { AgencyService } from "./../../../../../services/finance/DigitalAccounts/agency";
import { BankService } from "./../../../../../services/finance/DigitalAccounts/bank";
import { FranchiseService } from "./../../../../../services/franchise.service";
import { checkObjectIdisValid } from "../../../../../util";


@Component({
	selector: "kt-agencies",
	templateUrl: "./agencies.component.html",
	styleUrls: ["./agencies.component.scss"],
})
export class AgenciesComponent implements OnInit, AfterViewInit {
	alert: Alert = undefined;
	dataSource;
	displayedColumns = ["bank", "franchise", "name", "code", "status", "delete"];

	formData;
	formSubmitAgencies = false;
	myControl: FormControl = new FormControl();
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	typeAction = "create";
	agenciesIdToDelete;
	banks: Bank[];
	franchises: Franchise[];

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private agenciesService: AgencyService,
		private bankService: BankService,
		private franchiseService: FranchiseService
	) {}

	ngOnInit() {
		this.getBanks();
		this.getFranchises();
		this.newForm();
		this.getList(0, this.pageSize);
	}

	newForm() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(""),
				bank: new FormControl("", [Validators.required, checkObjectIdisValid]),
				franchise: new FormControl("", [Validators.required, checkObjectIdisValid]),
				name: new FormControl("", [Validators.required]),
				status: new FormControl(""),
				description: new FormControl(""),
			});
			return resolve(true);
		});
	}

	changePage(event) {
		console.log(event);
		this.pageSize = event.pageSize;
		this.getList(event.pageIndex, event.pageSize);
	}

	async getList(pageIn, pageOut) {
		const self = this;
		const ELEMENT_DATA = [];

		this.agenciesService
			.getPaginator(pageIn, pageOut)
			.subscribe((data: any) => {
				if (data.list && Array.isArray(data.list)) {
					data.list.forEach((item: Agency, index) => {
						ELEMENT_DATA.push({
							_id: item._id,
							position: index + 1,
							bank: item.bank,
							franchise: item.franchise,
							code: item.code,
							name: item.name,
							status: item.status,
							description: item.description,
						});
					});
					self.dataSource = new MatTableDataSource(ELEMENT_DATA);
					self.totalLength = data.total;
					this.changeDetectorRefs.detectChanges();
				}
			});
	}

	async upSertAgenciesModalShow(content, data: Agency, type = "create") {
		this.typeAction = type;
		this.formSubmitAgencies = false;
		await this.newForm();

		// Only edit
		if (data) {
			this.formData.patchValue({
				_id: data._id,
				bank: data.bank,
				franchise: data.franchise,
				code: data.code,
				name: data.name,
				status: data.status,
				description: data.description,
			});
		}

		this.modalService
			.open(content, { ariaLabelledBy: "modal-edit-agencies", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async upSertAgencies(data: Agency) {
		const obj = { ...data, franchise: data.franchise._id, bank: data.bank._id };

		if (this.typeAction === "create") {
			delete obj._id;

			this.agenciesService.create(obj).subscribe(
				async (_: any) => {
					await this.getList(0, this.pageSize);
					this.changeDetectorRefs.detectChanges();
					this.toastr.success("Agência criada com sucesso!", "Sucesso!");
					this.modalService.dismissAll();
				},
				(error) => {
					this.toastr.error("Erro ao criar agência!", "Falha!");
					this.modalService.dismissAll();
				}
			);
		} else {
			this.agenciesService.update(obj).subscribe(
				async (_: any) => {
					await this.getList(0, this.pageSize);
					this.toastr.success("Agência alterada com sucesso!", "Sucesso!");
					this.modalService.dismissAll();
				},
				(error) => {
					console.error(error);
					this.toastr.error("Erro ao alterar agência!", "Falha!");
					this.modalService.dismissAll();
				}
			);
		}
	}

	async confirmDeleteModalShow(content, data) {
		this.agenciesIdToDelete = data._id;
		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-delete-agencies",
				size: "sm",
			})
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async deleteAgencies() {
		if (!this.agenciesIdToDelete) {
			this.toastr.error("Erro ao deletar Agência!", "Falha!");
			return;
		}
		await this.agenciesService.delete(this.agenciesIdToDelete).toPromise();
		this.toastr.success("AgÊncia deletada com sucesso!", "Sucesso!");
		this.agenciesIdToDelete = undefined;
		await this.getList(0, this.pageSize);
	}

	async getBanks() {
		await this.bankService.getAll().subscribe((data: any) => {
			this.banks = data;
			this.changeDetectorRefs.detectChanges();
		});
	}
	async getFranchises() {
		await this.franchiseService.getfranchises().subscribe((data: any) => {
			this.franchises = data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	closeAlert() {
		this.alert = null;
	}

	displayFn(data: any) {
		if (data) {
			return data.name;
		}
	}

	ngAfterViewInit() {}
}
