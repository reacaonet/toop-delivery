import { Component, AfterViewInit, OnInit, ChangeDetectorRef, ViewChild } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { TranslateService } from "@ngx-translate/core";
import { FormGroup, FormControl } from "@angular/forms";
import moment from "moment";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import * as CryptoJS from "crypto-js";
import { ToastrService } from "ngx-toastr";
import { MapInfoWindow, MapMarker } from "@angular/google-maps";
import { startWith, debounceTime, switchMap, filter, catchError, map } from "rxjs/operators";
import { Observable, of } from "rxjs";

/** Service */
import { AdmReportService } from "../../../../../services/mobility/report/admReport.service";
import { BookingService } from "../../../../../services/mobility/booking.service";
import databaseSync from "./../../../../../services/firebase/FirebaseDatabaseSync";
import { FranchiseService } from "../../../../../services/franchise.service";
import { DriverService } from "../../../../../services/mobility/driver.service";
import { ApplicationsService } from "../../../../../services/applications.service";

/** Util */
import { methodPayment, checkObjectIdisValid } from "../../../../util";
import { environment } from "../../../../../../environments/environment";

@Component({
	selector: "kt-monitoring",
	templateUrl: "./monitoring.component.html",
	styleUrls: ["./monitoring.component.scss"],
})
export class MonitoringComponent implements OnInit, AfterViewInit {
	@ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;

