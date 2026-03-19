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

/** Service */
import { CompanyService } from "./../../../../services/company.service";
import { FinanceService } from '../../../../services/finance/finance.service';
import { DeliveryManService } from "../../../../services/deliveryMan.service";
import { checkObjectIdisValid } from "../../../../util";

import { formatMoney } from '../../../../util'

@Component({
	selector: "kt-deliveries",
	templateUrl: "./deliveries.component.html",
	styleUrls: ["./deliveries.component.scss"],
})
export class DeliveriesComponent implements OnInit, AfterViewInit {
	dataSource;
	displayedColumns = [
		'date', 'orderNumber', 'status', 'typePayment', 'company', 'deliveryMan',
		'phoneDeliveryMan', 'price',
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
	balance = 0
	balanceDelivery = 0
	fees = 0
	aprovedCount = 0
	amountApproved = 0
	amountCanceld = 0
	amountAwait = 0
	passAlongFranchise = 0
	receiveFranchise = 0
	listCompany: any = [];
	listDeliveryMan: any = [];

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private companyService: CompanyService,
		private financeService: FinanceService,
		private deliveryMan: DeliveryManService
	) {}

	async ngOnInit() {
		this.getList(0, this.pageSize, this.filter);
		await this.addFormFilter()
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
			company: new FormControl("", [checkObjectIdisValid]),
			deliveryMan: new FormControl("", [checkObjectIdisValid]),
		});

		this.formFilter
			.get("dateInit")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) => {
					if (typeof value === "string" &&	value.length > 0 && value !== this.filter.startDate && moment(value, "DD/MM/YYYY").isValid()
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
					if (typeof value === "string" && value.length > 0 && value !== this.filter.endDate &&
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

			this.formFilter
				.get("deliveryMan")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(700),
					switchMap((value) => {
						if (typeof value === "string" && value.length > 0) {
							return this.deliveryMan.getNameDeliveryMan(value);
						} else {
							if (this.filter.deliveryMan) {
								delete this.filter.deliveryMan;
							}
						}

						return [];
					})
				)
				.subscribe((results: any) => {
					this.listDeliveryMan = results;
					this.changeDetectorRefs.detectChanges();
				});
	}

	async getList(pageIn, pageOut, params = {}) {
		try {
			const self = this;
			const ELEMENT_DATA = [];
			const getParams = {...params}

			const respFinance: any = await this.financeService
				.deliveriesBalance(
					pageIn, pageOut, getParams
				).toPromise()

			if (respFinance.list) {
				respFinance.list.forEach((item: any, index) => {
					ELEMENT_DATA.push({
						status: this.orderStatus(item.status),
						date: item.date,
						payment: item.payment,
						typePayment: this.methodPayment(item.typePayment),
						company: item.company,
						orderNumber: item.order_number,
						deliveryMan: item.deliveryMan,
						phoneDeliveryMan:
							item.deliveryMan &&
							item.deliveryMan.person &&
							item.deliveryMan.person.phone
								? item.deliveryMan.person.phone
								: ' - ',
						price: item.payment && item.payment.priceDelivery
							? formatMoney(item.payment.priceDelivery)
							: 0
					})
				});


				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				self.totalLength = respFinance.total ? respFinance.total : 0;
				this.changeDetectorRefs.detectChanges();
			}

		} catch (err) {
			console.log('fail list', err)
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

	async onClickCompanyFilter(company) {
		if (company && company._id) {
			this.filter.companyFilter = company._id;
			this.getList(0, this.pageSize, this.filter)
		} else {
			delete this.filter.companyFilter;
		}
	}

	async onClickDeliveryMan(deliveryMan) {
		if (deliveryMan && deliveryMan.deliveryMan && deliveryMan.deliveryMan._id) {
			this.filter.deliveryMan = deliveryMan.deliveryMan._id;
			this.getList(0, this.pageSize, this.filter)
		} else {
			delete this.filter.deliveryMan;
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


	orderStatus(status) {
		switch (status) {
			case 'FINISHED':
				return 'Finalizado'
			case 'WAIT_COMPANY':
				return 'Aguardando'
			case 'IN_PREPARATION':
				return 'Em Preparação'
			case 'CANCELED':
				return 'Cancelado'
			case 'ACCEPT_SHOPPER':
				return 'Aceito Estabelecimento'
			case 'FINISH_PREPARATION':
				return 'Em Preparação'
			case 'WAIT_DELIVERYMAN':
				return 'Aguard. Entregador'
			case 'ACCEPT_DELIVERYMAN':
				return 'Aguard. Entrega'
			case 'DELIVERY_ROUTE':
				return 'Rota Entrega'
			case 'DISPATCH':
				return 'Aguard. Entrega'
			default:
				return status;
		}
	}
}
