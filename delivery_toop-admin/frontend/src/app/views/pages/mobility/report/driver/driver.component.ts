import { Driver } from "./../../../../../../models/mobility/driver";
import { async } from "@angular/core/testing";
import {
	Component,
	AfterViewInit,
	OnInit,
	ChangeDetectorRef,
	ViewChild,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import moment from "moment";
import {
	startWith,
	debounceTime,
	switchMap,
	map,
	filter,
} from "rxjs/operators";
import { MatSort, Sort } from "@angular/material/sort";

/** Service */
import { DriverService } from "../../../../../services/mobility/driver.service";
import { ExcelService } from "../../../../../services/excel/excel.service";
import { checkObjectIdisValid } from "../../../../../util";

@Component({
	selector: "kt-driver",
	templateUrl: "./driver.component.html",
	styleUrls: ["./driver.component.scss"],
})
export class DriverComponent implements OnInit, AfterViewInit {
	formData;
	dataSource;
	totalLength;
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	displayedColumns = [
		"name",
		"cpf",
		"email",
		"birthDate",
		"stars",
		"totalRating",
		"status",
		"isOnline",
		"view",
	];
	list: any[] = [];
	formFilter: FormGroup;
	filter: any = {
		startDate: moment().subtract(30, "days").format("YYYY-MM-DD"),
		endDate: moment().format("YYYY-MM-DD"),
	};
	listDriver: any = [];
	driver: Driver[] = [];
	@ViewChild("empTbSort") empTbSort = new MatSort();
	columnActive = "totalRating";
	columnRatingActive = "totalRating";
	columnDirection = "desc";
	exporting: Boolean = false;
	load: Boolean = false;
	pageIndex = 0;

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private driverService: DriverService,
		private excelService: ExcelService
	) { }

	async ngOnInit() {
		await this.addFormFilter();
		this.getList(
			0,
			this.pageSize,
			this.formFilter?.controls?.driver?.value,
			this.formFilter?.controls?.status?.value,
			this.formFilter?.controls?.email.value,
			this.formFilter?.controls?.online.value,
			this.filter.startDate,
			this.filter.endDate,
			`${this.columnActive} ${this.columnDirection} ${this.columnRatingActive}`
		);
	}

	async addFormFilter() {
		return new Promise(async (resolve, reject) => {
			this.formFilter = new FormGroup({
				driver: new FormControl(undefined, [checkObjectIdisValid]),
				email: new FormControl(undefined, []),
				status: new FormControl("all"),
				online: new FormControl(undefined, []),
				dateInit: new FormControl(
					moment(this.filter.startDate).format("DD/MM/YYYY")
				),
				dateFinal: new FormControl(
					moment(this.filter.endDate).format("DD/MM/YYYY")
				),
			});

			this.formFilter
				.get("email")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => {
						if (value && typeof value === "string" && value.length > 0) {
							this.filter.email = value;
							return this.getList(
								0,
								this.pageSize,
								this.formFilter?.controls?.driver?.value,
								this.formFilter?.controls?.status?.value,
								value,
								this.formFilter?.controls?.online.value,
								this.filter.startDate,
								this.filter.endDate,
								`${this.columnActive} ${this.columnDirection}, ${this.columnRatingActive}`
							);
						}

						return [];
					})
				)
				.subscribe((results) => {
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

			this.formFilter
				.get("status")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) =>
						typeof value === "string" && value.length > 0
							? this.getList(
								0,
								this.pageSize,
								this.formFilter?.controls?.driver?.value,
								value,
								this.formFilter?.controls?.email.value,
								this.formFilter?.controls?.online.value,
								this.filter.startDate,
								this.filter.endDate,
								`${this.columnActive} ${this.columnDirection} ${this.columnRatingActive}`
							)
							: []
					)
				)
				.subscribe(() => {
					this.changeDetectorRefs.detectChanges();
				});

			this.formFilter
				.get("online")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) =>
						typeof value === "string" && value.length > 0
							? this.getList(
								0,
								this.pageSize,
								this.formFilter?.controls?.driver?.value,
								this.formFilter?.controls?.status?.value,
								this.formFilter?.controls?.email.value,
								value,
								this.formFilter?.controls?.dateInit?.value,
								this.filter.endDate,
								`${this.columnActive} ${this.columnDirection} ${this.columnRatingActive}`
							)
							: []
					)
				)
				.subscribe(() => {
					this.changeDetectorRefs.detectChanges();
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
							return this.getList(
								0,
								this.pageSize,
								this.formFilter?.controls?.driver?.value,
								this.formFilter?.controls?.status?.value,
								this.formFilter?.controls?.email.value,
								this.formFilter?.controls?.online.value,
								this.filter.startDate,
								this.filter.endDate,
								`${this.columnActive} ${this.columnDirection} ${this.columnRatingActive}`
							);
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
							return this.getList(
								0,
								this.pageSize,
								this.formFilter?.controls?.driver?.value,
								this.formFilter?.controls?.status?.value,
								this.formFilter?.controls?.email.value,
								this.formFilter?.controls?.online.value,
								this.filter.startDate,
								this.filter.endDate,
								`${this.columnActive} ${this.columnDirection} ${this.columnRatingActive}`
							);
						}

						return [];
					})
				)
				.toPromise();
			return resolve(true);
		});
	}

	ngAfterViewInit() { }

	async getList(
		pageIn,
		pageOut,
		driverId,
		status,
		email,
		online,
		dateInit,
		dateFinal,
		order = ""
	) {
		const ELEMENT_DATA = [];
		const self = this;

		driverId = driverId && driverId._id ? driverId._id : driverId;

		const reportDriver: any = await this.driverService
			.driverPaginator(
				pageIn,
				pageOut,
				driverId,
				status,
				email,
				online,
				dateInit,
				dateFinal,
				order
			)
			.toPromise();
		if (reportDriver.list) {
			reportDriver.list.forEach((item: any, index) => {
				ELEMENT_DATA.push({
					id: item._id,
					name: item?.name,
					driver: item?.driver ? item.driver : {},
					cpf: item.cpf,
					email: item?.email ? item.email : {},
					birthDate: item.birthDate,
					totalRating: item.rating?.totalRating || 0,
					// totalStars: (Number(item.rating?.totalStars || 0) / totalRating).toFixed(2),
					stars: Number(item.stars).toFixed(2),
					status: item?.status,
					online: item?.online,
				});
			});
			this.list = ELEMENT_DATA;
			self.dataSource = new MatTableDataSource(ELEMENT_DATA);
			self.totalLength = reportDriver.total ? reportDriver.total : 0;
			this.changeDetectorRefs.detectChanges();
		}
	}

	async onClickDriverFilter(driver) {
		if (driver && driver._id) {
			this.filter.driver = driver._id;
			this.getList(
				0,
				this.pageSize,
				this.formFilter?.controls?.driver?.value,
				this.formFilter?.controls?.status?.value,
				this.formFilter?.controls?.email.value,
				this.formFilter?.controls?.online?.value,
				this.formFilter?.controls?.dateInit?.value,
				this.formFilter?.controls?.dateFinal?.value,
				`${this.columnActive} ${this.columnDirection} ${this.columnRatingActive}`
			);
		}
	}
	displayFnDriverId(driver: Driver) {
		if (driver) {
			return driver.name;
		}
	}

	sortData(event) {
		this.columnActive = event.active;
		this.columnRatingActive = event.active;
		this.columnDirection = event.direction;
		this.getList(
			0,
			this.pageSize,
			this.formFilter?.controls?.driver?.value,
			this.formFilter?.controls?.status?.value,
			this.formFilter?.controls?.email.value,
			this.formFilter?.controls?.online?.value,
			this.formFilter?.controls?.dateInit?.value,
			this.formFilter?.controls?.dateFinal?.value,
			`${this.columnActive} ${this.columnDirection} ${this.columnRatingActive}`
		);
	}

	changePage(event) {
		this.pageSize = event.pageSize;

		this.getList(
			event.pageIndex,
			event.pageSize,
			this.formFilter?.controls?.driver?.value,
			this.formFilter?.controls?.status?.value,
			this.formFilter?.controls?.email.value,
			this.formFilter?.controls?.online.value,
			this.filter.startDate,
			this.filter.endDate,
			`${this.columnActive} ${this.columnDirection} ${this.columnRatingActive}`
		);
	}

	async generateExcel() {
		try {
			const title = `report_race_page_${this.pageIndex + 1}`;
			this.exporting = true;

			const response: any = await this.driverService.driverPaginator(
				this.pageIndex,
				this.pageSize,
				this.formFilter?.controls?.driver?.value,
				this.formFilter?.controls?.status?.value,
				this.formFilter?.controls?.email.value,
				this.formFilter?.controls?.online.value,
				this.filter.startDate, this.filter.endDate,
				// `${this.columnActive} ${this.columnDirection} ${this.columnRatingActive}`
			).toPromise();

			const respJson: any = [];
			if (response && response.list && Array.isArray(response.list) && response.list.length > 0) {
				response.list.forEach((item) => {
					const birthDate = moment(item?.birthDate, "YYYY-MM-DD").isValid() ? moment(item?.birthDate, "YYYY-MM-DD").format("DD/MM/YYYY") : "Invalid date";

					respJson.push({
						NOME: item.name,
						EMAIL: item.email,
						"DATA NASCIMENTO": birthDate,
						"MÉDIA AVALIAÇÃO": item.stars,
						"TOTAL AVALIAÇÕES": item.totalRating ? item.totalRating : 0,
						"TOTAL VIAGENS": item.totalRace ? item.totalRace : 0,
						STATUS: item.status ? "Ativado" : "Desativado",
						"ESTÁ ONLINE?": item.isOnline ? "Sim" : "Não",
						NIF: item.nif,
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
