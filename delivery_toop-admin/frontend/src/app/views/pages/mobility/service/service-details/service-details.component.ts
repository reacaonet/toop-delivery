import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { startWith, debounceTime, switchMap } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { TranslateService } from "@ngx-translate/core";

/** Service */
import { ActivatedRoute, Router } from "@angular/router";
import { FranchiseService } from "./../../../../../services/franchise.service";
import { PeakHourService } from "./../../../../../services/mobility/peakHour.service";
import { ServiceService } from "../../../../../services/mobility/service.service";
import { TimeZoneService } from "../../../../../services/settings/timeZone.service";

/** Model */
import { Franchise } from "./../../../../../../models/franchise";
import { PeakHour } from "./../../../../../../models/mobility/peakHour";
import { Service } from "./../../../../../../models/mobility/service";
import { checkObjectIdisValid } from "./../../../../../util";

@Component({
	selector: "kt-service-details",
	templateUrl: "./service-details.component.html",
	styleUrls: ["./service-details.component.scss"],
})
export class ServiceDetailsComponent implements OnInit {
	franchises: Franchise[] = [];
	peakHours: PeakHour[] = [];
	formData;
	formDataPriceKM;
	formSubmit = false;
	_id: string = undefined;
	typeAction = "create";
	isRoot: boolean = false;

	bases = [
		{
			_id: "608a782bd2ff8b8975d9f315",
			name: "Preço por Minuto",
			info: "Cálculo de Preço: PB + (TM*PM)",
		},
		{
			_id: "608a7835d2ff8b8975d9f316",
			name: "Preço por Hora",
			info: "Cálculo de Preço: PB + (TH*PH)",
		},
		{
			_id: "608a783dd2ff8b8975d9f317",
			name: "Preço por Distância",
			info: "Cálculo de Preço: PB + (TKms-DB*PKms)",
		},
		{
			_id: "608a7845d2ff8b8975d9f318",
			name: "Preço por Distância e Minuto",
			info: "Cálculo de Preço: PB + (TKms-DB*PKms) + (TM*PM)",
		},
		{
			_id: "608a7851d2ff8b8975d9f319",
			name: "Preço por Distância e Hora",
			info: "Cálculo de Preço: PB + ((TKms-DB)*PKms) + (TH*PH)",
		},
	];
	baseSelected = "";
	showInfo = "";
	imputs = [{}];

	servicePeakHours = [];
	listTimeZone: any = [];
	currentTimeZone: any | null = null;
	files: Set<File>;
	makers: Set<File>;

	loading = false;
	activatedRoute: any;
	returnUrl: any;
	serviceTypes = [];

	constructor(private franchiseService: FranchiseService, private peakHourService: PeakHourService, private serviceService: ServiceService, private timeZoneService: TimeZoneService, private changeDetectorRefs: ChangeDetectorRef, private route: ActivatedRoute, private router: Router, private toastr: ToastrService, private translate: TranslateService) {
		this.getServiceTypes();
	}

	async ngOnInit() {
		this._id = this.route.snapshot.params._id;
		this.currentTimeZone = null;

		await this.newFormData();
		await this.getListTimeZone();

		if (this._id !== "" && this._id !== undefined && this._id !== null && this._id != "null") {
			this.getService();
		}
	}

	async getPeakHour(params: any) {
		try {
			const result: any = await this.peakHourService.get(params).toPromise();

			if (result && Array.isArray(result) && result.length > 0) {
				this.peakHours = result;
				let newItem = [];
				for (const itemPeak of this.peakHours) {
					const value = this.servicePeakHours.find((item) => item._id === itemPeak._id);

					if (value && value !== undefined) {
						newItem.push(value);
					}
				}

				this.servicePeakHours = [...newItem];
				this.formData.patchValue({
					peakHours: this.servicePeakHours,
				});
			} else {
				this.peakHours = [];
				this.servicePeakHours = [];
				this.formData.patchValue({
					peakHours: [],
				});
			}

			this.changeDetectorRefs.detectChanges();
		} catch (err) {
			console.log("erro", err);
		}
	}

	async onClickFranchiseFilter(franchise) {
		const result: any = await this.peakHourService.get({ franchise: franchise._id }).toPromise();

		if (result && Array.isArray(result) && result.length > 0) {
			this.peakHours = result;
		} else {
			this.peakHours = [];
		}

		this.changeDetectorRefs.detectChanges();
		return franchise;
	}

