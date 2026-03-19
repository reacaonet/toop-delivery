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
import { Account } from "./../../../../../../models/finance/DigitalAccounts/account";
import { Company } from "./../../../../../../models/company/company";
import { User } from "./../../../../../../models/user";
import { checkObjectIdisValid } from "../../../../../util";

import { AgencyService } from "./../../../../../services/finance/DigitalAccounts/agency";
import { BankService } from "./../../../../../services/finance/DigitalAccounts/bank";
import { AccountService } from "./../../../../../services/finance/DigitalAccounts/account";

import { CompanyService } from "./../../../../../services/company.service";
import { UserService } from "./../../../../../services/user.service";

@Component({
	selector: "kt-accounts",
	templateUrl: "./accounts.component.html",
	styleUrls: ["./accounts.component.scss"],
})
export class AccountsComponent implements OnInit, AfterViewInit {
	alert: Alert = undefined;
	dataSource;

	displayedColumns = ["bank", "agency", "code", "type", "holder", "delete"];

	formData;
	formSubmitAccounts = false;
	myControl: FormControl = new FormControl();
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	typeAction = "create";
	accountsIdToDelete;
	banks: Bank[];
	agencies: Agency[];
	holders: Company[] | User[];

	companies: Company[];
	users: User[];

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private agenciesService: AgencyService,
		private bankService: BankService,
		private accountService: AccountService,
		private companyService: CompanyService,
		private userService: UserService
	) {}

	ngOnInit() {
		this.getBanks();
		this.getAgencies();
		this.getCompanies();
		this.getUsers();
		this.newForm();
		this.getList(0, this.pageSize);
	}

	newForm() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(""),
				bank: new FormControl("", [Validators.required]),
				agency: new FormControl("", [Validators.required]),
				holder: new FormControl("", [Validators.required]),
				type: new FormControl("", [Validators.required]),
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

		this.accountService.getPaginator(pageIn, pageOut).subscribe((data: any) => {
			if (data.list && Array.isArray(data.list)) {
				data.list.forEach((item: Account, index) => {
					ELEMENT_DATA.push({
						_id: item._id,
						position: index + 1,
						bank: item.bank,
						agency: item.agency,
						code: item.code,
						type: item.type,
						holder: item.holder,
						status: item.status,
					});
				});
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				self.totalLength = data.total;
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	async upSertAccountsModalShow(content, data: Account, type = "create") {
		this.typeAction = type;
		this.formSubmitAccounts = false;
		await this.newForm();

		// Only edit
		if (data) {
			this.formData.patchValue({
				_id: data._id,
				bank: data.bank,
				agency: data.agency,
				code: data.code,
				type: data.type,
				holder: data.holder,
				status: data.status,
			});
		}

		this.modalService
			.open(content, { ariaLabelledBy: "modal-edit-accounts", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async upSertAccounts(data: Account) {
		const obj = {
			...data,
			agency: data.agency._id,
			bank: data.bank._id,
			holder: data.holder._id,
			onModel: data.type === "PJ" ? "Company" : "Users",
		};

		if (this.typeAction === "create") {
			delete obj._id;

			this.accountService.create(obj).subscribe(
				async (_: any) => {
					await this.getList(0, this.pageSize);
					this.changeDetectorRefs.detectChanges();
					this.toastr.success("Conta criada com sucesso!", "Sucesso!");
					this.modalService.dismissAll();
				},
				(error) => {
					this.toastr.error("Erro ao criar conta!", "Falha!");
					this.modalService.dismissAll();
				}
			);
		} else {
			this.accountService.update(obj).subscribe(
				async (_: any) => {
					await this.getList(0, this.pageSize);
					this.toastr.success("Conta alterada com sucesso!", "Sucesso!");
					this.modalService.dismissAll();
				},
				(error) => {
					console.error(error);
					this.toastr.error("Erro ao alterar conta!", "Falha!");
					this.modalService.dismissAll();
				}
			);
		}
	}

	async confirmDeleteModalShow(content, data) {
		this.accountsIdToDelete = data._id;
		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-delete-accounts",
				size: "sm",
			})
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async deleteAccount() {
		if (!this.accountsIdToDelete) {
			this.toastr.error("Erro ao deletar conta!", "Falha!");
			return;
		}
		await this.accountService.delete(this.accountsIdToDelete).toPromise();
		this.toastr.success("Conta deletada com sucesso!", "Sucesso!");
		this.accountsIdToDelete = undefined;
		await this.getList(0, this.pageSize);
	}

	async getBanks() {
		await this.bankService.getAll().subscribe((data: any) => {
			this.banks = data;
			this.changeDetectorRefs.detectChanges();
		});
	}
	async getAgencies() {
		await this.agenciesService.getAll().subscribe((data: any) => {
			this.agencies = data;
			this.changeDetectorRefs.detectChanges();
		});
	}
	async getCompanies() {
		await this.companyService.getCompanies().subscribe((data: any) => {
			this.companies = data;
			this.changeDetectorRefs.detectChanges();
		});
	}
	async getUsers() {
		await this.userService.getUser().subscribe((data: any) => {
			this.users = data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	closeAlert() {
		this.alert = null;
	}

	displayFn(data: any) {
		if (data) {
			if (data.code) {
				return `[${data.code}] - ${data.name}`;
			} else {
				return `${data.name}`;
			}
		}
	}

	onChangeType(field) {
		if (field.target.value === "PJ") {
			this.holders = this.companies;
		} else {
			this.holders = this.users;
		}
	}

	ngAfterViewInit() {}
}
