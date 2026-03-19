import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { startWith, debounceTime, switchMap } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { NgxPermissionsService } from "ngx-permissions";
import moment from "moment";

import { Franchise } from "./../../../../../models/franchise";
import { DriversService } from "./../../../../services/mobility/drivers.service";
import { FranchiseService } from "./../../../../services/franchise.service";
import { Drivers } from "./../../../../../models/mobility/drivers";
import { ServiceService } from "./../../../../services/mobility/service.service";
import { checkObjectIdisValid } from "./../../../../util";

@Component({
	selector: "kt-drivers",
	templateUrl: "./drivers.component.html",
	styleUrls: ["./drivers.component.scss"],
})
export class DriversComponent implements OnInit, AfterViewInit {
	franchises: Franchise[] = [];
	services: [] = [];
	formNewService;
	isApproved = true;
	selectedFranchise: Franchise;
	franchiseValue: string;
	dataSource;
	displayedColumns = [
		"isOnline",
		"name",
		"franchise",
		"approved",
		"service",
		"delete",
	];
	files: Set<File>;
	firstFormData;
	formSevice;
	formFilter: FormGroup;
	secondFormData;
	thirdFormData;
	formSubmitDriversOne = false;
	formSubmitDriversTwo = false;
	formSubmitDriversthird = false;
	formSubmitCredit = false;
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	driverIdToDelete;
	typeAction = "create";
	filter: any = {};
	subject: string;
	formData;

