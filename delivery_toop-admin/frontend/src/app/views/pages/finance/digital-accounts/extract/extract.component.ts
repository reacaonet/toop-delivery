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
import moment from "moment";
import {
	startWith,
	debounceTime,
	switchMap,
	map,
	filter,
} from "rxjs/operators";

import { Alert } from "./../../../../../../models/alert";
import { PersonService } from "./../../../../../services/person.service";
import { CompanyService } from "./../../../../../services/company.service";

import { BankTransactions } from "./../../../../../../models/finance/DigitalAccounts/bankTransactions";
import { ExtractService } from "./../../../../../services/finance/DigitalAccounts/extract";
import { Agency } from "./../../../../../../models/finance/DigitalAccounts/agency";
import { Bank } from "./../../../../../../models/finance/DigitalAccounts/bank";
import { Account } from "./../../../../../../models/finance/DigitalAccounts/account";
import { CostCenters } from "./../../../../../../models/finance/CostCenters";

import { AgencyService } from "./../../../../../services/finance/DigitalAccounts/agency";
import { BankService } from "./../../../../../services/finance/DigitalAccounts/bank";
import { AccountService } from "./../../../../../services/finance/DigitalAccounts/account";
import { BalanceService } from "./../../../../../services/finance/DigitalAccounts/balance";
import { CostCentersService } from "./../../../../../services/finance/costCenters";
import { checkObjectIdisValid } from "../../../../../util";

@Component({
	selector: "kt-extract",
	templateUrl: "./extract.component.html",
	styleUrls: ["./extract.component.scss"],
})
export class ExtractComponent implements OnInit, AfterViewInit {
	alert: Alert = undefined;
	dataSource;
	displayedColumns = [
		"transactionCode",
		"transactionDate",
		"originAccount",
		"destinationAccount",
		"value",
		"typePayment",
		"delete",
	];

	formData;
	formDataBalance;
	formSubmitBanlance = false;
	formFilter: FormGroup;
	formSubmitAgencies = false;
	myControl: FormControl = new FormControl();
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	typeAction = "create";
	transactions: BankTransactions[];
	showItem: BankTransactions;
	person: any = [];
	listCompany: any = [];
	filter: any = {
		startDate: moment().subtract(30, "days").format("YYYY-MM-DD"),
		endDate: moment().format("YYYY-MM-DD"),
	};

	banks: Bank[];
	agencies: Agency[];
	accounts: Account[];
	costCenters: Account[];