	async getService() {
		try {
			let service: any;
			service = await this.serviceService.getById(this._id).toPromise();

			this.formData.get("file").clearValidators();
			this.formData.get("file").updateValueAndValidity();
			this.formData.get("maker").clearValidators();
			this.formData.get("maker").updateValueAndValidity();

			this.formData.patchValue({
				_id: service._id,
				franchise: service.franchise,
				name: service.name,
				capacity: service.capacity,
				// priceCalculation: service.priceCalculation,
				minimumRate: service.minimumRate,
				// hourlyPrice: service.hourlyPrice,
				basePrice: service.basePrice,
				valueByPercentage: service.valueByPercentage,
				fixedValue: service.fixedValue,
				// baseDistance: service.baseDistance,
				timePrice: service.timePrice,
				currencyPrice: service.currencyPrice,
				dispensingMinutes: service.dispensingMinutes,
				// ratePerMinute: service.ratePerMinute,
				peakHours: service.peakHours,
				status: service.status,
				images: service.images && service.images[0] ? service.images[0] : undefined,
				makers: service.makers && service.makers[0] ? service.makers[0] : undefined,
				onlyForWomen: service.onlyForWomen ? service.onlyForWomen : false,
				showArrivalTime: service.showArrivalTime ? service.showArrivalTime : false,
				timeZone: service.timeZone ? service.timeZone : "",
				distance: service.distance ? service.distance : [],
				type: service.type ? service.type : "",
				radiusSendRace: service?.radiusSendRace || 8,
				info: service?.info || "",
				useDynamicsRace: service?.useDynamicsRace || false,
			});

			if (service.peakHours && Array.isArray(service.peakHours)) {
				this.servicePeakHours = service.peakHours;
			} else {
				this.servicePeakHours = [];
			}

			this.getPeakHour({ franchise: service.franchise._id });

			// Distances
			if (service.distance && Array.isArray(service.distance) && service.distance.length > 0) {
				for await (const dist of service.distance) {
					this.formDataPriceKM = new FormGroup({
						min: new FormControl(dist.min, [Validators.required]),
						max: new FormControl(dist.max, [Validators.required]),
						priceMinute: new FormControl(dist.priceMinute, [Validators.required]),
						priceKM: new FormControl(dist.priceKM, [Validators.required]),
					});

					this.formData.get("distance").push(this.formDataPriceKM);
				}
			}
		} catch (err) {
			this.toastr.error("Falha ao carregar registro. Tente Novamente!", "Falha!");
		}
	}

	async getListTimeZone() {
		try {
			this.listTimeZone = await this.timeZoneService.get().toPromise();
			this.changeDetectorRefs.detectChanges();
		} catch (err) {
			this.listTimeZone = [];
		}
	}

	async save(data: Service) {
		this.loading = true;
		this.changeDetectorRefs.detectChanges();

		if (data.timeZone && this.currentTimeZone) {
			data.timeZone = this.currentTimeZone;
		} else {
			delete data.timeZone;
		}

		if (this._id && this._id != null) {
			this.serviceService.update(data).subscribe(
				async (data: any) => {
					this.toastr.success("Registro atualizado com sucesso!", "Sucesso!");
					this.router.navigate(["/mobility/services"], {});
				},
				(error) => {
					this.toastr.error("Falha ao atualizar registro!", "Falha!");
				}
			);
		} else {
			this.serviceService.create(data).subscribe(
				async (data: any) => {
					if (this.isRoot && !data.franchise) {
						this.toastr.error(this.translate.instant("GLOBAL.LABEL.SELECTAFRANCHISE"));
						return;
					}
					this.toastr.success("Registro cadastrado com sucesso!", "Sucesso!");
					this.router.navigate(["/mobility/services"], {});
				},
				(error) => {
					this.toastr.error("Falha ao criar registro!", "Falha!");
				}
			);
		}
	}

