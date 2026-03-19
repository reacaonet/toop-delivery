import { Component, AfterViewInit, OnInit, ChangeDetectorRef } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { MatTableDataSource } from "@angular/material/table";
import moment from "moment";
import { startWith, debounceTime, switchMap, map, filter } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";

/** Service */
import { AdmReportService } from "../../../../../services/mobility/report/admReport.service";
import { ExcelService } from "../../../../../services/excel/excel.service";
import { BookingService } from "../../../../../services/mobility/booking.service";
import { methodPayment, orderStatus, getCanceledBy } from "../../../../../util";

@Component({
	selector: "kt-finacial-adm",
	templateUrl: "./races.component.html",
	styleUrls: ["./races.component.scss"],
})
export class RacesComponent implements OnInit, AfterViewInit {
	dataSource;
	displayedColumns = ["date", "origin", "destiny", "passenger", "driver", "total", "methodPayment", "status", "action"];
	formFilter: FormGroup;
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	filter: any = {
		startDate: moment().subtract(30, "days").format("YYYY-MM-DD"),
		endDate: moment().format("YYYY-MM-DD"),
	};
	totalLength;
	list: any[] = [];
	aproved: any;
	canceled: any;
	total: any;
	booking: any;
	pageIndex = 0;
	currencySymbol = "";
	exporting: Boolean = false;
	load: Boolean = false;
	listMessageChat: any = [];
	listNotified = [];
	travelBooking: any = null;

	constructor(private changeDetectorRefs: ChangeDetectorRef, private modalService: NgbModal, private admReportService: AdmReportService, private excelService: ExcelService, private bookingService: BookingService, private toastr: ToastrService) { }

	async ngOnInit() {
		this.getList(0, this.pageSize, this.filter);
		await this.addFormFilter();
	}

	ngAfterViewInit() { }

