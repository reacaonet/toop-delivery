import { ToastrService } from "ngx-toastr";
import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
} from "@angular/core";
import { startWith, debounceTime, switchMap } from "rxjs/operators";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
// Translate
import { TranslateService } from "@ngx-translate/core";
import moment from "moment";

import { DriversService } from "./../../../../services/drivers.service";
import { ServiceService } from "./../../../../services/mobility/service.service";
import { PreRegisterService } from "./../../../../services/mobility/pre-register.service";
import { SendUploadsService } from "./../../../../services/upload/sendUpload.service";
import { checkObjectIdisValid } from "./../../../../util";

@Component({
	selector: "kt-drivers",
	templateUrl: "./drivers.component.html",
	styleUrls: ["./drivers.component.scss"],
})
export class DriversComponent implements OnInit, AfterViewInit {
	childmessage = false;
	dataSource;
	displayedColumns = ["name", "cpf", "phone", "status", "createdAt", "view"];
	formData;
	formFilter: FormGroup;
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	filter: any = {};
	loadUpdate = false;

	selfiePhoto = [];
	CNHDocumentPhoto = [];
	CRLVDocumentPhoto = [];
	CCfront = [];
	CCVerse = [];
	ImageCardFront = [];
	ImageCardVerse = [];
	UniqueDocument = [];
	UniqueDocumentVerse = [];
	CriminalRecord = [];
	citiesList;
	listServices: any = [];
	idToDelete;

