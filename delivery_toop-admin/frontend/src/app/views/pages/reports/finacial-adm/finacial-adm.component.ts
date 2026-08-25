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

import { FinanceService } from "../../../../services/finance/finance.service";
import { FranchiseService } from "../../../../services/franchise.service";

import { ExcelService } from "./../../../../services/excel/excel.service";
import { formatMoney, checkObjectIdisValid } from "../../../../util";
@Component({
	selector: "kt-finacial-adm",
	templateUrl: "./finacial-adm.component.html",
	styleUrls: ["./finacial-adm.component.scss"],
})
export class FinacialAdmComponent implements OnInit, AfterViewInit {
	dataSource;
	displayedColumns = [
		"date",
		"order_number",
		"status",
		"methodPayment",
		"franchise",
		// "company",
		"total",
		"delivery",
		"franchiseValue",
		"admValue",
		"passAlongFranchise",
		"receiveFranchise",
		"action",
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
	listFranchise: any = [];
	balance = 0;
	balanceDelivery = 0;
	fees = 0;
	aprovedCount = 0;
	amountApproved = 0;
	amountCanceld = 0;
	amountAwait = 0;
	passAlongFranchise = 0;
	receiveFranchise = 0;
	load: Boolean = false;
	exporting: Boolean = false;
	changebackPaymentId: string = "";
	chargebacking: Boolean = false;
	list: any[] = [];

	infoTotal = "";
	infoValueTax = "";
	inforTax = "";
	infoType = "";
	order = "";
	totalReceiveFranchise = "";
	totalPassFranchise = "";

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private franchiseService: FranchiseService,
		private financeService: FinanceService,
		private excelService: ExcelService
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
			franchise: new FormControl("", [checkObjectIdisValid]),
			status: new FormControl("all"),
		});

		this.formFilter
			.get("dateInit")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) => {
					if (
						typeof value === "string" &&
						value.length > 0 &&
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
					if (
						typeof value === "string" &&
						value.length > 0 &&
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
			.get("status")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) => {
					if (typeof value === "string" && value.length > 0) {
						if (value === "all") {
							delete this.filter.status;
						} else {
							this.filter.status = value;
						}

						return this.getList(0, this.pageSize, this.filter);
					}

					return [];
				})
			)
			.toPromise();

		this.formFilter
			.get("franchise")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(700),
				switchMap((value) => {
					if (typeof value === "string" && value.length > 0) {
						return this.franchiseService.getFranchisesNome(value);
					} else {
						if (this.filter.franchiseFilter) {
							delete this.filter.franchiseFilter;
						}
					}

					return [];
				})
			)
			.subscribe((results: any) => {
				this.listFranchise = results;
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
				.getReportAdm(pageIn, pageOut, getParams)
				.toPromise();

			// const respFinance: any = {
			// 	list: [
			// 		{
			// 			_id: {
			// 				companyName: "RESTAURANTE FIGUEIRA ",
			// 				franchiseName: "Redenção PA",
			// 				orderId: "61e73d72eded6e0034ae05da",
			// 				paymentId: "61e73d72eded6e0034ae05d3",
			// 				paymentStatus: "CHARGEBACK",
			// 				franchisePaid: false,
			// 				orderStatus: "CANCELED",
			// 				typePayment: "CARD",
			// 				orderNumber: 7758,
			// 				createdAt: "2022-01-18T22:21:38.264Z",
			// 				date: "18/01/2022 19:21",
			// 			},
			// 			debitAdm: 0,
			// 			debitFranchise: 0,
			// 			priceDelivery: 0,
			// 			collectDelivery: 0,
			// 			aproved_value: 0,
			// 			aproved_count: 0,
			// 			passAlongFranchise: 0,
			// 			receiveFranchise: 0,
			// 			value: 21.99,
			// 		},
			// 	],
			// 	total: 135,
			// };

			if (respFinance.list) {
				// console.log('respFinance.list', respFinance.list)

				respFinance.list.forEach((item: any, index) => {
					ELEMENT_DATA.push({
						date: item._id.date,
						order_number: item._id.orderNumber,
						status: this.orderStatus(
							item._id.orderStatus,
							item?._id?.paymentStatus ?? ""
						),

						franchiseTax: item.fee,
						franchiseValue: item.debitFranchise,
						admValue: item.debitAdm,
						admTax: item.feeAdm,
						totalBase: item.value - item.priceDelivery,
						deliveryType: this.tranferDeliveryType(item),
						typePay: item._id.typePayment,

						paymentId: item._id.paymentId,
						paymentStatus: item._id.paymentStatus,
						orderStatus: item._id.orderStatus,
						franchisePaid: item._id.franchisePaid ? true : false,
						methodPayment: this.methodPayment(item._id.typePayment),
						company: item._id.companyName,
						franchise: item._id.franchiseName,
						// franchiseValue: item.debitFranchise,
						// admValue: item.debitAdm,
						delivery: this.transferDelivery(item),
						total: item.value,
						passAlongFranchise: item.passAlongFranchise,
						receiveFranchise: item.receiveFranchise,
					});
				});

				this.list = ELEMENT_DATA;
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				self.totalLength = respFinance.total ? respFinance.total : 0;
				this.changeDetectorRefs.detectChanges();
			}

			const respIndicators: any = await this.financeService
				.getBalanceAdm(getParams)
				.toPromise();

			// console.log('respIndicators', respIndicators)

			if (respIndicators) {
				this.balance = respIndicators.debitFranchise;
				this.fees = respIndicators.debitAdm;
				this.balanceDelivery = respIndicators.priceDelivery;

				this.passAlongFranchise = respIndicators.passAlongFranchise;
				this.receiveFranchise = respIndicators.receiveFranchise;

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

	async onClickFranchiseFilter(franchise) {
		if (franchise && franchise._id) {
			this.filter.franchiseFilter = franchise._id;
			this.getList(0, this.pageSize, this.filter);
		} else {
			delete this.filter.franchiseFilter;
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

	orderStatus(status, paymentStatus = "") {
		switch (status) {
			case "FINISHED":
				return "Finalizado";
			case "WAIT_COMPANY":
				return "Aguardando";
			case "IN_PREPARATION":
				return "Em Preparação";
			case "CANCELED":
				if (paymentStatus === "CHARGEBACK") return "Cancelado e Estornado";
				else return "Cancelado";
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

		this.passAlongFranchise = 0;
		this.receiveFranchise = 0;

		this.amountApproved = 0;
		this.aprovedCount = 0;
	}

	tranferDeliveryType(item) {
		const priceDelivery = item.priceDelivery ? item.priceDelivery : 0;
		const collectDelivery = item.collectDelivery ? item.collectDelivery : 0;

		if (collectDelivery && collectDelivery > 0) {
			return `Própria`;
		}

		if (priceDelivery && priceDelivery > 0) {
			return `Gojá`;
		}
	}

	transferDelivery(item) {
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

	async checkItemList(event, item) {
		const response = confirm("Deseja marcar como pago ?");

		if (response === true) {
			const paymentId = item.paymentId;

			try {
				this.load = true;
				await this.financeService
					.setCheckPayment({
						paymentId: paymentId,
						franchisePaid: true,
					})
					.toPromise();

				item.franchisePaid = true;
				this.load = false;

				setTimeout(() => {
					this.changeDetectorRefs.detectChanges();
				}, 300);
			} catch (err) {
				this.load = false;
				this.toastr.error("Form", "Não foi possível modificar status");
				this.changeDetectorRefs.detectChanges();
			}
		} else {
			event.target.checked = false;
			this.changeDetectorRefs.detectChanges();
		}
	}

	async chargebackModalShow(content, data) {
		this.changebackPaymentId = data.paymentId;

		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-chargeback",
				size: "md",
				backdrop: "static",
			})
			.result.then(
				(result) => {},
				(reason) => {}
			);

		this.changeDetectorRefs.detectChanges();
	}

	async chargeback() {
		try {
			this.chargebacking = true;
			await this.financeService
				.paymentChargeback({
					paymentId: this.changebackPaymentId,
				})
				.toPromise();

			const newList = this.list.map((i) => {
				if (i.paymentId === this.changebackPaymentId) {
					i.status = this.orderStatus("CANCELED", "CHARGEBACK");
				}

				return i;
			});

			this.chargebacking = false;
			this.changebackPaymentId = "";

			this.list = newList;
			this.dataSource = new MatTableDataSource(newList);

			setTimeout(() => {
				this.modalService.dismissAll();
				this.changeDetectorRefs.detectChanges();
			}, 300);
		} catch (err) {
			this.chargebacking = false;
			this.toastr.error(
				"Tente novamente",
				"Não foi possível realizar o estorno"
			);
			this.changeDetectorRefs.detectChanges();
		}
	}

	async generateExcel(page = 0, size = 500) {
		try {
			const title = `financeiro_page_${page + 1}`;
			this.exporting = true;

			const response: any = await this.financeService
				.getReportAdm(page, size, this.filter)
				.toPromise();

			const respJson: any = [];

			if (
				response &&
				response.list &&
				Array.isArray(response.list) &&
				response.list.length > 0
			) {
				response.list.forEach((item) => {
					respJson.push({
						DATA: item._id.date,
						"Nº DO PEDIDO": item._id.orderNumber,
						STATUS: this.orderStatus(
							item._id.orderStatus,
							item?._id?.paymentStatus ?? ""
						),
						"ID DO PAGAMENTO": item._id.paymentId,
						"PAGAMENTO DA FRANQUIA REALIZADO?": item._id.franchisePaid
							? true
							: false,
						"FORMA DE PAGAMENTO": this.methodPayment(item._id.typePayment),
						EMPRESA: item._id.companyName,
						FRANQUIA: item._id.franchiseName,
						"TAXA DA FRANQUIA": item.debitFranchise,
						"TAXA DO ADM": item.debitAdm,
						"VALOR DO FRETE": this.transferDelivery(item),
						TOTAL: item.value,
						"REPASSAR P/ FRANQUIA": item.passAlongFranchise,
						"RECEBER DA FRANQUIA": item.receiveFranchise,
					});
				});
			} else {
				this.exporting = false;
				this.changeDetectorRefs.detectChanges();
				return;
			}

			if (!respJson || !Array.isArray(respJson) || respJson.length <= 0) {
				this.exporting = false;
				this.changeDetectorRefs.detectChanges();
				return;
			}

			const isSave = await this.saveExcel(respJson, title);
			if (isSave) {
				return await this.generateExcel(page + 1, size);
			}
		} catch (err) {
			this.load = false;
			this.changeDetectorRefs.detectChanges();
			console.log("Failt generateExcel", err);
		}
	}

	async saveExcel(json: any, title: string) {
		try {
			this.excelService.exportAsExcelFile(json, title);
			return true;
		} catch (err) {
			return false;
		}
	}

	async infoModalShow(content, data) {
		this.infoTotal = `${formatMoney(data.total)}`;

		this.infoType = this.methodPayment(data.typePay);
		this.order = data.order_number;

		this.totalPassFranchise = formatMoney(data.passAlongFranchise);
		this.totalReceiveFranchise = formatMoney(data.receiveFranchise);

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
