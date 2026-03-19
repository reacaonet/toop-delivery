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

import { SupportSubjects } from "../../../../../models/mobility/supportSubjects";
import { SubjectService } from "../../../../services/mobility/supportSubject.service";
import { FranchiseService } from "./../../../../services/franchise.service";
import { Franchise } from "./../../../../../models/franchise";

import { checkObjectIdisValid } from "../../../util";

@Component({
	selector: "kt-supportSubject",
	templateUrl: "./supportSubject.component.html",
	styleUrls: ["./supportSubject.component.scss"],
})
export class SupportSubjectComponent implements OnInit, AfterViewInit {
	box = "";
	boxNome = "";
	idToDelete; // Save id to delete
	dataSource;
	displayedColumns = ["subject", "type", "target", "franchise", "delete"];
	files: Set<File>;
	formData;
	formFilter: FormGroup;
	formSubmitAttempt = false;
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;

	visible = true;
	selectable = true;
	removable = true;
	addOnBlur = true;
	filter: any = {
		pageIn: 0,
		pageOut: 20,
	};
	currentFranchise: string = "";
	franchises: Franchise[] = [];
	listFranchise: any = [];

	types = [
		{ value: "PASSENGER", label: "Passageiro" },
		{ value: "DRIVER", label: "Motorista" },
	];
	targets = [
		{ value: "CANCEL", label: "Cancelamento" },
		{ value: "SUPPORT", label: "Suporte" },
	];

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private subjectService: SubjectService,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private franchiseService: FranchiseService
	) {}

	async ngOnInit() {
		await this.addFormFilter();
		await this.getList(this.filter);
	}

	async addFormFilter() {
		return new Promise(async (resolve, reject) => {
			// Criando os campos do formulário
			this.formFilter = new FormGroup({
				subject: new FormControl(""),
				franchise: new FormControl("", [checkObjectIdisValid]),
			});

			this.formFilter
				.get("subject")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => {
						if (typeof value === "string" && value.length > 0) {
							this.filter.pageIn = 0;
							this.filter.subject = value;
							this.getList(this.filter);
						} else {
							delete this.filter.subject;
							return [];
						}
					})
				)
				.subscribe((results) => {
					this.changeDetectorRefs.detectChanges();
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

			return resolve(true);
		});
	}

	async newFormData() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),

				subject: new FormControl("", [Validators.required]),
				type: new FormControl("", [Validators.required]),
				target: new FormControl("", [Validators.required]),
				franchise: new FormControl("", [checkObjectIdisValid]),
				status: new FormControl(""),
			});

			const user = localStorage.getItem("@user-info")
				? JSON.parse(localStorage.getItem("@user-info"))
				: undefined;

			let userId;
			if (user && user._id) {
				if (`${user.isRoot}` !== "true") {
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
				.subscribe((results) => (this.franchises = results));

			return resolve(true);
		});
	}

	changePage(event) {
		this.pageSize = event.pageSize;

		this.filter.pageIn = event.pageIndex;
		this.filter.pageOut = event.pageSize;

		this.getList(this.filter);
	}

	async getList(params = {}) {
		const self = this;
		const ELEMENT_DATA = [];

		await this.subjectService.getPaginator(params).subscribe((data: any) => {
			if (data.list && Array.isArray(data.list)) {
				data.list.forEach((data, index) => {
					ELEMENT_DATA.push({
						_id: data._id,
						position: index + 1,
						subject: data.subject,
						type: data.type,
						target: data.target,
						franchise: data.franchise,
						status: data.status,
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

	async create(data: SupportSubjects) {
		this.subjectService.create(data).subscribe(
			async (data: any) => {
				this.modalService.dismissAll("");
				this.toastr.success("Registro cadastrado com sucesso!", "Sucesso!");
				await this.getList(this.filter);
			},
			(error) => {
				this.toastr.error("Falha ao criar Motivo!", "Falha!");
			}
		);
	}

	async editModalShow(content, data: SupportSubjects) {
		await this.newFormData();

		this.formData.patchValue({
			_id: data._id,
			status: data.status,
			subject: data.subject,
			type: data.type,
			franchise: data.franchise,
			target: data.target,
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

	async edit(data: SupportSubjects) {
		this.subjectService.update(data).subscribe(
			async (data: any) => {
				this.toastr.success("Motivo alterado com sucesso!", "Sucesso!");
				await this.getList(this.filter);
				this.modalService.dismissAll();
			},
			(error) => {
				console.error(error);
				this.toastr.error("Falha ao alterar motivo!", "Falha!");
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
			this.toastr.error("Falha ao deletar Motivo!", "Falha!");
			return;
		}
		// delete
		await this.subjectService.delete(this.idToDelete).toPromise();
		// sucesso ao excluir tela
		this.toastr.success("Motivo deletado com sucesso!", "Sucesso!");
		// trata o id pra indefinido
		this.idToDelete = undefined;
		// att a tela
		await this.getList(this.filter);
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
		this.getList(this.filter);
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

	displayFnFranchise(franchise) {
		if (franchise) {
			return franchise.name;
		}
	}

	displayFn(data: any) {
		if (data) {
			return data.name;
		}
	}

	async onClickFranchiseFilter(franchise) {
		if (franchise && franchise._id) {
			this.filter.franchiseId = franchise._id;
			this.getList(this.filter);
		} else {
			delete this.filter.franchiseId;
		}
	}
}
