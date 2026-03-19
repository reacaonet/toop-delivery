import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { MatChipInputEvent } from "@angular/material/chips";
import { startWith, debounceTime, switchMap } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { NgxPermissionsService } from "ngx-permissions";

import { Notification } from "../../../../../models/mobility/notification";
import { NotificationsService } from "../../../../services/mobility/notifications.service";
import { FranchiseService } from "../../../../services/franchise.service";
import { Franchise } from "../../../../../models/franchise";
import { Company } from "../../../../../models/company";
import { checkObjectIdisValid } from "../../../../util";

import moment from "moment";

@Component({
	selector: "kt-notification",
	templateUrl: "./notification.component.html",
	styleUrls: ["./notification.component.scss"],
})
export class NotificationComponent implements OnInit, AfterViewInit {
	box = "";
	boxNome = "";
	idToDelete; // Save id to delete
	dataSource;
	displayedColumns = [
		"image",
		"franchise",
		"type",
		"expirationDate",
		"description",
		"delete",
	];
	files: Set<File>;
	formData;
	formFilter: FormGroup;
	formSubmit = false;
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;

	franchises: Franchise[] = [];
	isAdmin = false;
	userCompany: Company;

	visible = true;
	selectable = true;
	removable = true;
	addOnBlur = true;

	types = [
		{ value: "ALL", label: "Todos" },
		{ value: "PASSENGER", label: "Passageiros" },
		{ value: "DRIVER", label: "Motoristas" },
	];

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private notificationsService: NotificationsService,
		private permissionsService: NgxPermissionsService,
		private franchiseService: FranchiseService,
		private modalService: NgbModal,
		private toastr: ToastrService
	) {}

	async ngOnInit() {
		await this.addFormFilter();
		await this.getList(0, this.pageSize, undefined, undefined);

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
		const user = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;

		// no caso de admin, consultar todas as franquias
		if (user.isRoot == true) {
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
			this.franchiseService.getByUser(user._id, undefined).subscribe(
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
			// Criando os campos do formulário
			this.formFilter = new FormGroup({
				franchise: new FormControl("", checkObjectIdisValid),
				type: new FormControl(""),
			});

			this.formFilter
				.get("franchise")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) =>
						this.getList(0, this.pageSize, value._id, undefined)
					)
				)
				.subscribe((results) => {
					this.changeDetectorRefs.detectChanges();
				});

			return resolve(true);
		});
	}

	async newFormData() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),
				description: new FormControl("", [Validators.required]),
				type: new FormControl("", [Validators.required]),
				status: new FormControl(""),
				file: new FormControl("", [Validators.required]),
				expirationDate: new FormControl(""),
				franchise: new FormControl("", [Validators.required]),
			});
			return resolve(true);
		});
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getList(event.pageIndex, event.pageSize, undefined, undefined);
	}

	changeFilterType(type: string) {
		this.getList(0, this.pageSize, undefined, type);
	}

	async getList(pageIn, pageOut, franchise, type) {
		const self = this;
		const ELEMENT_DATA = [];

		await this.notificationsService
			.getPaginator(pageIn, pageOut, franchise, type)
			.subscribe((data: any) => {
				if (data.list && Array.isArray(data.list)) {
					data.list.forEach((data, index) => {
						ELEMENT_DATA.push({
							_id: data._id,
							position: index + 1,
							description: data.description,
							franchise: data.franchise,
							type: data.type,
							image: data.images && data.images[0] ? data.images[0] : undefined,
							status: data.status,
							createdAt: data.createdAt,
							expirationDate: data.expirationDate,
						});
					});
					self.dataSource = new MatTableDataSource(ELEMENT_DATA);
					self.totalLength = data.total;
					this.changeDetectorRefs.detectChanges();
				}
			});
	}

	async createModalShow(content) {
		await this.newFormData();

		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-create-data",
				size: "lg",
				backdrop: "static",
			})
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async create(data: Notification) {
		this.notificationsService.create(data).subscribe(
			async (data: any) => {
				this.modalService.dismissAll("");
				this.toastr.success("Registro cadastrado com sucesso!", "Sucesso!");
				await this.getList(0, this.pageSize, undefined, undefined);
			},
			(error) => {
				this.toastr.error("Falha ao criar Registro!", "Falha!");
			}
		);
	}

	async editModalShow(content, data: any) {
		await this.newFormData();
		this.formData.get("file").clearValidators();
		this.formData.get("file").updateValueAndValidity();
		console.log(data.franchise._id);
		this.formData.patchValue({
			_id: data._id,

			franchise: data.franchise._id,
			type: data.type,
			file: data.file,
			description: data.description,
			status: data.status,
			expirationDate: new Date(data.expirationDate).toISOString().slice(0, 16),
		});

		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-edit-data",
				size: "lg",
				backdrop: "static",
			})
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async edit(data: Notification) {
		this.notificationsService.update(data).subscribe(
			async (data: any) => {
				this.toastr.success("Registro alterado com sucesso!", "Sucesso!");
				await this.getList(0, this.pageSize, undefined, undefined);
				this.modalService.dismissAll();
			},
			(error) => {
				console.error(error);
				this.toastr.error("Falha ao alterar registro!", "Falha!");
				this.modalService.dismissAll();
			}
		);
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
		await this.getList(0, this.pageSize, undefined, undefined);
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
		this.getList(0, this.pageSize, undefined, undefined);
	}

	displayFnFilter(franchise: Franchise) {
		if (franchise) {
			return franchise.name;
		}
	}

	async onClickFranchiseFilter(franchise) {
		await this.getList(0, this.pageSize, franchise._id, undefined);
	}

	// --> obtem o status do registro
	getStatusColor(status) {
		if (status === true) {
			return "bg-success";
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
}