	balance = 0;

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private personService: PersonService,
		private companyService: CompanyService,
		private agenciesService: AgencyService,
		private bankService: BankService,
		private accountService: AccountService,
		private extractService: ExtractService,
		private costCentersService: CostCentersService,
		private balanceService: BalanceService
	) {}

	async ngOnInit() {
		this.getBanks();
		this.getAgencies();
		this.getCostCenters();

		this.getList(0, this.pageSize, this.filter);
		await this.addFormFilter();
	}

	async addFormFilter() {
		this.formFilter = new FormGroup({
			dateInit: new FormControl(
				moment(this.filter.startDate).format("DD/MM/YYYY")
			),
			dateFinal: new FormControl(
				moment(this.filter.endDate).format("DD/MM/YYYY")
			),
			typePayment: new FormControl("all"),
			person: new FormControl("", [checkObjectIdisValid]),
			company: new FormControl("", [checkObjectIdisValid]),
		});

		this.formFilter
			.get("dateInit")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) => {
					if (typeof value === "string" && value.length > 0 &&
						value !== this.filter.startDate &&
						moment(value, "DD/MM/YYYY").isValid()
					) {
						this.filter.startDate = moment(value, "DD/MM/YYYY").format(
							"YYYY-MM-DD"
						);
						return this.getList(0, this.pageSize, this.filter);
					}

					return [];
				})
			)
			.toPromise();

		this.formFilter
			.get("dateFinal")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) => {
					if (typeof value === "string" && value.length > 0 &&
						value !== this.filter.endDate &&
						moment(value, "DD/MM/YYYY").isValid()
					) {
						this.filter.endDate = moment(value, "DD/MM/YYYY").format(
							"YYYY-MM-DD"
						);
						return this.getList(0, this.pageSize, this.filter);
					}

					return [];
				})
			)
			.toPromise();

		this.formFilter
			.get("typePayment")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) => {
					if (typeof value === "string" && value.length > 0) {
						if (value === "all") {
							delete this.filter.typePayment;
						} else {
							this.filter.typePayment = value;
						}

						return this.getList(0, this.pageSize, this.filter);
					}

					return [];
				})
			)
			.toPromise();

		this.formFilter
			.get("person")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(700),
				switchMap((value) => {
					if (typeof value === "string" && value.length > 0 ) {
						return this.personService.getPersonNome(value);
					} else {
						if (this.filter.person) {
							delete this.filter.person;
						}
					}

					return [];
				})
			)
			.subscribe((results: any) => {
				this.person = results;
				this.changeDetectorRefs.detectChanges();
			});

		this.formFilter
			.get("company")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(700),
				switchMap((value) => {
					if (typeof value === "string" && value.length > 0 ) {
						return this.companyService.getCompaniesNome(value);
					} else {
						if (this.filter.companyFilter) {
							delete this.filter.companyFilter;
						}
					}

					return [];
				})
			)
			.subscribe((results: any) => {
				this.listCompany = results;
				this.changeDetectorRefs.detectChanges();
			});
	}

	changePage(event) {
		console.log(event);
		this.pageSize = event.pageSize;
		this.getList(event.pageIndex, event.pageSize);
	}

	async getList(pageIn, pageOut, params = {}) {
		const self = this;
		const ELEMENT_DATA = [];

		this.getBalance(pageIn, pageOut, params);

		this.extractService
			.getPaginator(pageIn, pageOut, params)
			.subscribe((data: any) => {
				if (data.list && Array.isArray(data.list)) {
					data.list.forEach((item: BankTransactions, index) => {
						ELEMENT_DATA.push({
							_id: item._id,
							position: index + 1,
							originAccount: item.originAccount,
							originAgency: item.originAgency,
							destinationAccount: item.destinationAccount,
							destinationAgency: item.destinationAgency,
							type: item.type,
							status: item.status,
							value: item.value,
							typePayment:
								item.payment && item.payment.typePayment
									? this.methodPayment(item.payment.typePayment)
									: " - ",
							transactionDate: item.transactionDate,
							transactionCode: item.transactionCode,
							description: item.description,
						});
					});
					self.dataSource = new MatTableDataSource(ELEMENT_DATA);
					self.totalLength = data.total;
					this.changeDetectorRefs.detectChanges();
				}
			});
	}

	async getBalance(pageIn, pageOut, params = {}) {
		this.extractService.getBalance(params).subscribe((data: any) => {
			if (data) {
				this.balance = data.balance;
			}
			this.changeDetectorRefs.detectChanges();
		});
	}

	addBalanceShow(content) {
		this.newFormBalance();

		this.modalService
			.open(content, { ariaLabelledBy: "modal-add-banlance", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	newFormBalance() {
		return new Promise(async (resolve, reject) => {
			this.formDataBalance = new FormGroup({
				//	bank: new FormControl("", [Validators.required]),
				destinationAgency: new FormControl("", [Validators.required, checkObjectIdisValid]),
				destinationAccount: new FormControl("", [Validators.required]),
				value: new FormControl("", [Validators.required]),
				costCenter: new FormControl("", [Validators.required, checkObjectIdisValid]),
				description: new FormControl(""),
			});
			return resolve(true);
		});
	}

	async addBalance(data) {
		data.costCenter = data.costCenter._id;
		//	data.bank = data.bank._id;
		data.destinationAccount = data.destinationAccount._id;
		data.destinationAgency = data.destinationAgency._id;
		data.type = "credit";
		data.status = "COMPLETED";

		this.balanceService.create(data).subscribe(
			async (_: any) => {
				await this.getList(0, this.pageSize);
				this.changeDetectorRefs.detectChanges();
				this.toastr.success("Saldo adicionado com sucesso!", "Sucesso!");
				this.modalService.dismissAll();
			},
			(error) => {
				this.toastr.error("Erro ao adicionar saldo!", "Falha!");
			}
		);
	}

	closeAlert() {
		this.alert = null;
	}

	ngAfterViewInit() {}

	isCredit(type: string) {
		if (type === "credit" || type === "chargeback" || type === "cashback")
			return true;
		else return false;
	}

	backgrounColor(item) {
		if (item.position % 2 == 0) {
			return "background: #eee";
		} else {
			return "background: #fff";
		}
	}

	modalShowInfo(content, item) {
		this.showItem = item;

		this.modalService
			.open(content, { ariaLabelledBy: "modal-detail-transaction", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	onClickPersonFilter(person) {
		if (person && person._id) {
			this.filter.person = person._id;
			return this.getList(0, this.pageSize, this.filter);
		} else {
			delete this.filter.person;
		}
	}

	async onClickCompanyFilter(company) {
		if (company && company._id) {
			this.filter.companyFilter = company._id;
			return this.getList(0, this.pageSize, this.filter);
		} else {
			delete this.filter.companyFilter;
		}
	}

	translateType() {
		if (this.showItem.type === "debit") {
			return "Débito";
		}
		if (this.showItem.type === "credit") {
			return "Crédito";
		}
		if (this.showItem.type === "withdraw") {
			return "Saque";
		}
		if (this.showItem.type === "chargeback") {
			return "Estorno";
		}
		if (this.showItem.type === "cashback") {
			return "Cashbank";
		}
	}

	translateStatus() {
		if (this.showItem.status === "AUTHORIZEDBYUSER") {
			return "AUTORIZADO PELO USUÁRIO";
		}
		if (this.showItem.status === "BANKAUTHORIZED") {
			return "AUTORIZADO PELO BANCO";
		}
		if (this.showItem.status === "COMPLETED") {
			return "REALIZADA";
		}
		if (this.showItem.status === "AWAITING") {
			return "AGUARDANDO PROCESSAMENTO";
		}
		if (this.showItem.status === "SCHEDULED") {
			return "AGENDADA";
		}
		if (this.showItem.status === "CANCELED") {
			return "CANCELADA";
		}
	}

	methodPayment(type) {
		switch (type) {
			case "MONEY":
				return "Dinheiro";
			case "CARD":
				return "Maquininha";
			case "BRASPAG":
				return "APP";
			case "PAGARME":
				return "APP";
			default:
				return "";
		}
	}

	holderType(type) {
		switch (type) {
			case "Person":
				return "Cliente";
			case "Company":
				return "Empresa";
			case "Franchise":
				return "Franquia";
			default:
				return "";
		}
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
	async getCostCenters() {
		await this.costCentersService.getAll().subscribe((data: any) => {
			this.costCenters = data;
			this.changeDetectorRefs.detectChanges();
		});
	}
	async getAccounts(agency: string) {
		await this.accountService.getByAgency(agency).subscribe((data: any) => {
			this.accounts = data;
			this.changeDetectorRefs.detectChanges();
		});
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

	displayFnAccount(data: any) {
		if (data) {
			return `[${data.code}] - ${data?.holder?.name}`;
		}
	}
}