	formNewService;
	services: any | [] = [];
	upFileType = "selfiePhoto";

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private driversService: DriversService,
		private toastr: ToastrService,
		private translate: TranslateService,
		private serviceService: ServiceService,
		private preRegisterService: PreRegisterService,
		private sendUploadsService: SendUploadsService
	) { }

	async ngOnInit() {
		await this.addFormFilter();
		this.getListPartners(0, this.pageSize);
	}

	async addNewFormData(del) {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(del._id),
				name: new FormControl(del.name),
				cpf: new FormControl(del.cpf),
				nif: new FormControl(del.nif),
				rg: new FormControl(del.rg),
				ddi: new FormControl(del.ddi ? del.ddi : "+55"),
				phone: new FormControl(del.phone),
				status: new FormControl(del.status),
				password: new FormControl(del.password),
				email: new FormControl(del.email),
				location: new FormControl(del.location ? del.location : undefined),
				message: new FormControl(del.message),
				franchise: new FormControl(del.franchise),
				franchiseName: new FormControl(del.franchise?.name),
				typeOfVehicle: new FormControl(del.typeOfVehicle),
				createdAt: new FormControl(del.createdAt),
				birthDate: new FormControl(del.birthDate),
				vehicleManufacturer: new FormControl(del.vehicleManufacturer),
				vehicleModel: new FormControl(del.vehicleModel),
				vehicleNameplate: new FormControl(del.vehicleNameplate),
				vehicleYear: new FormControl(del.vehicleYear),
				vehicleColor: new FormControl(del.vehicleColor),
				terms: new FormControl(del.terms),
				genre: new FormControl(del.genre || ""),
				services: new FormArray([]),
				bankData: new FormControl(del.bankData || {}),
			});

			this.selfiePhoto = del.selfiePhoto || [];
			this.CNHDocumentPhoto = del.CNHDocumentPhoto || [];
			this.CRLVDocumentPhoto = del.CRLVDocumentPhoto || [];
			this.CCfront = del.CCfront || [];
			this.CCVerse = del.CCVerse || [];
			this.ImageCardFront = del.ImageCardFront || [];
			this.ImageCardVerse = del.ImageCardVerse || [];
			this.UniqueDocument = del.UniqueDocument || [];
			this.UniqueDocumentVerse = del.UniqueDocumentVerse || [];
			this.CriminalRecord = del.CriminalRecord || [];

			resolve(true);
		});
	}

	async addFormFilter() {
		return new Promise(async (resolve, reject) => {
			this.formFilter = new FormGroup({
				email: new FormControl("", [Validators.required]),
				name: new FormControl("", []),
				cpf: new FormControl("", []),
				status: new FormControl("", []),
			});

			this.formFilter
				.get("email")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => {
						if (value && typeof value === "string" && value.length > 0) {
							this.filter.email = value;
							return this.getListPartners(0, this.pageSize, this.filter);
						}

						return [];
					})
				)
				.subscribe((results) => {
					this.changeDetectorRefs.detectChanges();
				});

			this.formFilter
				.get("name")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => {
						if (value && typeof value === "string") {
							this.filter.name = value;
							return this.getListPartners(0, this.pageSize, this.filter);
						}

						return [];
					})
				)
				.subscribe((results) => {
					this.changeDetectorRefs.detectChanges();
				});

			this.formFilter
				.get("cpf")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => {
						if (value && typeof value === "string") {
							this.filter.cpf = value;
							return this.getListPartners(0, this.pageSize, this.filter);
						}

						return [];
					})
				)
				.subscribe((results) => {
					this.changeDetectorRefs.detectChanges();
				});

			this.formFilter
				.get("status")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => {
						if (value && typeof value === "string") {
							this.filter.status = value;
							return this.getListPartners(0, this.pageSize, this.filter);
						}

						return [];
					})
				)
				.subscribe((results) => {
					this.changeDetectorRefs.detectChanges();
				});

			return resolve(true);
		});
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getListPartners(event.pageIndex, event.pageSize);
	}

	async getListPartners(page, limit, params = {}) {
		const self = this;
		const ELEMENT_DATA = [];

		this.driversService
			.getRegistersPaginator(page, limit, params)
			.subscribe((data: any) => {
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);

				if (data.list && Array.isArray(data.list)) {
					data.list.forEach((delivery, index) => {
						delivery.status = this.getStatus(delivery);

						const created = moment(delivery.createdAt).format("DD/MM/YY HH:mm");

						ELEMENT_DATA.push({
							_id: delivery._id,
							position: index + 1,
							ddi: delivery.ddi ? delivery.ddi : "+55",
							phone: delivery.phone,
							status: delivery.status,
							name: delivery.name,
							email: delivery.email,
							birthDate: delivery.birthDate,
							cpf: delivery.cpf,
							nif: delivery.nif,
							rg: delivery.rg,
							franchise: delivery.franchise,
							password: delivery.password,
							franchiseName: delivery.franchise?.name,
							selfiePhoto: delivery.selfiePhoto ? [delivery.selfiePhoto] : [],
							CNHDocumentPhoto: delivery.CNHDocumentPhoto
								? [delivery.CNHDocumentPhoto]
								: [],
							CRLVDocumentPhoto: delivery.CRLVDocumentPhoto
								? [delivery.CRLVDocumentPhoto]
								: [],
							CCfront: delivery.CCfront
								? [delivery.CCfront]
								: [],
							CCVerse: delivery.CCVerse
								? [delivery.CCVerse]
								: [],
							ImageCardFront: delivery.ImageCardFront
								? [delivery.ImageCardFront]
								: [],
							ImageCardVerse: delivery.ImageCardVerse
								? [delivery.ImageCardVerse]
								: [],
							UniqueDocument: delivery.UniqueDocument
								? [delivery.UniqueDocument]
								: [],
							UniqueDocumentVerse: delivery.UniqueDocumentVerse
								? [delivery.UniqueDocumentVerse]
								: [],
							CriminalRecord: delivery.CriminalRecord
								? [delivery.CriminalRecord]
								: [],
							createdAt: created,
							vehicleManufacturer: delivery.vehicleManufacturer,
							vehicleModel: delivery.vehicleModel,
							vehicleNameplate: delivery.vehicleNameplate,
							vehicleYear: delivery.vehicleYear,
							vehicleColor: delivery.vehicleColor,
							terms: delivery.terms,
							genre: delivery.genre ? delivery.genre : "",
							bankData: delivery.bankData ? delivery.bankData : {},
						});
					});

					self.dataSource = new MatTableDataSource(ELEMENT_DATA);
					self.totalLength = data.total;
					this.changeDetectorRefs.detectChanges();
				}
			});
	}

	async viewPartnersModalShow(content, del) {
		this.selfiePhoto = [];
		this.CNHDocumentPhoto = [];
		this.CRLVDocumentPhoto = [];
		this.CCfront = [];
		this.CCVerse = [];
		this.ImageCardFront = [];
		this.ImageCardVerse = [];
		this.UniqueDocument = [];
		this.UniqueDocumentVerse = [];
		this.CriminalRecord = [];

		if (del.terms === true && `${del.status}`.toUpperCase() === "PENDENTE") {
			const payload = {
				status: "ANALYZE",
			};

			const response: any = await this.driversService
				.updateStatus(payload, del._id)
				.toPromise();

			if (response.data.status === "ANALYZE") {
				del.status = "ANALISANDO";
			}
		}

		await this.addNewFormData(del);

		this.serviceService
			.listFranchisesServices({
				franchiseId:
					del.franchise && del.franchise._id ? del.franchise._id : null,
			})
			.subscribe(async (result) => {
				if (result && Array.isArray(result)) {
					this.services = result;
					this.changeDetectorRefs.detectChanges();
				}
			});

		this.modalService
			.open(content, { ariaLabelledBy: "modal-view-partners", size: "lg" })
			.result.then(
				(result) => { },
				(reason) => { }
			);
	}

	async viewPartners() {
		this.driversService.getRegisters().subscribe(
			(data: any) => {
				const delivery = data.data;

				const created = moment(
					delivery.createdAt,
					"YYYY-MM-DD HH:mm:ss"
				).format("DD/MM/YY HH:mm:ss");

				this.dataSource.data.push({
					_id: delivery._id,
					position: this.dataSource.data.length + 2,
					ddi: delivery.ddi ? delivery.ddi : "+55",
					phone: delivery.phone,
					status: delivery.status ? `${delivery.status}`.toUpperCase() : "",
					name: delivery.name,
					email: delivery.email,
					birthDate: delivery.birthDate,
					password: delivery.password,
					franchise: delivery.franchise,
					cpf: delivery.cpf,
					rg: delivery.rg,
					Region: delivery.Region,
					selfiePhoto: delivery.selfiePhoto ? [delivery.selfiePhoto] : [],
					CNHDocumentPhoto: delivery.CNHDocumentPhoto
						? [delivery.CNHDocumentPhoto]
						: [],
					CRLVDocumentPhoto: delivery.CRLVDocumentPhoto
						? [delivery.CRLVDocumentPhoto]
						: [],
					CCfront: delivery.CCfront
						? [delivery.CCfront]
						: [],
					CCVerse: delivery.CCVerse
						? [delivery.CCVerse]
						: [],
					ImageCardFront: delivery.ImageCardFront
						? [delivery.ImageCardFront]
						: [],
					ImageCardVerse: delivery.ImageCardVerse
						? [delivery.ImageCardVerse]
						: [],
					UniqueDocument: delivery.UniqueDocument
						? [delivery.UniqueDocument]
						: [],
					UniqueDocumentVerse: delivery.UniqueDocumentVerse
						? [delivery.UniqueDocumentVerse]
						: [],
					CriminalRecord: delivery.CriminalRecord
						? [delivery.CriminalRecord]
						: [],
					createdAt: created,
					vehicleManufacturer: delivery.vehicleManufacturer,
					vehicleModel: delivery.vehicleModel,
					vehicleNameplate: delivery.vehicleNameplate,
					vehicleYear: delivery.vehicleYear,
					vehicleColor: delivery.vehicleColor,
					terms: delivery.terms,
				});
				this.dataSource._updateChangeSubscription();
				this.changeDetectorRefs.detectChanges();
			},
			(error) => { }
		);
	}

	ngAfterViewInit() { }

	async acceptDeliveryman(element) {
		let {
			ddi,
			phone,
			status,
			name,
			email,
			birthDate,
			cpf = null,
			nif = null,
			rg,
			franchise,
			selfiePhoto,
			password,
			_id,
			vehicleManufacturer,
			vehicleModel,
			vehicleNameplate,
			vehicleYear,
			vehicleColor,
			terms = false,
			services,
			bankData,
		} = element;

		try {
			if (!services || !Array.isArray(services) || services.length <= 0) {
				return this.toastr.warning(
					"Informe o serviço que o motorista ira oferecer",
					"Serviço"
				);
			}

			const servicesId = services.map((item) => {
				return item.service._id;
			});

			const driver: any = {
				birthDate: birthDate,
				cpf,
				nif,
				rg,
				name,
				ddi,
				phone,
				status: true,
				email,
				approved: true,
				password: password ?? "mudar1234",
				selfiePhoto: this.selfiePhoto,
				carsDocument: [
					...this.CRLVDocumentPhoto,
					...this.UniqueDocument,
					...this.UniqueDocumentVerse,
				],
				cnhDocuments: this.CNHDocumentPhoto,
				identityDocuments: [
					...this.CriminalRecord,
					...this.CCfront,
					...this.CCVerse,
					...this.ImageCardFront,
					...this.ImageCardVerse,
				],
				franchise: franchise._id,
				vehicleManufacturer,
				vehicleModel,
				vehicleNameplate,
				vehicleYear,
				vehicleColor,
				terms,
				services: servicesId,
				bankData,
			};

			const driveResoponse: any = await this.driversService
				.create(driver)
				.toPromise();

			this.toastr.success("Motorista criado com sucesso!", "Sucesso!");

			if (`${status}`.toUpperCase() !== "APROVADO") {
				const payload = {
					status: "APPROVED",
				};
				const response: any = await this.driversService
					.updateStatus(payload, _id)
					.toPromise();
				if (response) {
					this.getListPartners(0, this.pageSize);
				}
			}

			this.modalService.dismissAll();
		} catch ({ error }) {
			console.log("error", error);
			this.toastr.error(`${error.message}`, "Falha!");
		}
	}

	// atualizar pre-cadastro
	async updatePreRegister(element: any) {
		try {
			this.loadUpdate = true;
			const respUp = await this.preRegisterService
				.update(element._id, element)
				.toPromise();

			this.toastr.success("Cadatro Atualizado", "Cadastro");
			this.loadUpdate = false;

			if (
				`${element.terms}` === "true" &&
				(!element.status || element.status !== "APPROVED")
			) {
				element.status = "ANALISANDO";
			}

			for (const item in element) {
				this.formData.controls[`${item}`].value = element[`${item}`];
			}

			this.getListPartners(0, this.pageSize);
			this.changeDetectorRefs.detectChanges();
		} catch (err) {
			let message = "Não foi possível alterar cadastro";

			if (err.error && err.error.message) {
				message = err.error.message;
			}

			this.loadUpdate = false;
			this.toastr.warning(message, "Cadastro");
		}
	}

	createMessage(content, deliveryman) {
		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-message-deliveryman",
				size: "lg",
			})
			.result.then(
				(result) => { },
				(reason) => { }
			);
	}

	async sendMessage(formData) {
		const { message, _id } = formData;
		const payload = {
			message,
			status: "WAITING",
		};
		const response: any = await this.driversService
			.updateStatus(payload, _id)
			.toPromise();
		if (response.status === 200) {
			this.modalService.dismissAll();
			this.getListPartners(0, this.pageSize);
		}
	}

	async cancelDeliveryman(formData: any) {
		const { _id } = formData;
		const payload = {
			message: "O seu cadastro não foi aprovado!",
			status: "DECLINED",
		};
		const response: any = await this.driversService
			.updateStatus(payload, _id)
			.toPromise();
		if (response.status === 200) {
			this.modalService.dismissAll();
			this.getListPartners(0, this.pageSize);
		}
	}

	getStatus(delivery) {
		if (delivery.status === "DECLINED") {
			return `${this.translate.instant("GLOBAL.LABEL.REFUSED")}`.toUpperCase();
		} else if (!delivery.terms || delivery.terms === false) {
			return `${this.translate.instant(
				"GLOBAL.LABEL.WAITINGTOCOMPLETEREGISTRATION"
			)}`.toUpperCase();
		}

		switch (delivery.status) {
			case "PENDING":
				return `${this.translate.instant(
					"GLOBAL.LABEL.PENDING"
				)}`.toUpperCase();
			case "RESENT":
				return `${this.translate.instant("GLOBAL.LABEL.RESENT")}`.toUpperCase();
			case "ANALYZE":
				return `${this.translate.instant(
					"GLOBAL.LABEL.ANALYZE"
				)}`.toUpperCase();
			case "DECLINED":
				return `${this.translate.instant(
					"GLOBAL.LABEL.REFUSED"
				)}`.toUpperCase();
			case "APPROVED":
				return `${this.translate.instant(
					"GLOBAL.LABEL.APPROVED"
				)}`.toUpperCase();
			case "WAITING":
				return `${this.translate.instant(
					"GLOBAL.LABEL.WAITING"
				)}`.toUpperCase();
			case "DECLINED":
				return `${this.translate.instant(
					"GLOBAL.LABEL.DECLINED"
				)}`.toUpperCase();
			default:
				return `${this.translate.instant(
					"GLOBAL.LABEL.PENDING"
				)}`.toUpperCase();
		}
	}

	displayFn(item) {
		if (item) {
			return item.name;
		}
	}

	async addNewService() {
		return new Promise(async (resolve, reject) => {
			this.formNewService = new FormGroup({
				service: new FormControl(undefined, [
					Validators.required,
					checkObjectIdisValid,
				]),
			});

			this.formNewService
				.get("service")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => {
						if (typeof value === "string" && value.length > 0) {
							return this.serviceService.getNome(value);
						} else {
							return [];
						}
					})
				)
				.subscribe((results): any => {
					if (results) {
						this.services = results;
						this.changeDetectorRefs.detectChanges();
					}
				});
			this.formData.get("services").push(this.formNewService);
			resolve(true);
		});
	}

	async removeServices(index) {
		return new Promise(async (resolve, reject) => {
			await this.formData.get("services").removeAt(index);

			resolve(true);
		});
	}

	// substituir arquivo
	async chageDocument(event, item) {
		try {
			const selectedFiles = <FileList>event.srcElement.files;
			let formData: any = new FormData();
			let file: any = selectedFiles[0];
			formData.append("file", file);
			formData.append("folder", "mobility/driver");
			const respUp = await this.sendUploadsService.uploadDocument(formData);
			if (!respUp) {
				return this.toastr.warning(
					"Não conseguimos enviar o arquivo",
					"Falha no envio"
				);
			}
			let data: any = {};
			data[`${this.upFileType}`] = respUp;
			const resp = await this.preRegisterService
				.update(item._id, data)
				.toPromise();
			if (!resp) {
				return this.toastr.warning(
					"Não conseguimos atualizar registro",
					"Falha no envio"
				);
			}

			if (this.upFileType === "selfiePhoto") {
				this.selfiePhoto = [respUp];
			} else if (this.upFileType === "CNHDocumentPhoto") {
				this.CNHDocumentPhoto = [respUp];
			} else if (this.upFileType === "CRLVDocumentPhoto") {
				this.CRLVDocumentPhoto = [respUp];
			} else if (this.upFileType === "CriminalRecord") {
				this.CriminalRecord = [respUp];
			} else if (this.upFileType === "CCfront") {
				this.CCfront = [respUp];
			} else if (this.upFileType === "CCVerse") {
				this.CCVerse = [respUp];
			} else if (this.upFileType === "ImageCardFront") {
				this.ImageCardFront = [respUp];
			} else if (this.upFileType === "ImageCardVerse") {
				this.ImageCardVerse = [respUp];
			} else if (this.upFileType === "UniqueDocument") {
				this.UniqueDocument = [respUp];
			} else if (this.upFileType === "UniqueDocumentVerse") {
				this.UniqueDocumentVerse = [respUp];
			}

			this.changeDetectorRefs.checkNoChanges();
		} catch (err) {
			this.toastr.warning("Não conseguimos enviar o arquivo", "Falha no envio");
		}
	}

	selectOption(value) {
		this.upFileType = value;
	}

	async confirmDeleteModalShow(content, data) {
		this.idToDelete = data._id;
		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-delete-pre",
				size: "sm",
				backdrop: "static",
			})
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async delete() {
		// caso não encotre o id dar error
		if (!this.idToDelete) {
			this.toastr.error("Falha ao deletar Registro!", "Falha!");
			return;
		}
		// delete
		await this.preRegisterService.delete(this.idToDelete).toPromise();
		// sucesso ao excluir tela
		this.toastr.success("Registro deletado com sucesso!", "Sucesso!");
		// trata o id pra indefinido
		this.idToDelete = undefined;
		// att a tela
		await this.getListPartners(0, this.pageSize);
	}
}