	newFormData() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(this._id != null ? this._id : ""),
				franchise: new FormControl(undefined, [Validators.required, checkObjectIdisValid]),
				name: new FormControl(undefined, [Validators.required]),
				capacity: new FormControl(undefined, [Validators.required]),
				minimumRate: new FormControl(undefined, [Validators.required]), // aqui
				// hourlyPrice: new FormControl(undefined, [Validators.required]),
				basePrice: new FormControl("", [Validators.required]), // aqui
				valueByPercentage: new FormControl(0, [Validators.required]),
				fixedValue: new FormControl(0, [Validators.required]),
				// baseDistance: new FormControl('', [Validators.required]),
				timePrice: new FormControl(undefined, [Validators.required]), //aqui
				currencyPrice: new FormControl(undefined, [Validators.required]), //aqui
				dispensingMinutes: new FormControl(undefined, [Validators.required]),
				// ratePerMinute: new FormControl(undefined, [Validators.required]),
				file: new FormControl(undefined, [Validators.required]),
				images: new FormControl(undefined, []),
				makers: new FormControl(undefined, []),
				maker: new FormControl(undefined, [Validators.required]),
				peakHours: new FormControl(undefined, []), // aqui
				status: new FormControl(undefined, [Validators.required]),
				onlyForWomen: new FormControl(false),
				showArrivalTime: new FormControl(true),
				timeZone: new FormControl(undefined, [Validators.required]),
				distance: new FormArray([]),
				type: new FormControl("car"),
				radiusSendRace: new FormControl(8),
				info: new FormControl(""),
				useDynamicsRace: new FormControl(false),
			});

			const user = localStorage.getItem("@user-info") ? JSON.parse(localStorage.getItem("@user-info")) : undefined;

			let userId;
			if (user && user._id) {
				if (user.isRoot !== true) {
					userId = user._id;
				}
			}

			this.formData
				.get("franchise")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => (typeof value === "string" && value.length > 0 ? this.franchiseService.getFranchisesNome(value, userId) : []))
				)
				.subscribe((results) => {
					this.franchises = results;
					this.changeDetectorRefs.detectChanges();
				});
			return resolve(true);
		});
	}

	getInfoByBase(value) {
		const base = this.bases.find((i) => i._id == value);

		if (base) {
			this.showInfo = base.info;
		} else this.showInfo = "";

		this.changeDetectorRefs.detectChanges();
	}

	addPeakHour(_id, percent) {
		//verifica se ja existe
		const exists = this.servicePeakHours.find((i) => i._id == _id);
		if (!exists) this.servicePeakHours.push({ _id, percent });
		else {
			this.servicePeakHours.map((i) => {
				if (i._id == _id) {
					i.percent = percent;
				}
				return i;
			});
		}

		this.formData.patchValue({ peakHours: this.servicePeakHours });
	}

	onChange(event) {
		const selectedFiles = <FileList>event.srcElement.files;

		const fileNames = [];
		const fileList = [];
		if (event.target.files && event.target.files.length) {
			this.files = new Set();
			for (let i = 0; i < selectedFiles.length; i++) {
				fileNames.push(selectedFiles[i].name);
				this.files.add(selectedFiles[i]);

				const reader = new FileReader();
				// const [file] = event.target.files;
				reader.readAsDataURL(selectedFiles[i]);

				reader.onload = () => {
					fileList.push({ base64: reader.result });
					this.formData.patchValue({
						file: fileList,
					});
				};
			}
		}
		document.getElementById("customFileLabel").innerHTML = fileNames.join(", ");
	}

	onChangeMaker(event) {
		const selectedFiles = <FileList>event.srcElement.files;

		const fileNames = [];
		const fileList = [];
		if (event.target.files && event.target.files.length) {
			this.makers = new Set();
			for (let i = 0; i < selectedFiles.length; i++) {
				fileNames.push(selectedFiles[i].name);
				this.makers.add(selectedFiles[i]);

				const reader = new FileReader();
				// const [file] = event.target.files;
				reader.readAsDataURL(selectedFiles[i]);

				reader.onload = () => {
					fileList.push({ base64: reader.result });
					this.formData.patchValue({
						maker: fileList,
					});
				};
			}
		}
		document.getElementById("customMakerLabel").innerHTML = fileNames.join(", ");
	}

	displayFnFranchise(franchise) {
		if (franchise) {
			return franchise.name;
		}
	}

	getPeakHourValue(peakHour_id) {
		try {
			const value = this.servicePeakHours.find((item) => item._id === peakHour_id);

			if (value) return value.percent;
			else return "";
		} catch (err) {
			return "";
		}
	}

	checkIsRoot() {
		const user = localStorage.getItem("@user-info") ? JSON.parse(localStorage.getItem("@user-info")) : undefined;

		this.isRoot = user?.isRoot;
	}

	selectTimeZone(sel) {
		try {
			let options = sel.options[sel.selectedIndex].text;
			options = options.split("|", 2);

			if (options && Array.isArray(options) && options.length == 2) {
				this.currentTimeZone = {
					timeZone: options[1].trim(),
					utc: options[0].trim(),
				};
			}
		} catch (err) {
			//
		}
	}

	async addPriceForKM() {
		return new Promise(async (resolve, reject) => {
			this.formDataPriceKM = new FormGroup({
				min: new FormControl(0, [Validators.required]),
				max: new FormControl(10, [Validators.required]),
				priceMinute: new FormControl(0, [Validators.required]),
				priceKM: new FormControl(0, [Validators.required]),
			});

			this.formData.get("distance").push(this.formDataPriceKM);
			resolve(true);
		});
	}

	async removePriceForKM(item, index) {
		await this.formData.get("distance").removeAt(index);
		this.changeDetectorRefs.detectChanges();
	}

	getServiceTypes() {
		this.serviceTypes = [
			{
				key: "bike",
				value: "GLOBAL.TYPESERVICE.BIKE",
			},
			{
				key: "motorcycle",
				value: "GLOBAL.TYPESERVICE.MOTORCYCLE",
			},
			{
				key: "car",
				value: "GLOBAL.TYPESERVICE.CAR",
			},
			{
				key: "microbus",
				value: "GLOBAL.TYPESERVICE.MICROBUS",
			},
			{
				key: "bus",
				value: "GLOBAL.TYPESERVICE.BUS",
			},
			{
				key: "truck",
				value: "GLOBAL.TYPESERVICE.TRUCK",
			},
			{
				key: "package",
				value: "GLOBAL.TYPESERVICE.PACKAGE",
			},
		];
	}
}