	isRoot: boolean = false;
	isAdmin: boolean = false;
	// currentFranchise = "";
	user = null;

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private driversService: DriversService,
		private franchiseService: FranchiseService,
		private serviceService: ServiceService
	) {}

	async ngOnInit() {
		await this.addFormFilter();
		await this.checkIsRoot();
		this.getList(
			0,
			this.pageSize,
			this.formFilter.controls.name.value,
			this.formFilter.controls.franchise.value,
			this.formFilter.controls.approved.value,
			this.formFilter.controls.online.value
		);
	}

	ngAfterViewInit() {}

	async upsertModalShow(content, driver, type = "create") {
		this.typeAction = type;
		await this.newFormData();

		if (this.typeAction === "edit") {
			this.firstFormData.get("password").clearValidators();
			this.firstFormData.get("password").updateValueAndValidity();
			this.firstFormData.get("confirmPassword").clearValidators();
			this.firstFormData.get("confirmPassword").updateValueAndValidity();

			this.firstFormData.get("identityDocuments").clearValidators();
			this.firstFormData.get("identityDocuments").updateValueAndValidity();
			this.firstFormData.get("selfiePhoto").clearValidators();
			this.firstFormData.get("selfiePhoto").updateValueAndValidity();
			this.secondFormData.get("carsDocument").clearValidators();
			this.secondFormData.get("carsDocument").updateValueAndValidity();
			this.secondFormData.get("cnhDocuments").clearValidators();
			this.secondFormData.get("cnhDocuments").updateValueAndValidity();
		}

		if (driver) {
			this.firstFormData.patchValue({
				_id: driver._id,
				name: driver.name,
				phone: driver.phone,
				email: driver.email,
				franchise: driver.franchise,
				status: driver.status,
				identityDocuments: driver.identityDocuments,
				approved: driver.approved === false ? false : true,
				block: driver.block ? driver.block : false,
				address: driver.address ? driver.address : "",
				selfiePhoto: driver.selfiePhoto,
				genre: driver.genre ? driver.genre : "",
			});

			this.secondFormData.patchValue({
				services: [],
				vehicleManufacturer: driver.vehicleManufacturer,
				vehicleModel: driver.vehicleModel,
				vehicleNameplate: driver.vehicleNameplate,
				vehicleColor: driver.vehicleColor,
				activeRunStatus: driver.activeRunStatus,
				online: driver.online,
				carsDocument: driver.carsDocument,
				cnhDocuments: driver.cnhDocuments,
				vehicleYear: driver.vehicleYear,
			});

			//Third
			this.thirdFormData.patchValue({
				name:
					driver.bankData && driver.bankData.name ? driver.bankData.name : "",
				cpfCnpj:
					driver.bankData && driver.bankData.cpfCnpj
						? driver.bankData.cpfCnpj
						: "",
				city:
					driver.bankData && driver.bankData.city ? driver.bankData.city : "",
				bank:
					driver.bankData && driver.bankData.bank ? driver.bankData.bank : "",
				agency:
					driver.bankData && driver.bankData.agency
						? driver.bankData.agency
						: "",
				account:
					driver.bankData && driver.bankData.account
						? driver.bankData.account
						: "",
				type:
					driver.bankData && driver.bankData.type
						? driver.bankData.type
						: "Corrente",
			});

			// Services
			this.services = [];
			for await (const dist of driver.services) {
				this.formNewService = new FormGroup({
					service: new FormControl(dist, [Validators.required]),
				});

				this.formNewService
					.get("service")
					.valueChanges.pipe(
						startWith(""),
						debounceTime(1000),
						switchMap((value) =>
							typeof value === "string" && value.length > 0
								? this.serviceService.getNome(value)
								: []
						)
					)
					.subscribe((results) => (this.services = results));

				this.secondFormData.get("services").push(this.formNewService);
			}
		}

		this.modalService
			.open(content, {
				ariaLabelledBy: "label-driver-modal",
				size: "lg",
				backdrop: "static",
			})
			.result.then(
				(result) => {},
				(reason) => {}
			);

		this.changeDetectorRefs.detectChanges();
	}

	// Save or edit
	async upsert() {
		const user = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;

		const userId = user && user._id ? user._id : undefined;

		// Create or Edit
		const driver = {
			//junta os dados dos dois formulários
			...this.firstFormData?.value,
			...this.secondFormData?.value,
			user: userId,
			bankData: {
				...this.thirdFormData?.value,
			},
		};

		delete driver.selfiePhoto;
		delete driver.identityDocuments;
		delete driver.carsDocument;
		delete driver.cnhDocuments;

		if (Array.isArray(driver.services)) {
			const serv = [];
			for await (const srv of driver.services) {
				serv.push(srv.service);
			}
			driver.services = serv;
		}

		if (this.typeAction === "create") {
			/* 	if (!this.isRoot && !this.isAdmin) {
					driver.franchise = this.currentFranchise;
				} */

			this.driversService.create(driver).subscribe(
				async (_: any) => {
					await this.getList(
						0,
						this.pageSize,
						this.formFilter.controls.name.value,
						this.formFilter.controls.franchise.value,
						this.formFilter.controls.approved.value,
						this.formFilter.controls.online.value
					);
					this.changeDetectorRefs.detectChanges();

					this.toastr.success("Motorista atualizado com sucesso!", "Sucesso!");
					this.modalService.dismissAll();
				},

				(error) => {
					let messageError = "Erro ao criar motorista!";
					if (error?.error?.message) {
						messageError = error?.error?.message;
					}

					this.toastr.error(messageError, "Falha!");
				}
			);
		} else {
			this.driversService.update(driver).subscribe(
				async (_: any) => {
					await this.getList(
						0,
						this.pageSize,
						this.formFilter.controls.name.value,
						this.formFilter.controls.franchise.value,
						this.formFilter.controls.approved.value,
						this.formFilter.controls.online.value
					);
					this.toastr.success("Motorista alterado com sucesso!", "Sucesso!");
					this.modalService.dismissAll();
				},
				(error) => {
					const messageError =
						error && error.error && error?.error?.message
							? error.error.message
							: "Erro ao alterar motorista!";

					this.toastr.error(messageError, "Falha!");
				}
			);
		}
	}

	async getListFranchises(name) {
		return new Promise(async (resolve, reject) => {
			const user = localStorage.getItem("@user-info")
				? JSON.parse(localStorage.getItem("@user-info"))
				: undefined;

			if (user && user._id) {
				const userLogged = user._id;

				const list = await this.franchiseService
					.getFranchisesNome(name, userLogged)
					.toPromise();
				return resolve(list);
			}
			resolve([]);
		});
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getList(
			0,
			this.pageSize,
			this.formFilter.controls.name.value,
			this.formFilter.controls.franchise.value,
			this.formFilter.controls.approved.value,
			this.formFilter.controls.online.value
		);
	}

	displayFn(franchise) {
		if (franchise) {
			return franchise.name;
		}
	}

	displayFnService(service) {
		if (service) {
			return service.name;
		}
	}

	async newFormData() {
		return new Promise(async (resolve, reject) => {
			this.firstFormData = new FormGroup({
				_id: new FormControl(undefined),
				franchise: new FormControl(undefined, [checkObjectIdisValid]),
				name: new FormControl(undefined, [Validators.required]),
				address: new FormControl(undefined),
				phone: new FormControl(undefined, [Validators.required]),
				identityDocuments: new FormControl(undefined, [Validators.required]),
				selfiePhoto: new FormControl(undefined),
				files: new FormControl([]),
				email: new FormControl(undefined, [Validators.required]),
				password: new FormControl(undefined, [Validators.required]),
				confirmPassword: new FormControl(undefined, [Validators.required]),
				approved: new FormControl(true, []),
				genre: new FormControl(undefined),
				block: new FormControl(false),
			});

			this.firstFormData
				.get("franchise")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) =>
						typeof value === "string" && value.length > 0
							? this.franchiseService.getFranchisesNome(value)
							: []
					)
				)
				.subscribe((results) => (this.franchises = results));

			this.secondFormData = new FormGroup({
				services: new FormArray([]),
				carsDocument: new FormControl(undefined, [Validators.required]),
				cnhDocuments: new FormControl(undefined, [Validators.required]),
				online: new FormControl(false),
				vehicleManufacturer: new FormControl(undefined, [Validators.required]),
				vehicleModel: new FormControl(undefined, [Validators.required]),
				vehicleNameplate: new FormControl(undefined, [Validators.required]),
				vehicleYear: new FormControl(undefined, [Validators.required]),
				vehicleColor: new FormControl(undefined, [Validators.required]),
				activeRunStatus: new FormControl("available", [Validators.required]),
			});

			this.thirdFormData = new FormGroup({
				name: new FormControl(undefined),
				cpfCnpj: new FormControl(undefined),
				city: new FormControl(undefined),
				bank: new FormControl(undefined),
				agency: new FormControl(undefined),
				account: new FormControl(undefined),
				type: new FormControl("Corrente"),
			});

			return resolve(true);
		});
	}

	async addFormFilter() {
		return new Promise(async (resolve, reject) => {
			this.formFilter = new FormGroup({
				name: new FormControl(undefined, []),
				franchise: new FormControl(undefined, [checkObjectIdisValid]),
				approved: new FormControl(undefined, []),
				online: new FormControl(undefined, []),
			});

			this.formFilter
				.get("name")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) =>
						typeof value === "string" && value.length > 0
							? this.getList(
									0,
									this.pageSize,
									value,
									this.formFilter.controls.franchise.value,
									this.formFilter.controls.approved.value,
									this.formFilter.controls.online.value
							  )
							: []
					)
				)
				.subscribe((_) => {});

			this.formFilter
				.get("franchise")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) =>
						typeof value === "string" && value.length > 0
							? this.franchiseService.getFranchisesNome(value)
							: []
					)
				)
				.subscribe((results) => {
					this.franchises = results;
					this.changeDetectorRefs.detectChanges();
				});

			this.formFilter
				.get("approved")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) =>
						typeof value === "string" && value.length > 0
							? this.getList(
									0,
									this.pageSize,
									this.formFilter.controls.name.value,
									this.formFilter.controls.franchise.value,
									value,
									this.formFilter.controls.online.value
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
									this.formFilter.controls.name.value,
									this.formFilter.controls.franchise.value,
									this.formFilter.controls.approved.value,
									value
							  )
							: []
					)
				)
				.subscribe(() => {
					this.changeDetectorRefs.detectChanges();
				});

			return resolve(true);
		});
	}

	displayFnFranchise(franchise: Franchise) {
		if (franchise) {
			return franchise.name;
		}
	}

	async getList(pageIn, pageOut, name, franchiseId, approved, online) {
		const self = this;
		const ELEMENT_DATA = [];

		this.driversService
			.getPaginator(pageIn, pageOut, franchiseId, name, online, approved)
			.subscribe((data: any) => {
				if (data.list && Array.isArray(data.list)) {
					data.list.forEach((driver, index) => {
						ELEMENT_DATA.push({
							_id: driver._id,
							position: index + 1,
							name: driver.name,
							franchise: driver.franchise,
							phone: driver.phone,
							identityDocuments:
								driver.identityDocuments && driver.identityDocuments[0]
									? driver.identityDocuments
									: undefined,
							address: driver.address ? driver.address : "",
							email: driver.email,
							activeRunStatus: driver.activeRunStatus
								? driver.activeRunStatus
								: {},
							selfiePhoto:
								driver.selfiePhoto && driver.selfiePhoto[0]
									? driver.selfiePhoto
									: undefined,
							approved: driver.approved === false ? false : true,
							services: driver.services,
							carsDocument:
								driver.carsDocument && driver.carsDocument[0]
									? driver.carsDocument
									: undefined,
							cnhDocuments:
								driver.cnhDocuments && driver.cnhDocuments[0]
									? driver.cnhDocuments
									: undefined,
							online: driver.online,
							vehicleManufacturer: driver.vehicleManufacturer,
							vehicleModel: driver.vehicleModel,
							vehicleNameplate: driver.vehicleNameplate,
							vehicleYear: driver.vehicleYear,
							vehicleColor: driver.vehicleColor,
							genre: driver.genre ? driver.genre : "",
							bankData: driver.bankData ? driver.bankData : {},
							creditBalance: driver.creditBalance ? driver.creditBalance : 0,
							block: driver.block ? driver.block : false,
						});
					});
					self.dataSource = new MatTableDataSource(ELEMENT_DATA);
					self.totalLength = data.total;
					this.changeDetectorRefs.detectChanges();
				}
			});
	}

	async addNewService() {
		return new Promise(async (resolve, reject) => {
			this.services = [];
			this.formNewService = new FormGroup({
				service: new FormControl(undefined, [Validators.required]),
			});

			this.formNewService
				.get("service")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) =>
						typeof value === "string" && value.length > 0
							? this.serviceService.getNome(value)
							: []
					)
				)
				.subscribe((results) => (this.services = results));

			this.secondFormData.get("services").push(this.formNewService);
			resolve(true);
		});
	}

	async onClickFranchiseFilter(franchise) {
		await this.getList(
			0,
			this.pageSize,
			this.formFilter.controls.name.value,
			franchise._id,
			this.formFilter.controls.approved.value,
			this.formFilter.controls.online.value
		);
	}

	async removeServices(index) {
		return new Promise(async (resolve, reject) => {
			await this.secondFormData.get("services").removeAt(index);

			this.changeDetectorRefs.detectChanges();
			resolve(true);
		});
	}

	onChange(event, field) {
		const selectedFiles = <FileList>event.srcElement.files;
		const filesFirstForm: any[] = this.firstFormData?.value?.files;

		const fileNames = [];
		const fileList = [];
		if (event.target.files && event.target.files.length) {
			const files: Set<File> = new Set();
			for (let i = 0; i < selectedFiles.length; i++) {
				fileNames.push(selectedFiles[i].name);
				files.add(selectedFiles[i]);

				const reader = new FileReader();
				// const [file] = event.target.files;
				reader.readAsDataURL(selectedFiles[i]);

				reader.onload = () => {
					fileList.push({ base64: reader.result });
					switch (field) {
						case "selfiePhoto":
							filesFirstForm.push({
								file: fileList,
								name: "selfiePhoto",
							});
							this.firstFormData.patchValue({
								files: filesFirstForm,
								selfiePhoto: fileList,
							});
							break;
						case "identityDocuments":
							filesFirstForm.push({
								file: fileList,
								name: "identityDocuments",
							});
							this.firstFormData.patchValue({
								files: filesFirstForm,
								identityDocuments: fileList,
							});
							break;
						case "cnhDocuments":
							filesFirstForm.push({
								file: fileList,
								name: "cnhDocuments",
							});
							this.firstFormData.patchValue({
								files: filesFirstForm,
							});
							this.secondFormData.patchValue({
								cnhDocuments: fileList,
							});
							break;
						case "carsDocument":
							filesFirstForm.push({
								file: fileList,
								name: "carsDocument",
							});
							this.firstFormData.patchValue({
								files: filesFirstForm,
							});
							this.secondFormData.patchValue({
								carsDocument: fileList,
							});
							break;
						default:
							break;
					}
				};
			}
		}
		// document.getElementById('customFileLabel').innerHTML = fileNames.join(', ');
		document.getElementById(field).innerHTML = fileNames.join(", ");
	}

	async confirmDeleteModalShow(content, driver) {
		this.driverIdToDelete = driver._id;
		this.modalService
			.open(content, { ariaLabelledBy: "modal-delete-driver", size: "sm" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async deleteDriver() {
		if (!this.driverIdToDelete) {
			this.toastr.error("Erro ao deletar motorista!", "Falha!");
			return;
		}
		await this.driversService.delete(this.driverIdToDelete).toPromise();
		this.toastr.success("Motorista deletado com sucesso!", "Sucesso!");
		this.driverIdToDelete = undefined;
		await this.getList(
			0,
			this.pageSize,
			this.formFilter.controls.name.value,
			this.formFilter.controls.franchise.value,
			this.formFilter.controls.approved.value,
			this.formFilter.controls.online.value
		);
	}

	checkIsRoot() {
		return new Promise(async (resolve, reject) => {
			const user = localStorage.getItem("@user-info")
				? JSON.parse(localStorage.getItem("@user-info"))
				: undefined;

			this.isRoot = user?.isRoot;
			this.isAdmin = user?.isAdmin;
			// this.currentFranchise = user?.franchise ?? "";
			resolve(true);
		});
	}
}
