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

import { CompanyService } from "./../../../../services/company.service";
import { FinanceService } from "./../../../../services/finance/finance.service";

import { formatMoney, checkObjectIdisValid } from "../../../../util";
@Component({
	selector: "kt-finacial",
	templateUrl: "./finacial.component.html",
	styleUrls: ["./finacial.component.scss"],
})
export class FinacialComponent implements OnInit, AfterViewInit {
	dataSource;
	displayedColumns = [
		"date",
		"order_number",
		"status",
		"methodPayment",
		"company",
		"total",
		"delivery",
		"franchiseValue",
		"admValue",
		"totalTransferAdm",
		"totalReceiveCompany",
		"delete",
	];

	formData;
	formFilter: FormGroup;
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	filter: any = {
		startDate: moment().subtract(30, "days").format("YYYY-MM-DD"),
		endDate: moment().format("YYYY-MM-DD"),
	};
	listCompany: any = [];
	balance = 0;
	balanceDelivery = 0;
	fees = 0;
	aprovedCount = 0;
	amountApproved = 0;
	amountCanceld = 0;
	amountAwait = 0;
	passAlongAdm = 0;
	passAlongCompany = 0;
	receiveAdm = 0;
	receiveCompany = 0;
	receiveCompanyDelivery = 0;

	infoTotal = "";
	infoValueTax = "";
	inforTax = "";
	infoType = "";
	order = "";
	totalReceiveCompany = "";
	totalReceiveCompanyType = "";

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private companyService: CompanyService,
		private financeService: FinanceService
	) {}

	async ngOnInit() {
		this.getList(0, this.pageSize, this.filter);
		await this.addFormFilter();
	}

	ngAfterViewInit() {}

	async addFormFilter() {
		this.formFilter = new FormGroup({
			dateInit: new FormControl(
				moment(this.filter.startDate).format("DD/MM/YYYY")
			),
			dateFinal: new FormControl(
				moment(this.filter.endDate).format("DD/MM/YYYY")
			),
			typePayment: new FormControl("all"),
			company: new FormControl(undefined, [checkObjectIdisValid]),
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
					if (typeof value === "string" && value.length > 0 ) {
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
			.get("company")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(700),
				switchMap((value) => {
					if (typeof value === "string" && value.length > 0) {
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

	async getList(pageIn, pageOut, params = {}) {
		try {
			const self = this;
			const ELEMENT_DATA = [];
			const getParams = { ...params };
			this.resetValues();

			const respFinance: any = await this.financeService
				.getReportFranchise(pageIn, pageOut, getParams)
				.toPromise();

			if (respFinance.list) {
				// console.log('respFinance.list', respFinance.list)

				respFinance.list.forEach((item: any, index) => {
					ELEMENT_DATA.push({
						position: index + 1,
						date: item._id.date,
						order_number: item._id.orderNumber,
						status: this.orderStatus(item._id.orderStatus),
						typePay: item._id.typePayment,
						methodPayment: this.methodPayment(item._id.typePayment),
						company: item._id.companyName,

						franchiseTax: item.fee,
						franchiseValue: item.debitFranchise - item.debitAdm,
						admValue: item.debitAdm,
						admTax: item.feeAdm,
						delivery: this.tranferDelivery(item),
						deliveryType: this.tranferDeliveryType(item),
						// collectDelivery: item.collectDelivery ? item.collectDelivery : 0,
						total: item.value,
						totalBase: item.value - item.priceDelivery,
						totalTransferAdm: this.transferAdmin(item),
						totalTransferAdmType: this.transferAdminType(item),
						totalReceiveCompany: this.transferCompany(item),
						totalReceiveCompanyType: this.transferCompanyType(item),
					});
				});

				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				self.totalLength = respFinance.total ? respFinance.total : 0;
				this.changeDetectorRefs.detectChanges();
			}

			const respIndicators: any = await this.financeService
				.getBalanceFranchise(getParams)
				.toPromise();

			if (respIndicators) {
				this.balance = respIndicators.debitFranchise;
				this.fees = respIndicators.debitAdm;
				this.balanceDelivery = respIndicators.priceDelivery;

				this.passAlongAdm = respIndicators.passAlongAdm;
				this.passAlongCompany = respIndicators.passAlongCompany;
				this.receiveAdm = respIndicators.receiveAdm;
				this.receiveCompany =
					respIndicators.receiveCompany + respIndicators.receiveCompanyDelivery;

				this.amountApproved = respIndicators.aproved_value;
				this.aprovedCount = respIndicators.aproved_count;
				this.changeDetectorRefs.detectChanges();
			} else {
				this.resetValues();
			}

			// console.log('respIndicators', respIndicators)
		} catch (err) {
			console.log("fail list", err);
		}
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getList(event.pageIndex, event.pageSize, this.filter);
	}

	displayFn(data: any) {
		if (data) {
			return data.name;
		}
	}

	backgroundColor(position) {
		return position % 2 === 0 ? "#CCC" : "transparent";
	}

	async onClickCompanyFilter(company) {
		if (company && company._id) {
			this.filter.companyFilter = company._id;
			this.getList(0, this.pageSize, this.filter);
		} else {
			delete this.filter.companyFilter;
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
			case "PIX":
				return "PIX";
			default:
				return "";
		}
	}

	orderStatus(status) {
		switch (status) {
			case "FINISHED":
				return "Finalizado";
			case "WAIT_COMPANY":
				return "Aguardando";
			case "IN_PREPARATION":
				return "Em Preparação";
			case "CANCELED":
				return "Cancelado";
			case "ACCEPT_SHOPPER":
				return "Aceito Estabelecimento";
			case "FINISH_PREPARATION":
				return "Em Preparação";
			case "WAIT_DELIVERYMAN":
				return "Aguard. Entregador";
			case "ACCEPT_DELIVERYMAN":
				return "Aguard. Entrega";
			case "DELIVERY_ROUTE":
				return "Rota Entrega";
			case "DISPATCH":
				return "Aguard. Entrega";
			default:
				return status;
		}
	}

	resetValues() {
		this.balance = 0;
		this.fees = 0;
		this.balanceDelivery = 0;
		this.amountApproved = 0;
		this.amountCanceld = 0;
		this.amountAwait = 0;
		this.aprovedCount = 0;
	}

	tranferDelivery(item) {
		const priceDelivery = item.priceDelivery ? item.priceDelivery : 0;
		const collectDelivery = item.collectDelivery ? item.collectDelivery : 0;

		if (collectDelivery && collectDelivery > 0) {
			return `${formatMoney(item.priceDelivery)}`;
		}

		if (priceDelivery && priceDelivery > 0) {
			return `${formatMoney(item.priceDelivery)}`;
		}

		return `${formatMoney(item.priceDelivery)}`;
	}

	tranferDeliveryType(item) {
		const priceDelivery = item.priceDelivery ? item.priceDelivery : 0;
		const collectDelivery = item.collectDelivery ? item.collectDelivery : 0;

		if (collectDelivery && collectDelivery > 0) {
			return `Própria`;
		}

		if (priceDelivery && priceDelivery > 0) {
			return `Toop`;
		}
	}

	transferAdmin(item) {
		const method = item._id.typePayment;

		if (item._id.orderStatus !== "FINISHED") {
			return " - ";
		}

		const total = item.value;
		const collectDelivery = item.collectDelivery ? item.collectDelivery : 0;
		const priceDelivery = item.priceDelivery ? item.priceDelivery : 0;
		const debitAdm = item.debitAdm ? item.debitAdm : 0;
		const debitFranchise = item.debitFranchise ? item.debitFranchise : 0;
		let diff = 0;

		if (method !== "PAGARME" && method !== "BRASPAG") {
			diff = debitAdm;
			// if (collectDelivery > 0) {
			// 	diff = debitAdm;
			// } else if (priceDelivery >= 0) {
			// 	diff = priceDelivery + debitAdm;
			// }

			//repasse
			return `${formatMoney(diff)}`;
		}

		if (collectDelivery > 0) {
			diff = total - debitAdm;
		} else if (priceDelivery >= 0) {
			diff = total - priceDelivery - debitAdm;
		}

		//receber
		return `${formatMoney(diff)}`;
	}

	transferAdminType(item) {
		const method = item._id.typePayment;

		if (item._id.orderStatus !== "FINISHED") {
			return " - ";
		}
		if (method !== "PAGARME" && method !== "BRASPAG") {
			return `Repasse`;
		}

		return `Receber`;
	}

	transferCompany(item) {
		const method = item._id.typePayment;

		if (item._id.orderStatus !== "FINISHED") {
			return " - ";
		}

		const total = item.value;
		const collectDelivery = item.collectDelivery ? item.collectDelivery : 0;
		const priceDelivery = item.priceDelivery ? item.priceDelivery : 0;
		const debitAdm = item.debitAdm ? item.debitAdm : 0;
		const debitFranchise = item.debitFranchise ? item.debitFranchise : 0;
		let diff = 0;

		if (method !== "PAGARME" && method !== "BRASPAG" && method !== "PIX") {
			if (collectDelivery > 0) {
				diff = debitFranchise;
			} else if (priceDelivery >= 0) {
				diff = priceDelivery + debitFranchise;
			}
			//receber
			return `${formatMoney(diff)}`;
		}

		if (collectDelivery > 0) {
			diff = total - (debitAdm + debitFranchise);
		} else if (priceDelivery >= 0) {
			diff = total - (priceDelivery + debitAdm + debitFranchise);
		}

		//repassar
		return `${formatMoney(diff)}`;
	}

	transferCompanyType(item) {
		const method = item._id.typePayment;

		if (item._id.orderStatus !== "FINISHED") {
			return " - ";
		}

		if (method !== "PAGARME" && method !== "BRASPAG" && method !== "PIX") {
			return `Receber`;
		}

		return `Repasse`;
	}

	async infoModalShow(content, data) {
		this.infoTotal = `${formatMoney(data.total)}`;

		this.infoType = this.methodPayment(data.typePay);
		this.order = data.order_number;

		this.totalReceiveCompany = data.totalReceiveCompany;
		this.totalReceiveCompanyType = data.totalReceiveCompanyType;

		if (data.typePay === "PIX") {
			this.infoValueTax = `${formatMoney(data.total * (0.99 / 100))}`;
			this.inforTax = "0,99%";
		} else if (data.typePay === "BRASPAG" || data.typePay === "PAGARME") {
			this.infoValueTax = `${formatMoney(data.total * (4.67 / 100))}`;
			this.inforTax = "4,67%";
		} else {
			this.inforTax = "-";
			this.infoValueTax = `-`;
		}

		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-info",
				size: "md",
				backdrop: "static",
			})
			.result.then(
				(result) => {},
				(reason) => {}
			);

		this.changeDetectorRefs.detectChanges();
	}
}
