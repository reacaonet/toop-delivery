import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { MatChipInputEvent } from "@angular/material/chips";
import { startWith, debounceTime, switchMap } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";

/** Service */
import { SupportSubjects } from "../../../../../../models/mobility/supportSubjects";
import { SubjectService } from "../../../../../services/mobility/supportSubject.service";
import { VehicleDocumentsService } from "../../../../../services/mobility/vehicleDocuments.service";

@Component({
	selector: "kt-supportSubject",
	templateUrl: "./vehicle.component.html",
	styleUrls: ["./vehicle.component.scss"],
})
export class VehicleComponent implements OnInit, AfterViewInit {
	box = "";
	boxNome = "";
	idToDelete; // Save id to delete
	dataSource;
	displayedColumns = [
		"manufacturer",
		"model",
		"nameplate",
		"nameDriver",
		"phoneDriver",
		"approved",
		"status",
		"delete",
	];
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
	images = [];

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
		private vehicleDocumentsService: VehicleDocumentsService,
		private toastr: ToastrService
	) {}

	async ngOnInit() {
		await this.addFormFilter();
		await this.getList(0, this.pageSize, undefined);
	}

	async addFormFilter() {
		return new Promise(async (resolve, reject) => {
			this.formFilter = new FormGroup({
				searchDriver: new FormControl("", []),
			});

			this.formFilter
				.get("searchDriver")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => {
						if (value && typeof value === "string") {
							return this.getList(0, this.pageSize, value);
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

	async newFormData() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),
				manufacturer: new FormControl(""),
				model: new FormControl(""),
				nameplate: new FormControl(""),
				nameDriver: new FormControl(""),
				phoneDriver: new FormControl(""),
				approved: new FormControl(""),
				status: new FormControl(""),
			});
			return resolve(true);
		});
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getList(event.pageIndex, event.pageSize, undefined);
	}

	async getList(pageIn, pageOut, searchDriver = "") {
		const self = this;
		const ELEMENT_DATA = [];

		this.vehicleDocumentsService
			.getPaginator({
				pageIn,
				pageOut,
				searchDriver,
			})
			.subscribe((data: any) => {
				if (data.list && Array.isArray(data.list)) {
					data.list.forEach((data, index) => {
						ELEMENT_DATA.push({
							_id: data._id,
							position: index + 1,
							manufacturer: data.vehicleManufacturer,
							model: data.vehicleModel,
							nameplate: data.vehicleNameplate,
							nameDriver: data.driver && data.driver.name ? data.driver.name : "",
							phoneDriver: data.driver && data.driver.phone ? data.driver.phone : "",
							approved: data.approved,
							status: data.status,
							carsDocument: data?.carsDocument || [],
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
				await this.getList(0, this.pageSize, undefined);
			},
			(error) => {
				this.toastr.error("Falha ao criar Motivo!", "Falha!");
			}
		);
	}

	async editModalShow(content, data: any) {
		this.images = [];
		await this.newFormData();

		this.formData.patchValue({
			_id: data._id,
			manufacturer: data.manufacturer,
			model: data.model,
			nameplate: data.nameplate,
			nameDriver: data.nameDriver,
			phoneDriver: data.phoneDriver,
			approved: data.approved,
			status: data.status,
		});

		if (data?.carsDocument && Array.isArray(data?.carsDocument) && data?.carsDocument.length > 0) {
			this.images = data.carsDocument;
		}

		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-edit-data",
				size: "lg",
				backdrop: "static",
			})
			.result.then(
				(result) => {
					this.changeDetectorRefs.detectChanges();
				},
				(reason) => {}
			);
	}

	async edit(data: any) {
		this.vehicleDocumentsService.updateVehicle(data._id, data).subscribe(
			async (data: any) => {
				this.toastr.success("Motivo alterado com sucesso!", "Sucesso!");
				await this.getList(0, this.pageSize, undefined);
				this.modalService.dismissAll();
			},
			(error) => {
				console.error(error);
				this.toastr.error("Falha ao alterar motivo!", "Falha!");
				this.modalService.dismissAll();
			}
		);

		// this.subjectService.update(data).subscribe(
		// 	async (data: any) => {
		// 		this.toastr.success("Motivo alterado com sucesso!", "Sucesso!");
		// 		await this.getList(0, this.pageSize, undefined);
		// 		this.modalService.dismissAll();
		// 	},
		// 	(error) => {
		// 		console.error(error);
		// 		this.toastr.error("Falha ao alterar motivo!", "Falha!");
		// 		this.modalService.dismissAll();
		// 	}
		// );
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
		await this.getList(0, this.pageSize, undefined);
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
		this.getList(0, this.pageSize, undefined);
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
