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

import { FranchiseService } from "../../../../../../services/franchise.service";
import { AdmReportService } from "../../../../../../services/mobility/report/admReport.service";
import { DriverService } from "../../../../../../services/mobility/driver.service";
import { ExcelService } from "../../../../../../services/excel/excel.service";
import { formatMoney, checkObjectIdisValid, methodPayment } from "../../../../../../util";
@Component({
	selector: "kt-finacial-adm",
	templateUrl: "./report-driver.component.html",
	styleUrls: ["./report-driver.component.scss"],
})
export class ReportDriverComponent implements OnInit, AfterViewInit {
	dataSource;
	displayedColumns = [
		"date",
		"status",
		"methodPayment",
		"franchise",
		"driverName",
		"total",
		"valueDriver",
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
	listDriver: any = [];
	valueDriver = 0;
	aprovedCount = 0;
	canceledCount = 0;
	amountCanceld = 0;
	passAlongFranchise = 0;
	receiveFranchise = 0;
	load: Boolean = false;
	exporting: Boolean = false;
	list: any[] = [];

	infoTotal = "";
	infoValueTax = "";
	inforTax = "";
	infoType = "";
	origin = "";
	destiny = "";
	pageIndex = 0;

	totalReceiveFranchise = "";
	totalPassFranchise = "";

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private franchiseService: FranchiseService,
		private admReportService: AdmReportService,
		private driverService: DriverService,
		private excelService: ExcelService
	) { }

	async ngOnInit() {
		this.getList(0, this.pageSize, this.filter);
		await this.addFormFilter();
	}

	ngAfterViewInit() { }

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
			driver: new FormControl("", [checkObjectIdisValid]),
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

		this.formFilter
			.get("driver")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(700),
				switchMap((value) => {
					if (typeof value === "string" && value.length > 0) {
						return this.driverService.getName(value);
					} else {
						if (this.filter.driver) {
							delete this.filter.driver;
						}
					}
					return [];
				})
			)
			.subscribe((results: any) => {
				this.listDriver = results;
				this.changeDetectorRefs.detectChanges();
			});
	}

	async getList(pageIn, pageOut, params = {}) {
		try {
			const self = this;
			const ELEMENT_DATA = [];
			const getParams = { ...params };
			this.resetValues();

			const respFinance: any = await this.admReportService
				.racesPaginator({
					pageIn,
					pageOut,
					...getParams,
				})
				.toPromise();

			if (respFinance.list) {
				respFinance.list.forEach((item: any, index) => {
					ELEMENT_DATA.push({
						date: item.date,
						status: this.orderStatus(item.status),
						franchiseTax:
							item.payment && item.payment.feeFranchise
								? item.payment.feeFranchise
								: 0,
						franchiseValue:
							item.payment && item.payment.debitPriceFranchise
								? item.payment.debitPriceFranchise
								: 0,
						admValue:
							item.payment && item.payment.debitPriceAdm
								? item.payment.debitPriceAdm
								: 0,
						admTax:
							item.payment && item.payment.feeAdm ? item.payment.feeAdm : 0,
						valueDriver:
							item.payment && item.payment.valueDriver
								? item.payment.valueDriver
								: 0,
						typePay: item.payment?.typePayment,
						paymentId: item.payment?._id || "",
						paymentStatus: item?.payment?.status,
						franchisePaid: item.franchisePaid ? true : false,
						methodPayment: this.methodPayment(item?.payment?.typePayment),
						driverName: item?.driver?.name,
						franchise: item?.franchise?.name || "",
						total: item.price,
						passAlongFranchise: item.passAlongFranchise,
						receiveFranchise: item.receiveFranchise,
						origin:
							item.origin && item.origin.address ? item.origin.address : "",
						destiny:
							item.destiny &&
								Array.isArray(item.destiny) &&
								item.destiny.length > 0
								? item.destiny[item.destiny.length - 1].address
								: "",
					});
				});

				this.list = ELEMENT_DATA;
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				self.totalLength = respFinance.total ? respFinance.total : 0;
				this.changeDetectorRefs.detectChanges();
			}

			const respIndicators: any = await this.admReportService
				.racesBalance(getParams)
				.toPromise();

			if (respIndicators) {
				this.aprovedCount = respIndicators.aproved_count;
				this.canceledCount = respIndicators.canceled_count;
				this.passAlongFranchise = respIndicators.passAlongFranchise;
				this.receiveFranchise = respIndicators.receiveFranchise;
				this.valueDriver = respIndicators.valueDriver;

				this.changeDetectorRefs.detectChanges();
			} else {
				this.resetValues();
			}
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
			this.filter.franchise = franchise._id;
			this.getList(0, this.pageSize, this.filter);
		} else {
			delete this.filter.franchiseFilter;
		}
	}

	async onClickDriverFilter(driver) {
		if (driver && driver._id) {
			this.filter.driver = driver._id;
			this.getList(0, this.pageSize, this.filter);
		} else {
			delete this.filter.driver;
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
			case "concluded":
				return "Finalizado";
			case "canceled":
				return "Cancelado";
			case "driver_not_found":
				return "Motorista Não Encontrado";
			case "in_progress":
				return "Em Andamento";
			case "accepted":
				return "Aceito";
			case "waiting":
				return "Aguardando";
			default:
				return status;
		}
	}

	resetValues() {
		this.passAlongFranchise = 0;
		this.receiveFranchise = 0;
		this.valueDriver = 0;
		this.aprovedCount = 0;
		this.canceledCount = 0;
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

	async checkItemList(event, item) {
		const response = confirm("Deseja marcar como pago ?");

		if (response === true) {
			const paymentId = item.paymentId;

			try {
				this.load = true;
				// await this.financeService
				// 	.setCheckPayment({
				// 		paymentId: paymentId,
				// 		franchisePaid: true,
				// 	})
				// 	.toPromise();

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

	async generateExcel() {
		try {
			const title = `report_race_page_${this.pageIndex + 1}`;
			this.exporting = true;

			const response: any = await this.admReportService
				.racesPaginator({
					pageIn: this.pageIndex,
					pageOut: this.pageSize,
					...this.filter,
				})
				.toPromise();

			const respJson: any = [];

			if (response && response.list && Array.isArray(response.list) && response.list.length > 0) {
				response.list.forEach((item) => {
					respJson.push({
						DATA: item.date,
						STATUS: item.orderStatus,
						"MÉTODO DE PAGAMENTO": methodPayment(item.payment.typePayment),
						FRANQUIA: item?.franchise?.name || "",
						MOTORISTA: item?.driver?.name,
						"VL. DA VIAGEM": item?.price || 0,
						"VL. MOTORISTA": item?.payment?.valueDriver || 0,
						"TAXA DA FRANQUIA": item?.payment?.feeFranchise || 0,
						"TAXA DO ADM": item?.payment?.feeAdm || 0,
						"RECEBER DA FRANQUIA": item?.receiveFranchise || 0,
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
		this.totalPassFranchise = formatMoney(data.passAlongFranchise);
		this.totalReceiveFranchise = formatMoney(data.receiveFranchise);
		this.origin = data.origin;
		this.destiny = data.destiny;

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
				(result) => { },
				(reason) => { }
			);

		this.changeDetectorRefs.detectChanges();
	}
}
