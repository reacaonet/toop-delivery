import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
} from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { startWith, debounceTime, switchMap } from "rxjs/operators";

import { Alert } from "./../../../../../models/alert";
import { Type } from "./../../../../../models/email/type";
import { TypeService } from "./../../../../services/email/type.service";

@Component({
	selector: "kt-type",
	templateUrl: "./type.component.html",
	styleUrls: ["./type.component.scss"],
})
export class TypeComponent implements OnInit, AfterViewInit {
	alert: Alert = undefined;
	stateValue: string;
	dataSource;
	idToDelete;
	displayedColumns = ["name", "status", "delete"];
	formData;
	formSubmitAttempt = false;
	myControl: FormControl = new FormControl();

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private typeService: TypeService,
		private modalService: NgbModal
	) {}

	ngOnInit() {
		this.getList();
		this.formData = new FormGroup({
			_id: new FormControl(""),
			name: new FormControl("", [Validators.required]),
			status: new FormControl("", [Validators.required]),
			key: new FormControl("", [Validators.required]),
		});
	}

	async getList() {
		const self = this;
		let ELEMENT_DATA = [];

		this.typeService.get().subscribe((data: any) => {
			self.dataSource = new MatTableDataSource(ELEMENT_DATA);
			if (data && Array.isArray(data)) {
				data.forEach((data: any, index) => {
					ELEMENT_DATA.push({
						_id: data._id,
						position: index + 1,
						name: data.name,
						status: data.status,
						key: data.key,
					});
				});
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	createModalShow(content) {
		this.formData.reset();
		this.myControl = new FormControl();
		this.modalService
			.open(content, { ariaLabelledBy: "modal-create", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async create(data: any) {
		this.typeService.create(data).subscribe(
			(data: any) => {
				const item = data.data;
				this.alert = new Alert("Tipo de e-mail criado com sucesso!", "success");

				this.getList();

				this.dataSource._updateChangeSubscription();
				this.changeDetectorRefs.detectChanges();
			},
			(error) => {
				if (error?.error?.message) {
					this.alert = new Alert(error?.error?.message, "danger");
				} else {
					this.alert = new Alert("Falha ao criar Termo!", "danger");
				}
			}
		);
	}

	async editModalShow(content, data: any) {
		this.formSubmitAttempt = false;

		this.formData.reset();
		this.formData.patchValue({
			_id: data._id,
			name: data.name,
			status: data.status,
			key: data.key,
		});

		this.modalService
			.open(content, { ariaLabelledBy: "modal-edit", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
		this.changeDetectorRefs.detectChanges();
	}

	async update(data: any) {
		this.typeService.update(data).subscribe(
			(data: any) => {
				this.getList();
				this.alert = new Alert(
					"Tipo de e-mail alterado com sucesso!",
					"success"
				);
			},
			(error) => {
				console.error(error);
				this.alert = new Alert("Falha ao alterar Tipo!", "danger");
			}
		);
	}
	async confirmDeleteModalShow(content, data) {
		this.idToDelete = data._id;
		this.modalService
			.open(content, { ariaLabelledBy: "modal-delete", size: "sm" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async delete() {
		if (!this.idToDelete) {
			this.alert = new Alert("Falha ao deletar Tipo!", "danger");
			return;
		}
		await this.typeService.delete(this.idToDelete).toPromise();
		this.alert = new Alert("Tipo de e-mail deletado com sucesso!", "success");
		this.idToDelete = undefined;
		await this.getList();
	}

	closeAlert() {
		this.alert = null;
	}

	ngAfterViewInit() {}
}
