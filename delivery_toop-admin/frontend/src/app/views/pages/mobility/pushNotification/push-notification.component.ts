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

import { Notification } from "../../../../../models/mobility/notification";
import { NotificationsService } from "../../../../services/mobility/notifications.service";
import { PushNotificationService } from "../../../../services/mobility/pushNotifications.service";
import { FranchiseService } from "../../../../services/franchise.service";
import { DriverService } from "../../../../services/mobility/driver.service";
import { PassengerService } from "../../../../services/mobility/passenger.service";

import { Franchise } from "../../../../../models/franchise";
import { Company } from "../../../../../models/company";
import { checkObjectIdisValid } from "../../../util";

import moment from "moment";

@Component({
	selector: "kt-notification",
	templateUrl: "./push-notification.component.html",
	styleUrls: ["./push-notification.component.scss"],
})
export class PushNotificationComponent implements OnInit, AfterViewInit {
	helpdeskUrl = "/helpdesk/faq/63a1cebbf0f5dbc1805e615f";
	box = "";
	boxNome = "";
	idToDelete; // Save id to delete
	dataSource;
	displayedColumns = [
		"franchise",
		"topic",
		"user",
		"title",
		"createdAt",
		"delete",
	];
	files: Set<File>;
	formData;
	formFilter: FormGroup;
	formSubmit = false;
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	typeAction = "create";

	franchises: Franchise[] = [];
	isAdmin = false;
	userCompany: Company;
	isRoot: boolean = false;
	currentFranchise = "";

	visible = true;
	selectable = true;
	removable = true;
	addOnBlur = true;
	load = false;
	loadSync = false;
	shippingType = "topic";
	users = [];

