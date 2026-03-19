import { Component, AfterViewInit, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { startWith, debounceTime, switchMap, map, filter } from 'rxjs/operators';

/** Service */
import { PassengerService } from '../../../../../services/mobility/passenger.service';
import { AdmReportService } from '../../../../../services/mobility/report/admReport.service';
import { formatMoney, methodPayment, checkObjectIdisValid } from '../../../../../util';
import { ExcelService } from "../../../../../services/excel/excel.service";

@Component({
	selector: 'kt-finacial-adm',
	templateUrl: './passenger.component.html',
	styleUrls: ['./passenger.component.scss'],
})
export class PassengerComponent implements OnInit, AfterViewInit {
	dataSource;
	displayedColumns = ['date', 'passenger', 'origin', 'destiny', 'total', 'methodPayment', 'status', 'action'];
	formFilter: FormGroup;
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	list: any[] = [];
	totalLength;
	filter: any = {
		startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
		endDate: moment().format('YYYY-MM-DD'),
	};
	load: Boolean = false;
	listPassenger: any = [];
	aproved;
	canceled;
	total;
	pageIndex = 0;
	exporting: Boolean = false;

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private passengerService: PassengerService,
		private admReportService: AdmReportService,
		private excelService: ExcelService
		) {}

	async ngOnInit() {
		this.getList(0, this.pageSize, this.filter);
		await this.addFormFilter();
	}

	ngAfterViewInit() {}

	async addFormFilter() {
		this.formFilter = new FormGroup({
			dateInit: new FormControl(moment(this.filter.startDate).format('DD/MM/YYYY')),
			dateFinal: new FormControl(moment(this.filter.endDate).format('DD/MM/YYYY')),
			status: new FormControl('all'),
			passenger: new FormControl('', [checkObjectIdisValid]),
		});

		this.formFilter
			.get('dateInit')
			.valueChanges.pipe(
				startWith(''),
				debounceTime(1000),
				switchMap(value => {
					if (typeof value === 'string' && value.length > 0 && value !== this.filter.startDate && moment(value, 'DD/MM/YYYY').isValid()) {
						this.filter.startDate = moment(value, 'DD/MM/YYYY').format('YYYY-MM-DD');
						return this.getList(0, this.pageSize, this.filter);
					}

					return [];
				}),
			)
			.toPromise();

		this.formFilter
			.get('dateFinal')
			.valueChanges.pipe(
				startWith(''),
				debounceTime(1000),
				switchMap(value => {
					if (typeof value === 'string' && value.length > 0 && value !== this.filter.endDate && moment(value, 'DD/MM/YYYY').isValid()) {
						this.filter.endDate = moment(value, 'DD/MM/YYYY').format('YYYY-MM-DD');
						return this.getList(0, this.pageSize, this.filter);
					}

					return [];
				}),
			)
			.toPromise();

		this.formFilter
			.get('passenger')
			.valueChanges.pipe(
				startWith(''),
				debounceTime(700),
				switchMap(value => {
					if (typeof value === 'string' && value.length > 0) {
						return this.passengerService.getFilter({ name: value });
					} else if (!value) {
						if (this.filter.passenger) {
							delete this.filter.passenger;
						}
					}

					return [];
				}),
			)
			.subscribe((results: any) => {
				this.listPassenger = results;
				this.changeDetectorRefs.detectChanges();
			});

		this.formFilter
			.get('status')
			.valueChanges.pipe(
				startWith(''),
				debounceTime(1000),
				switchMap(value => {
					if (typeof value === 'string' && value.length > 0) {
						if (value === 'all') {
							delete this.filter.status;
						} else {
							this.filter.status = value;
						}

						return this.getList(0, this.pageSize, this.filter);
					}

					return [];
				}),
			)
			.toPromise();
	}

	async getList(pageIn, pageOut, params = {}) {
		const self = this;
		const ELEMENT_DATA = [];
		const getParams = { ...params };
		this.resetValues();

		const reportResponse: any = await this.admReportService
			.passengerPaginator({
				pageIn,
				pageOut,
				...getParams,
			})
			.toPromise();

		if (reportResponse.list) {
			reportResponse.list.forEach((item: any, index) => {
				ELEMENT_DATA.push({
					date: item.date,
					origin: item.origin && item.origin.address ? item.origin.address : '',
					destiny: item.destiny && Array.isArray(item.destiny) && item.destiny.length > 0 ? item.destiny[item.destiny.length - 1].address : '',
					passengerName: item?.passenger?.person?.name || '',
					passenger: item?.passenger,
					total: item.price,
					methodPayment: this.methodPayment(item?.payment?.typePayment),
					status: this.orderStatus(item.status),
				});
			});

			this.list = ELEMENT_DATA;
			self.dataSource = new MatTableDataSource(ELEMENT_DATA);
			self.totalLength = reportResponse.total ? reportResponse.total : 0;
			this.changeDetectorRefs.detectChanges();
		}

		const respBalance: any = await this.admReportService.passengerBalance(this.filter).toPromise();

		if (respBalance) {
			this.aproved = respBalance.aproved;
			this.canceled = respBalance.canceled;
			this.total = respBalance.total;

			this.changeDetectorRefs.detectChanges();
		} else {
			this.resetValues();
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

	onClickPassengerFilter(person: any) {
		if (person && person.passenger && person.passenger._id) {
			this.filter.passenger = person.passenger._id;
			this.getList(0, this.pageSize, this.filter);
		} else {
			delete this.filter.passenger;
		}
	}

	orderStatus(status) {
		switch (status) {
			case 'concluded':
				return 'Finalizado';
			case 'canceled':
				return 'Cancelado';
			case 'driver_not_found':
				return 'Motorista Não Encontrado';
			case 'in_progress':
				return 'Em Andamento';
			case 'accepted':
				return 'Aceito';
			case 'waiting':
				return 'Aguardando';
			default:
				return status;
		}
	}

	methodPayment(type) {
		switch (type) {
			case 'MONEY':
				return 'Dinheiro';
			case 'CARD':
				return 'Maquininha';
			case 'BRASPAG':
				return 'APP';
			case 'PAGARME':
				return 'APP';
			case 'PIX':
				return 'PIX';
			default:
				return '';
		}
	}

	resetValues() {
		this.aproved = '';
		this.canceled = '';
		this.total = '';
	}

		async generateExcel() {
		try {
			const title = `report_race_page_${this.pageIndex + 1}`;
			this.exporting = true;

			const response: any = await this.admReportService
				.passengerPaginator({
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
						PASSAGEIRO: item?.passenger?.person?.name || "",
						"LOCAL DE PARTIDA": item.origin && item.origin.address ? item.origin.address : "",
						"LOCAL DE CHEGADA": item.destiny && Array.isArray(item.destiny) && item.destiny.length > 0 ? item.destiny[item.destiny.length - 1].address : "",
						TOTAL: item.price,
						MOTORISTA: item?.driver?.name,
						"MÉTODO DE PAGAMENTO": methodPayment(item.payment.typePayment),
						STATUS: this.orderStatus(item.status),
						ID: item._id,
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
			this.changeDetectorRefs.detectChanges();
			this.exporting = false;
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
}
