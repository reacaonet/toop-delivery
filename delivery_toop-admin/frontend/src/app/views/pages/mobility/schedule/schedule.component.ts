import { Component, AfterViewInit, OnInit, ChangeDetectorRef } from "@angular/core";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import moment from "moment";
import { startWith, debounceTime, switchMap, tap, catchError } from "rxjs/operators";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { forkJoin, of } from "rxjs";

/** Service */
import { AdmReportService } from "../../../../services/mobility/report/admReport.service";
import { CompanyService } from "../../../../services/company.service";
import { FranchiseService } from "../../../../services/franchise.service";
import { ServiceService } from "../../../../services/mobility/service.service";
import { MapService } from "../../../../services/mobility/maps.service";
import { DriversService } from "../../../../services/drivers.service";
import { PassengerService } from "../../../../services/mobility/passenger.service";
import { ClientService } from "../../../../services/client.service";
import { BookingService } from "../../../../services/mobility/booking.service";
/** Util */
import { methodPayment, orderStatus, checkObjectIdisValid } from "../../../util";
import { Franchise } from "../../../../../models/franchise";

@Component({
	selector: "kt-finacial-adm",
	templateUrl: "./schedule.component.html",
	styleUrls: ["./schedule.component.scss"],
})
export class ScheduleComponent implements OnInit, AfterViewInit {
	dataSource;
	displayedColumns = [
		"date",
		"startAt",
		"origin",
		"destiny",
		"passenger",
		"driver",
		"phone",
		"vehicle",
		"total",
		"methodPayment",
		"externalConsultant",
		"internalConsultant",
		// "company",
		// "client",
		"status",
		"action",
	];
	formFilter: FormGroup;
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100, 200];
	filter: any = {
		startDate: moment().subtract(30, "days").format("YYYY-MM-DD"),
		endDate: moment().add("1", "days").format("YYYY-MM-DD"),
		status: "scheduled",
	};
	totalLength;
	formData: FormArray;
	formSubmit: boolean = false;
	list: any[] = [];
	companiesFilter: any = [];
	services: any = [];
	franchises: any = [];
	companies: any = [];
	currencySymbol = "";
	load: Boolean = false;
	pageIndex = 0;
	origins: any[];
	destinys: any[];
	drivers: any[];
	clients: any[];
	passengers: any[];
	showPaginator = false;
	languageDefault = "pt-BR";
	travelBooking: any = null;
	listFranchise: any = [];
	franchise: Franchise;
	isRoot: boolean = false;

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private admReportService: AdmReportService,
		private bookingService: BookingService,
		private companyService: CompanyService,
		private franchiseService: FranchiseService,
		private serviceService: ServiceService,
		private driverService: DriversService,
		private passengerService: PassengerService,
		private mapService: MapService,
		private clientService: ClientService
	) {}

	async ngOnInit() {
		const userStorage = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;

		await this.addFormFilter();
		this.getList(this.pageIndex, this.pageSize, this.filter);
		this.newFormData();
		this.addNewFormArray();
	}

	ngAfterViewInit() {}

	async addFormFilter() {
		this.formFilter = new FormGroup({
			dateInit: new FormControl(moment(this.filter.startDate).format("DD/MM/YYYY")),
			dateFinal: new FormControl(moment(this.filter.endDate).format("DD/MM/YYYY")),
			typePayment: new FormControl("all", []),
			franchise: new FormControl(undefined, [checkObjectIdisValid]),
			// company: new FormControl(undefined, [checkObjectIdisValid]),
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
						this.filter.startDate = moment(value, "DD/MM/YYYY").format("YYYY-MM-DD");
						return this.getList(this.pageIndex, this.pageSize, this.filter);
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
						this.filter.endDate = moment(value, "DD/MM/YYYY").format("YYYY-MM-DD");
						return this.getList(this.pageIndex, this.pageSize, this.filter);
					}

					return [];
				})
			)
			.toPromise();

		// this.formFilter
		// 	.get("company")
		// 	.valueChanges.pipe(
		// 		startWith(""),
		// 		debounceTime(700),
		// 		switchMap((value) => {
		// 			if (typeof value === "string" && value.length > 0) {
		// 				return this.companyService.getCompaniesNome(value);
		// 			}
		// 			return [];
		// 		})
		// 	)
		// 	.subscribe((results: any) => {
		// 		this.companiesFilter = results;
		// 		this.changeDetectorRefs.detectChanges();
		// 	});

		this.formFilter
			.get("franchise")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(700),
				switchMap((value) => {
					if (typeof value === "string" && value.length > 0) {
						return this.franchiseService.getFranchisesNome(value, undefined);
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
		const self = this;
		const ELEMENT_DATA = [];
		const getParams = { ...params };

		const reportResponse: any = await this.admReportService
			.runningPaginator({
				pageIn,
				pageOut,
				...getParams,
			})
			.toPromise();

		if (reportResponse.list) {
			reportResponse.list.forEach((item: any, index) => {
				let labelPayment = item?.payment?.typePayment;
				switch (item?.directPayment) {
					case "PIX_DRIVER":
					case "CARD_DRIVER":
						labelPayment = item?.directPayment;
				}

				ELEMENT_DATA.push({
					...item,
					_id: item._id,
					date: item.date,
					origin: item.origin && item.origin.address ? item.origin.address : "",
					destiny:
						item.destiny && Array.isArray(item.destiny) && item.destiny.length > 0
							? item.destiny[item.destiny.length - 1].address
							: "",
					additionalStops: item?.additionalStops || [],
					passengerName: item?.passenger?.person?.name || "",
					passenger: item?.passenger,
					driverName: item?.driver?.name || "",
					driverVehicleModel: item?.driver?.vehicleModel,
					driverPhone: item?.driver?.phone,
					driverId: item?.driver,
					total: Number(item?.price || 0)
						.toFixed(2)
						.replace(".", ","),
					payment: item?.payment,
					// methodPayment: methodPayment(item?.payment?.typePayment, item?.directPayment || null),
					methodPayment: methodPayment(labelPayment),
					status: orderStatus(item.status),
					statusBooking: item.status,
					service: item.service ? item.service : null,
					reason: item.reason ? item.reason : null,
					reasonTrip: item.reasonTrip ? item.reasonTrip : null,
					canceledBy: item.canceledBy ? item.canceledBy : null,
					driverCredit: item.driverCredit ? item.driverCredit : null,
					currencySymbol: item?.payment?.currencySymbol,
					historic: item?.historic,
					travelledDistance: item?.travelledDistance,
					createdAt: item?.createdAt,
					startRaceAt: item?.startRaceAt,
					startAt: item?.startAt,
					internalConsultant: item?.internalConsultant || "N/A",
					externalConsultant: item?.externalConsultant || "N/A",
					clientName: item?.client?.tradeName || "N/A",
				});
			});

			this.list = ELEMENT_DATA;
			self.dataSource = new MatTableDataSource(ELEMENT_DATA);
			self.totalLength = reportResponse.total ? reportResponse.total : 0;
			this.changeDetectorRefs.detectChanges();
		}
	}

	newFormData() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormArray([]);

			return resolve(true);
		});
	}

	addNewFormArray(data: any = {}, action: "create" | "edit" = "create") {
		return new Promise(async (resolve, reject) => {
			const formControl = new FormGroup({
				id: new FormControl(data._id || undefined),
				origin: new FormControl(data.origin || undefined),
				destiny: new FormControl(data.destiny || undefined),
				additionalStops: new FormArray(data.additionalStops || []),
				service: new FormControl(data.service || undefined),
				price: new FormControl(data.price || 0),
				distance: new FormControl(data.distance || ""),
				routeTime: new FormControl(data.routeTime || ""),
				driverId: new FormControl(data.driverId || undefined),
				client: new FormControl(data.client || undefined),
				passenger: new FormControl(data.passenger || undefined),
				createPassenger: new FormControl(false),
				// company: new FormControl(data.company || undefined),
				startRaceAt: new FormControl(data.startRaceAt || new Date()),
				externalConsultant: new FormControl(data.externalConsultant || undefined),
				internalConsultant: new FormControl(data.internalConsultant || undefined),
				action: new FormControl(action || "create"),
			});

			// formControl
			// 	.get("company")
			// 	.valueChanges.pipe(
			// 		startWith(""),
			// 		debounceTime(1000),
			// 		switchMap((value) => {
			// 			return typeof value === "string" && value.length > 0
			// 				? this.companyService.getCompaniesNome(value)
			// 				: [];
			// 		})
			// 	)
			// 	.subscribe((results) => {
			// 		this.companies = results;
			// 		this.changeDetectorRefs.detectChanges();
			// 	});

			formControl
				.get("service")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => {
						return typeof value === "string" && value.length > 0
							? this.serviceService.getNome(value)
							: [];
					})
				)
				.subscribe((results) => {
					if (results && Array.isArray(results)) {
						this.services = results;
					} else {
						this.services = [];
					}
					this.changeDetectorRefs.detectChanges();
				});

			formControl
				.get("origin")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => {
						return typeof value === "string" && value.length > 0
							? this.mapService.autoComplete(value)
							: [];
					})
				)
				.subscribe((results) => {
					this.origins = results;
					this.changeDetectorRefs.detectChanges();
				});

			formControl
				.get("destiny")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => {
						return typeof value === "string" && value.length > 0
							? this.mapService.autoComplete(value)
							: [];
					})
				)
				.subscribe((results) => {
					this.destinys = results;
					this.changeDetectorRefs.detectChanges();
				});

			formControl
				.get("driverId")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => {
						return typeof value === "string" && value.length > 0
							? this.driverService.getNome(value)
							: [];
					})
				)
				.subscribe((results) => {
					this.drivers = results;
					this.changeDetectorRefs.detectChanges();
				});

			formControl
				.get("passenger")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => {
						return typeof value === "string" && value.length > 0
							? this.passengerService.getFilter({ name: value })
							: [];
					})
				)
				.subscribe((results: any) => {
					this.passengers = results;
					this.changeDetectorRefs.detectChanges();
				});

			// formControl
			// 	.get("client")
			// 	.valueChanges.pipe(
			// 		startWith(""),
			// 		debounceTime(1000),
			// 		switchMap((value) => {
			// 			return typeof value === "string" && value.length > 0
			// 				? this.clientService.searchClient(value)
			// 				: [];
			// 		})
			// 	)
			// 	.subscribe((results: any) => {
			// 		this.clients = results;
			// 		this.changeDetectorRefs.detectChanges();
			// 	});

			this.formData?.push(formControl);

			return resolve(true);
		});
	}

	duplicateFormArrayItem(index: number) {
		this.addNewFormArray(this.formData.controls[index].value);
	}

	removeFormArrayItem(index: number) {
		this.formData.removeAt(index);
		this.changeDetectorRefs.detectChanges();
	}

	async upsertModalShow(booking, content) {
		await this.newFormData();
		this.formSubmit = false;

		if (booking) {
			if (booking.passenger) {
				booking.passenger = {
					_id: booking.passenger?.person?._id,
					name: booking.passenger?.person?.name,
					passenger: {
						_id: booking.passenger?._id,
					},
				};
			}

			if (booking.startRaceAt) {
				const d = new Date(booking.startRaceAt);
				booking.startRaceAt = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
					.toISOString()
					.slice(0, -1);
			}
			await this.addNewFormArray(booking, "edit");
		} else {
			await this.addNewFormArray();
		}

		this.changeDetectorRefs.detectChanges();
		this.modalService.open(content, { ariaLabelledBy: "modal-edit-race", size: "lg" }).result.then(
			(result) => {},
			(reason) => {}
		);
	}

	async confirmPaginator() {
		await this.getList(this.pageIndex, this.pageSize, this.filter);
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.pageIndex = event.pageIndex;
		if (event.pageSize === 1000000) {
			this.showPaginator = true;
		} else {
			this.showPaginator = false;
		}
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

	async onClickCompanyFilter(company) {
		this.filter.company = company?._id;
		await this.getList(this.pageIndex, this.pageSize, this.filter);
	}

	async onClickFranchiseFilter(franchise) {
		if (franchise && franchise._id) {
			this.filter.franchise = franchise._id;
			this.getList(this.pageIndex, this.pageSize, this.filter);
		} else {
			delete this.filter.franchise;
		}

		// Limpar campo company
		// this.formFilter.patchValue({ company: undefined });
		this.companiesFilter = [];

		this.changeDetectorRefs.detectChanges();
		return franchise;
	}

	extractKeyName(obj) {
		if (obj?.name) return obj.name;
	}

	extractKeyClientName(obj) {
		if (obj?.tradeName) return obj.tradeName;
	}

	extractAutoComplete(obj) {
		if (typeof obj == "string") return obj;

		if (obj?.description) return obj.description;
	}

	async createBooking(booking: any) {
		const payload = { ...booking, action: undefined };

		if (typeof payload?.origin == "string") {
			delete payload.origin;
		}
		if (typeof payload?.destiny == "string") {
			delete payload.destiny;
		}
		if (typeof payload?.startRaceAt == "string") {
			payload.startRaceAt = new Date(payload?.startRaceAt);
		}

		if (payload?.company) payload.company = payload.company._id;
		if (payload?.driverId) payload.driverId = payload.driverId._id;
		if (payload?.service) payload.service = payload.service._id;
		if (payload?.origin?.place_id) {
			const origin: any = await this.mapService
				.geocode({ placeId: payload.origin.place_id })
				.toPromise();
			payload.origin = {
				latitude: origin.latitude,
				longitude: origin.longitude,
				address: origin.address,
			};
		}

		if (payload?.destiny?.place_id) {
			const destiny: any = await this.mapService
				.geocode({ placeId: payload.destiny.place_id })
				.toPromise();
			payload.destiny = [
				{ latitude: destiny.latitude, longitude: destiny.longitude, address: destiny.address },
			];
		}

		if (payload?.routeTime == null) payload.routeTime = "";
		if (payload?.distance == null) payload.distance = "";
		if (typeof payload?.passenger == "object" && payload?.passenger?.passenger?._id)
			payload.passenger = payload.passenger.passenger._id;
		if (payload?.client?._id) payload.client = payload?.client?._id;

		if (booking.action != "create") {
			return this.bookingService.updateSchedule(payload);
		}

		delete payload.id;
		return this.bookingService.schedule(payload);
	}

	async upsert(bookings: any[]) {
		console.log("bookings", bookings);
		this.formSubmit = true;
		const observables = [];

		for (let i in bookings) {
			let observable = (
				await this.createBooking({ ...bookings[i], tag: bookings[i]?.tag?.name ?? "" })
			).pipe(
				tap(() => {
					const index = this.formData.controls.findIndex((f) => f.value == bookings[i]);

					if (index != -1) this.removeFormArrayItem(index);
				}),
				catchError((err) => of(null))
			);

			observables.push(observable);
		}

		forkJoin(observables).subscribe(async (data) => {
			if (data.includes(null)) {
				this.formSubmit = false;
				this.toastr.error(
					"Ocorreu um erro desconhecido! Os registros bem sucedidos foram removidos da lista.",
					"Erro!"
				);
				await this.getList(this.pageIndex, this.pageSize, this.filter);
				this.changeDetectorRefs.detectChanges();
			} else {
				await this.getList(this.pageIndex, this.pageSize, this.filter);
				this.changeDetectorRefs.detectChanges();
				this.modalService.dismissAll();
				this.toastr.success("Registros cadastrado com sucesso!", "Sucesso!");
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	async cancelRace(booking: any) {
		try {
			this.load = true;
			this.changeDetectorRefs.detectChanges();

			let reason = "Viagem cancelada pelo admin";
			let canceledBy = "system";

			const response = await this.bookingService
				.cancelRace(booking._id, reason, canceledBy)
				.toPromise();

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
}