	topics = [
		// { value: "ALL", label: "Todos" },
		{ value: "passenger", label: "Passageiros" },
		{ value: "driver", label: "Motoristas" },
	];

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private notificationsService: NotificationsService,
		private pushNotificationService: PushNotificationService,
		private permissionsService: NgxPermissionsService,
		private franchiseService: FranchiseService,
		private driverService: DriverService,
		private passengerService: PassengerService,
		private modalService: NgbModal,
		private toastr: ToastrService
	) {}

	async ngOnInit() {
		this.checkIsRoot();
		await this.addFormFilter();
		await this.getList(0,
			this.pageSize, undefined, undefined);

		this.userCompany = localStorage.getItem("@company-main")
			? JSON.parse(localStorage.getItem("@company-main"))
			: undefined;

		const permissions = this.permissionsService.getPermissions();
		if (!permissions || !permissions.accessToGlobal) {
			this.isAdmin = false;
		}

		await this.loadFranchises();
	}

	loadFranchises() {
		const userInfo = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;

		// no caso de admin, consultar todas as franquias
		if (this.isAdmin) {
			this.franchiseService.getfranchises().subscribe(
				(data: Franchise[]) => {
					const list = Object.keys(data).map((index) => {
						const franchise = data[index];
						return franchise;
					});
					this.franchises = list;
				},
				(error) => {}
			);
		} else {
			this.franchiseService.getByUser(userInfo._id).subscribe(
				(data: Franchise[]) => {
					const list = Object.keys(data).map((index) => {
						const franchise = data[index];
						return franchise;
					});
					this.franchises = list;
				},
				(error) => {}
			);
		}

		this.changeDetectorRefs.detectChanges();
	}

	async addFormFilter() {
		return new Promise(async (resolve, reject) => {
			const user = localStorage.getItem("@user-info")
				? JSON.parse(localStorage.getItem("@user-info"))
				: undefined;

			let userId;
			if (user && user._id) {
				if (user.isRoot !== true) {
					userId = user._id;
				}
			}

			// Criando os campos do formulário
			this.formFilter = new FormGroup({
				franchise: new FormControl(undefined, [checkObjectIdisValid]),
				type: new FormControl(undefined),
			});

			this.formFilter
				.get("franchise")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => {
						if (typeof value === "string" && value.length > 0) {
							return this.franchiseService.getFranchisesNome(value, userId);
						}

						return [];
					})
				)
				.subscribe((results) => {
					if (results && results.length > 0) {
						this.franchises = results;
						this.changeDetectorRefs.detectChanges();
					}
				});

			return resolve(true);
		});
	}

	async newFormData() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),
				franchise: new FormControl(undefined),
				user: new FormControl(undefined),
				title: new FormControl(undefined, [Validators.required]),
				message: new FormControl(undefined, [Validators.required]),
				topic: new FormControl(undefined),
			});

			const user = localStorage.getItem("@user-info")
				? JSON.parse(localStorage.getItem("@user-info"))
				: undefined;

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
					switchMap((value) =>
						typeof value === "string" && value.length > 0
							? this.franchiseService.getFranchisesNome(value, userId)
							: []
					)
				)
				.subscribe((results) => {
					if (results && Array.isArray(results) && results.length > 0) {
						this.franchises = results;
					}
				});

			this.formData
				.get("user")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => {
						if (
							typeof value === "string" &&
							value.length > 0 &&
							this.shippingType === "driver"
						) {
							return this.driverService.getName(value);
						} else if (
							typeof value === "string" &&
							value.length > 0 &&
							this.shippingType === "passenger"
						) {
							return this.passengerService.getFilter({ name: value });
						} else {
							return [];
						}
					})
				)
				.subscribe((results) => {
					if (results) {
						this.users = results;
					} else {
						this.users = [];
					}

					this.changeDetectorRefs.detectChanges();
				});

			return resolve(true);
		});
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getList(0,
			this.pageSize, undefined, undefined);
	}

	changeFilterTopic(type: string) {
		 this.getList(0, this.pageSize, undefined, type);
	}

	async getList(pageIn, pageOut, franchise, topic) {
		const self = this;
		const ELEMENT_DATA = [];

		this.pushNotificationService
			.getPaginator(pageIn, pageOut, franchise, topic)
			.subscribe((data: any) => {
				if (data.list && Array.isArray(data.list)) {
					data.list.forEach((data, index) => {
						ELEMENT_DATA.push({
							_id: data._id,
							position: index + 1,
							franchise: data.franchise,
							topic: data.topic ? data.topic : "",
							createdAt: moment(data.createdAt).format("DD/MM/YYYY HH:mm"),
							title: data.title,
							status: data.status,
							user:
								data.user && Array.isArray(data.user) && data.user.length > 0
									? data.user[0]
									: null,
						});
					});

					self.dataSource = new MatTableDataSource(ELEMENT_DATA);
					self.totalLength = data.total;
					this.changeDetectorRefs.detectChanges();
				}
			});
	}

	async upsertModalShow(content, notification: Notification, type = "create") {
		this.typeAction = type;
		this.formSubmit = false;
		await this.newFormData();
		this.shippingType = "topic";

		this.changeDetectorRefs.detectChanges();
		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-edit-notification",
				size: "lg",
				backdrop: "static",
			})
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async upsert(data: any) {
		if (this.isRoot && !data.franchise) {
			this.toastr.error(
				"Por favor selecione uma franquia para criar a notificação!",
				"Escolha uma Franquia!"
			);
			return;
		}

		delete data._id;

		if (this.isRoot) {
			data.franchise = data.franchise?._id;
		} else {
			data.franchise = this.currentFranchise;
		}

		try {
			if (data.user && data.user._id) {
				if (data.user.passenger && data.user.passenger.token) {
					data.user.token = data.user.passenger.token;
				}

				data.user.userType = this.shippingType;
			} else {
				try {
					delete data.user;
				} catch (err) {}
			}

			this.load = true;
			const response = await this.pushNotificationService
				.create(data)
				.toPromise();

			this.load = false;
			this.modalService.dismissAll("");

			this.getList(0,
				this.pageSize, undefined, undefined);
			this.toastr.success("Registro cadastrado com sucesso!", "Sucesso!");
			this.changeDetectorRefs.detectChanges();
		} catch (err) {
			let message = "Não foi possível enviar dados";

			if (err && err.error && err.error.message) {
				message = err.error.message;
			}

			this.load = false;
			this.toastr.error(message, "Falhou!!");
			this.changeDetectorRefs.detectChanges();
		}
	}

	async confirmDeleteModalShow(content, data) {
		this.idToDelete = data._id;
		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-delete-data",
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
		await this.notificationsService.delete(this.idToDelete).toPromise();
		// sucesso ao excluir tela
		this.toastr.success("Registro deletado com sucesso!", "Sucesso!");
		// trata o id pra indefinido
		this.idToDelete = undefined;
		// att a tela
		await this.getList(0,
			this.pageSize, undefined, undefined);
	}

	ngAfterViewInit() {}

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

	onEnter(value: string) {
		this.box = value;
		this.boxNome = "";
		this.getList(0,
			this.pageSize, undefined, undefined);
	}

	displayFnFilter(franchise: Franchise) {
		if (franchise) {
			return franchise.name;
		}
	}

	displayFnFranchise(franchise) {
		if (franchise) {
			return franchise.name;
		}
	}
	// --> obtem o status do registro
	getStatusColor(status) {
		if (status === "success") {
			return "bg-success";
		} else if (status === "error") {
			return "bg-danger";
		} else {
			return "bg-warning";
		}
	}

	// --> obtem a cor da linha do registro
	getPositionColor(position) {
		if (position % 2 !== 0) {
			return "bg-secondary";
		}
	}

	checkIsRoot() {
		const user = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;

		if (user?.isRoot) {
			this.isRoot = user?.isRoot;
		} else if (user?.isApplication) {
			this.isRoot = user?.isApplication;
		}

		this.currentFranchise = user?.franchise ?? "";
	}

	selectShippingType(value) {
		if (value !== "topic") {
			this.formData.controls["topic"].value = "";
		} else if (value === "topic") {
			this.formData.controls["user"].value = "";
		}

		this.shippingType = value;
	}

	onClickFranchiseFilter(franchise) {
		this.getList(0, this.pageSize, franchise._id, undefined);
	}

	async syncTopics() {
		try {
			this.loadSync = true;
			const response = await await this.pushNotificationService
				.syncTopics()
				.toPromise();
			this.loadSync = false;

			this.toastr.success("Sincronizado com sucesso!!", "Sincronização");
			this.changeDetectorRefs.detectChanges();
		} catch (err) {
			let message = "Não foi possível sincronizar tópicos";

			if (err && err.error && err.error.message) {
				message = err.error.message;
			}

			this.loadSync = false;
			this.toastr.error(message, "Falhou!!");
			this.changeDetectorRefs.detectChanges();
		}
	}
}