	formFilter: FormGroup;
	bookings: any = [];
	user: any = null;
	processing = false;
	loading = false;
	loadCancel = false;
	loadFinal = false;
	loadDriver = false;
	bookingCurrent;
	filter: any = {
		pageIn: 1,
		pageOut: 10,
	};
	userLogged;
	urlMap: any = false;
	apiKey = environment.GOOGLE_MAPS;
	apiLoaded: Observable<boolean>;
	center = { lat: -16.739228, lng: -49.269136 };
	zoom = 4;
	windowWidth: number;
	windowHeight: number;
	listFranchise: any = [];
	drivers: any[] = [];
	selectedDriver: any = null;
	markerPositions: any = [];
	radius = 30000;
	circleOptions = {
		fillColor: "transparent",
		strokeColor: "gray",
		strokeOpacity: 1,
		strokeWeight: 1,
	};
	infoCurrent: any = {
		status: "-",
		update: "",
		icon: "",
	};
	regionDefault = null;
	markerNotify = [];
	showOptionsEndAndCancelRace: boolean;

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		httpClient: HttpClient,
		private admReportService: AdmReportService,
		private translate: TranslateService,
		private modalService: NgbModal,
		private bookingService: BookingService,
		private toastr: ToastrService,
		private franchiseService: FranchiseService,
		private driverService: DriverService,
		private applicationsService: ApplicationsService
	) {
		this.urlMap = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=visualization`;

		this.apiLoaded = httpClient.jsonp(this.urlMap, "callback").pipe(
			map((result) => {
				return true;
			}),
			catchError(() => of(false))
		);
	}

	async ngOnInit() {
		this.user = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;

		this.getBookings(this.filter);

		setInterval(async () => {
			try {
				await this.admReportService.activeMonitoring().toPromise();
			} catch (err) {
				console.log("fail", err);
			}
		}, 300000);

		this.admReportService.activeMonitoring({ firebase: true }).subscribe((result: any) => {
			// if (result && result?.encryptFirebase) {
			// 	const decryptedBytes = CryptoJS.AES.decrypt(
			// 		result?.encryptFirebase,
			// 		environment.CRYPT_TOKEN
			// 	);
			// 	const decryptedConfig = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
			// 	this.monitoringFirebase(decryptedConfig);
			// }

			this.monitoringFirebase();
		});

		this.getWindowSize();
		window.addEventListener("resize", this.getWindowSize.bind(this));

		await this.addFormFilter();
	}

	ngAfterViewInit() {}

	async getBookings(params: any = {}, init = true) {
		try {
			this.loading = true;
			const list = await this.admReportService.monitoringBookings(params).toPromise();

			if (list && Array.isArray(list)) {
				if (init === true) {
					this.bookings = list;
					this.markerPositions = [];
					await this.setMarker(list);
					this.markerNotify = [...this.markerPositions];
					await this.searchDriver();
				} else {
					this.bookings = this.bookings.concat(list);
					await this.setMarker(list);
				}
			} else if (init === true) {
				this.markerPositions = [];
			}
		} catch (err) {
			this.bookings = [];
		}

		this.loading = false;
		this.changeDetectorRefs.detectChanges();
	}

	async addFormFilter() {
		this.formFilter = new FormGroup({
			franchise: new FormControl("", [checkObjectIdisValid]),
			radius: new FormControl("30000"),
			driver: new FormControl(undefined),
		});

		this.formFilter
			.get("franchise")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(700),
				switchMap((value) => {
					if (typeof value === "string" && value.length > 0) {
						return this.franchiseService.getFranchisesNome(value, undefined);
					} else {
						if (this.filter.franchiseId) {
							delete this.filter.franchiseId;
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
			.get("radius")
			.valueChanges.pipe(
				startWith(""),
				switchMap((value) => {
					if (value && `${value}`.length > 0) {
						this.radius = parseInt(`${value}`);
						return [];
					}

					return [];
				})
			)
			.subscribe((response) => {
				//
			});

		this.formFilter
			.get("driver")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(700),
				switchMap((value) => {
					if (value?.length > 2) return this.driverService.getName(value);

					return [];
				})
			)
			.subscribe((results: any) => {
				this.drivers = results;
				this.changeDetectorRefs.detectChanges();
			});

		const regionFranchise = localStorage.getItem("@regionFranchise")
			? JSON.parse(localStorage.getItem("@regionFranchise"))
			: undefined;
		if (regionFranchise && regionFranchise?.location?.coordinates) {
			this.formFilter.controls.franchise.setValue(regionFranchise);
			this.onClickFranchiseFilter(regionFranchise);
		}
	}

	viewMore() {
		this.filter.pageIn++;
		this.getBookings(this.filter, false);
	}

	getStatus(status) {
		switch (status) {
			case "waiting":
				return "Procurando Motoristas";
			case "accepted":
				return "Solicitação Aceita";
			case "in_progress":
				return "viagem em andamento";
			case "scheduled":
				return "Agendado";
			default:
				return " - ";
		}
	}

	getDestiny(destiny) {
		return destiny && Array.isArray(destiny) && destiny.length > 0
			? destiny[destiny.length - 1].address
			: "";
	}

	getDate(date) {
		return moment(date).format("DD/MM/YYYY HH:mm");
	}

	getMethodPayment(typePayment, directPayment = "") {
		return methodPayment(typePayment, directPayment);
	}

	async monitoringFirebase() {
		const firebase = databaseSync();

		if (firebase) {
			if (this.user?.isRoot) {
				// monitorar aplicação
				let urlRef = `${environment.firebasePath}monitoring/root`;
				await firebase.ref(urlRef).remove();

				firebase.ref(urlRef).on("value", async (snapshot: any) => {
					const respMonitoring = snapshot.val();
					if (respMonitoring) {
						await this.getBookings();
						this.toastr.success("Novas Informações", "Atualização recebida");
					}
				});
			} else if (this.user?.franchise) {
				// Monitorar apenas franquia
				let urlRef = `${environment.firebasePath}monitoring/franchise/${this.user?.franchise}`;

				await firebase.ref(urlRef).remove();
				firebase.ref(urlRef).on("value", async (snapshot: any) => {
					const respMonitoring = snapshot.val();
					if (respMonitoring) {
						await this.getBookings();
						this.toastr.success("Novas Informações", "Atualização recebida");
					}
				});
			}
		}
	}

	showModalOptions(content, booking) {
		this.bookingCurrent = booking;
		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-create-applications",
				size: "sm",
				backdrop: "static",
			})
			.result.then(
				(result) => {
					this.changeDetectorRefs.detectChanges();
				},
				(reason) => {}
			);
	}

	async cancelRace() {
		try {
			this.loadCancel = true;
			this.changeDetectorRefs.detectChanges();

			let reason = "Viagem cancelada pelo admin";
			let canceledBy = "system";

			const response = await this.bookingService
				.cancelRace(this.bookingCurrent._id, reason, canceledBy)
				.toPromise();

			this.toastr.success("Solicitação concluída com sucesso!!");
			this.loadCancel = false;

			this.getBookings();
			this.modalService.dismissAll();
			this.changeDetectorRefs.detectChanges();
		} catch (err) {
			let message = "Não foi possível cancelar solicitação";

			if (err.error && err.error.message) {
				message = err.error.message;
			}

			this.toastr.error(message);
			this.loadCancel = false;
			this.changeDetectorRefs.detectChanges();
		}
	}

	async finishRace() {
		try {
			this.loadFinal = true;
			this.changeDetectorRefs.detectChanges();

			let params = {
				driverId: this.bookingCurrent?.driver?._id,
				bookingId: this.bookingCurrent?._id,
				confirmationCode: this.bookingCurrent?.confirmationCode || "",
				finishAdmin: true,
			};

			await this.bookingService.finalizeRace(params).toPromise();

			this.toastr.success("Solicitação finalizada com sucesso!!");
			this.loadFinal = false;

			this.getBookings();
			this.modalService.dismissAll();
			this.changeDetectorRefs.detectChanges();
		} catch (err) {
			let message = "Não foi possível finalizar solicitação";

			if (err.error && err.error.message) {
				message = err.error.message;
			}

			this.toastr.error(message);
			this.loadFinal = false;
			this.changeDetectorRefs.detectChanges();
		}
	}

	async onClickFranchiseFilter(franchise) {
		if (franchise && franchise?.location && franchise?.location?.coordinates) {
			localStorage.setItem("@regionFranchise", JSON.stringify(franchise));
			this.changeDetectorRefs.detectChanges();
		}
	}

	async onClickDriverFilter(driver) {
		this.selectedDriver = null;

		if (driver?.location && driver?.location?.coordinates) {
			this.setMarkerDriver([driver]);
			this.center = {
				lat: driver?.location?.coordinates[1],
				lng: driver?.location?.coordinates[0],
			};
			this.zoom = 20;

			this.changeDetectorRefs.detectChanges();
		}
	}

	displayFn(data: any) {
		if (data) {
			return data.name;
		}
	}

	async setMarker(list: any) {
		list.forEach((item: any) => {
			let icon = "";
			let status = "";

			if (item.status === "accepted" || item.status === "scheduled") {
				icon = "https://tilary.sfo3.digitaloceanspaces.com/assets/map/car_32_accepted.png";
			} else if (item.status === "in_progress") {
				icon = "https://tilary.sfo3.digitaloceanspaces.com/assets/map/car_32_route.png";
			}

			status = this.getStatus(item?.status);

			if (item && item?.driver && item?.driver?.location) {
				this.markerPositions.push({
					position: {
						lat: item?.driver?.location?.coordinates[1] || 0,
						lng: item?.driver?.location?.coordinates[0] || 0,
					},
					options: {
						draggable: false,
						icon: icon,
						passenger: item?.passenger?.person?.name,
						driver: item?.driver?.name,
						status: status,
						update: moment(item?.driver.updatedAt).format("DD/MM HH:mm"),
						startRaceAt: item?.startRaceAt ? moment(item?.startRaceAt).format("DD/MM HH:mm") : "",
					},
				});
			} else if (item?.origin && item?.origin?.coordinates) {
				icon = "https://tilary.sfo3.digitaloceanspaces.com/assets/map/passenger.png";

				this.markerPositions.push({
					position: {
						lat: item?.origin?.coordinates[1] || 0,
						lng: item?.origin?.coordinates[0] || 0,
					},
					options: {
						draggable: false,
						icon: icon,
						passenger: item?.passenger?.person?.name,
						status: status,
						update: moment(item?.updatedAt).format("DD/MM HH:mm"),
						startRaceAt: item?.startRaceAt ? moment(item?.startRaceAt).format("DD/MM HH:mm") : "",
					},
				});
			}
		});
	}

	async setMarkerDriver(list: any) {
		list.forEach((item: any) => {
			let icon = "";
			let status = "";

			if (item.online === true) {
				icon = "https://tilary.sfo3.digitaloceanspaces.com/assets/map/car_32_online.png";
				status = "Disponível";
			} else {
				icon = "https://tilary.sfo3.digitaloceanspaces.com/assets/map/car_32_offline.png";
				status = "Offline";
			}

			this.markerPositions.push({
				position: {
					lat: item?.location?.coordinates[1] || 0,
					lng: item?.location?.coordinates[0] || 0,
				},
				options: {
					draggable: false,
					icon: icon,
					driver: item?.name || null,
					status: status,
					update: moment(item?.updatedAt).format("DD/MM HH:mm"),
				},
			});
		});
	}

	getWindowSize(): void {
		this.windowWidth = window.innerWidth;
		this.windowHeight = window.innerHeight - 75;
	}

	openInfoWindow(marker: MapMarker, item: any) {
		let options: any = item?.options || {};

		this.infoCurrent = {
			passenger: options?.passenger || null,
			driver: options?.driver || null,
			status: options?.status || "",
			update: options?.update || "",
		};

		if (options?.startRaceAt) {
			this.infoCurrent.startRaceAt = options.startRaceAt;
		}

		this.changeDetectorRefs.detectChanges();
		this.infoWindow.open(marker);
	}

	async searchDriver(search: boolean = false) {
		try {
			this.loadDriver = true;
			const regionFranchise = localStorage.getItem("@regionFranchise")
				? JSON.parse(localStorage.getItem("@regionFranchise"))
				: undefined;

			let latitude = this.center?.lat || 0;
			let longitude = this.center?.lng;

			if (regionFranchise && regionFranchise?.location?.coordinates) {
				latitude = regionFranchise?.location?.coordinates[1];
				longitude = regionFranchise?.location?.coordinates[0];
			}

			const response = await this.driverService
				.getDriverStatusFilter({
					runStatus: "available",
					radius: this.radius,
					latitude: latitude,
					longitude: longitude,
				})
				.toPromise();

			if (search) {
				const list = await this.admReportService.monitoringBookings({ ...this.filter }).toPromise();
				this.bookings = list;
				this.markerPositions = [];
				await this.setMarker(list);
				this.markerNotify = [...this.markerPositions];
			}

			if (response && Array.isArray(response) && response.length > 0) {
				this.markerPositions = [...this.markerNotify];
				await this.setMarkerDriver(response);
			} else {
				this.markerPositions = [...this.markerNotify];
			}

			if (regionFranchise && regionFranchise?.location?.coordinates) {
				this.center = {
					lat: latitude,
					lng: longitude,
				};
				this.zoom = 11;
			}
		} catch (err) {
			//
		}

		this.loadDriver = false;

		setTimeout(() => {
			this.changeDetectorRefs.detectChanges();
		}, 1000);
	}

	formatDateStartRace(date: string) {
		return moment(date).format("DD/MM HH:mm");
	}
}