	async addFormFilter() {
		this.formFilter = new FormGroup({
			dateInit: new FormControl(moment(this.filter.startDate).format("DD/MM/YYYY")),
			dateFinal: new FormControl(moment(this.filter.endDate).format("DD/MM/YYYY")),
			status: new FormControl("all"),
			typePayment: new FormControl("all"),
		});

		this.formFilter
			.get("dateInit")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) => {
					if (typeof value === "string" && value.length > 0 && value !== this.filter.startDate && moment(value, "DD/MM/YYYY").isValid()) {
						this.filter.startDate = moment(value, "DD/MM/YYYY").format("YYYY-MM-DD");
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
					if (typeof value === "string" && value.length > 0 && value !== this.filter.endDate && moment(value, "DD/MM/YYYY").isValid()) {
						this.filter.endDate = moment(value, "DD/MM/YYYY").format("YYYY-MM-DD");
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
	}

	async getList(pageIn, pageOut, params = {}) {
		const self = this;
		const ELEMENT_DATA = [];
		const getParams = { ...params };
		this.resetValues();

		const reportResponse: any = await this.admReportService
			.runningPaginator({
				pageIn,
				pageOut,
				...getParams,
			})
			.toPromise();

		if (reportResponse.list) {
			reportResponse.list.forEach((item: any, index) => {
				ELEMENT_DATA.push({
					_id: item._id,
					date: this.formatDate(new Date(item.createdAt)),
					origin: item.origin && item.origin.address ? item.origin.address : "",
					destiny: item.destiny && Array.isArray(item.destiny) && item.destiny.length > 0 ? item.destiny[item.destiny.length - 1].address : "",
					passengerName: item?.passenger?.person?.name || "",
					passenger: item?.passenger,
					driverName: item?.driver?.name || "",
					driver: item?.driver,
					total: item.price,
					driverCredit: item.driverCredit ? item.driverCredit : null,
					reason: item.reason ? item.reason : null,
					methodPayment: methodPayment(item?.payment?.typePayment),
					status: orderStatus(item.status),
					statusBooking: item.status,
				});
			});

			this.list = ELEMENT_DATA;
			self.dataSource = new MatTableDataSource(ELEMENT_DATA);
			self.totalLength = reportResponse.total ? reportResponse.total : 0;
			this.changeDetectorRefs.detectChanges();
		}

		const respBalance: any = await this.admReportService.runningBalance(this.filter).toPromise();

		if (respBalance) {
			this.aproved = respBalance.aproved;
			this.canceled = respBalance.canceled;
			this.total = respBalance.total;

			this.changeDetectorRefs.detectChanges();
		} else {
			this.resetValues();
		}
	}

	formatDate(date: Date) {
		function f(n: number) { return n < 10 ? '0' + n : n }
		return `${f(date.getDate())}/${f(date.getMonth() + 1)}/${date.getFullYear()} ${f(date.getHours())}:${f(date.getMinutes())}`;
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

	onClickPassengerFilter(person: any) {
		if (person && person.passenger && person.passenger._id) {
			this.filter.passenger = person.passenger._id;
			// aqui filtar para
		} else {
			delete this.filter.passenger;
		}
	}

	async infoModalShow(content, data) {
		this.booking = data;

		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-info",
				size: "lg",
				backdrop: "static",
			})
			.result.then(
				(result) => { },
				(reason) => { }
			);

		this.changeDetectorRefs.detectChanges();
		this.notifiedDriver();
		this.messagesChatBooking();
		this.travelBookingInfo();
	}

	// Lista de Motorista que recebeu as notificações de solicitação de novas corridas
	async notifiedDriver() {
		try {
			this.listNotified = [];

			let response: any = await this.bookingService.getNotifiedBooking(this.booking._id).toPromise();

			if (response && Array.isArray(response) && response.length > 0) {
				response.forEach((item: any, index) => {
					item.createdAt = moment(item.createdAt).format("DD/MM/YY HH:mm:ss");
					this.listNotified.push(item);
				});
			} else {
				this.listNotified = [];
			}
		} catch (err) {
			this.listNotified = [];
		}

		this.changeDetectorRefs.detectChanges();
	}

	// Mostra as mensagens trocadas via chat entre motorista e passageiro
	async messagesChatBooking() {
		try {
			this.listMessageChat = [];

			this.listMessageChat = await this.bookingService.getChatBooking(this.booking._id).toPromise();
		} catch (err) {
			this.listMessageChat = [];
		}
	}

	async travelBookingInfo() {
		try {
			this.travelBooking = null;
			const resp: any = await this.bookingService.getTravelBookingInfo(this.booking._id).toPromise();

			if (resp && resp?._id) {
				this.travelBooking = resp;

				if (this.travelBooking?.imageStart) {
					this.travelBooking.imageStart = `data:image/png;base64,${this.travelBooking?.imageStart}`;
				}

				if (this.travelBooking?.imageEnd) {
					this.travelBooking.imageEnd = `data:image/png;base64,${this.travelBooking?.imageEnd}`;
				}
			}

			console.log("travelBooking", this.travelBooking);
			console.log("booking", this.booking);
		} catch (err) {
			this.travelBooking = null;
		}

		this.changeDetectorRefs.detectChanges();
	}

	resetValues() {
		this.aproved = "";
		this.canceled = "";
		this.total = "";
		this.booking = {};
	}

	async generateExcel() {
		try {
			const title = `report_race_page_${this.pageIndex + 1}`;
			this.exporting = true;

			const response: any = await this.admReportService
				.runningPaginator({
					pageIn: this.pageIndex,
					pageOut: this.pageSize,
					...this.filter,
				})
				.toPromise();

			const respJson: any = [];

			if (response && response.list && Array.isArray(response.list) && response.list.length > 0) {
				response.list.forEach((item) => {
					const totalCurrency = item.price ? `${this.currencySymbol} ${Number(item.price | 0).toFixed(2)}` : `-`;

					respJson.push({
						DATA: this.formatDate(new Date(item.createdAt)),
						"LOCAL DE PARTIDA": item.origin && item.origin.address ? item.origin.address : "",
						"LOCAL DE CHEGADA": item.destiny && Array.isArray(item.destiny) && item.destiny.length > 0 ? item.destiny[item.destiny.length - 1].address : "",
						PASSAGEIRO: item?.passenger?.person?.name || "",
						MOTORISTA: item?.driver?.name || "",
						TOTAL: item.price || '-',
						"MÉTODO DE PAGAMENTO": methodPayment(item.payment.typePayment),
						STATUS: orderStatus(item.status),
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

			await this.saveExcel(respJson, title);
			this.exporting = false;
			this.changeDetectorRefs.detectChanges();
		} catch (err) {
			this.load = false;
		}
		this.changeDetectorRefs.detectChanges();
	}

	canceledBy(str) {
		return getCanceledBy(str);
	}

	async cancelRace() {
		try {
			this.load = true;
			this.changeDetectorRefs.detectChanges();

			let reason = "Viagem cancelada pelo admin";
			let canceledBy = "system";

			const response = await this.bookingService.cancelRace(this.booking._id, reason, canceledBy).toPromise();

			this.toastr.success("Solicitação concluída com sucesso!!");
			this.load = false;

			this.getList(this.pageIndex, this.pageSize, this.filter);
			this.modalService.dismissAll();
			this.changeDetectorRefs.detectChanges();
		} catch (err) {
			let message = "Não foi possível cancelar solicitação";

			if (err.error && err.error.message) {
				message = err.error.message;
			}

			this.toastr.error(message);
			this.load = false;
			this.changeDetectorRefs.detectChanges();
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
}