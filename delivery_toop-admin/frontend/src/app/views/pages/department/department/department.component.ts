import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { ToastrService } from "ngx-toastr";

import { Alert } from "../../../../../models/alert";
import { Department } from "./../../../../../models/department";
import { DepartmentService } from "./../../../../services/department.service";

@Component({
	selector: "kt-department",
	templateUrl: "./department.component.html",
	styleUrls: ["./department.component.scss"],
})
export class DepartmentComponent implements OnInit, AfterViewInit {
	alert: Alert = undefined;
	dataSource;
	deleteIdToDelete;
	departmentIdToDelete;
	displayedColumns = ["name", "showInApp", "status", "origin", "delete"];
	formData;
	formDataKeyword;
	formSubmitDepartment = false;
	myControl: FormControl = new FormControl();
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	params: any = {
		type: "company",
	};
	userLogged: any = null;

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private departmentService: DepartmentService
	) {}

	ngOnInit() {
		const userLogged: any = localStorage.getItem("@user-info");
		if (userLogged) {
			this.userLogged = JSON.parse(userLogged);
		}

		if (this.userLogged && this.userLogged.isRoot) {
			this.params.type = "admin";
		} else if (this.userLogged && this.userLogged.franchise) {
			this.params.type = "franchise";

			if (this.userLogged.franchise && this.userLogged.franchise._id) {
				this.params.franchise = this.userLogged.franchise._id;
			} else if (
				this.userLogged.franchises &&
				Array.isArray(this.userLogged.franchises) &&
				this.userLogged.franchises.length > 0
			) {
				this.params.franchise = this.userLogged.franchises[0]._id;
			} else {
				this.params.franchise = this.userLogged.franchise;
			}
		} else {
			if (this.userLogged.company && this.userLogged.company._id) {
				this.params.company = this.userLogged.company._id;
			} else if (
				this.userLogged.companies &&
				Array.isArray(this.userLogged.companies) &&
				this.userLogged.companies.length > 0
			) {
				this.params.company = this.userLogged.companies[0]._id;
			} else {
				this.params.company = this.userLogged.company
					? this.userLogged.company
					: "";
			}
		}

		this.getListDepartments(0, this.pageSize);
	}

	async addNewFormData() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),
				name: new FormControl("", [Validators.required]),
				showInApp: new FormControl(""),
				status: new FormControl(""),
				keyword: new FormArray([]),
			});
			resolve(true);
		});
	}

	async addNewKeyword() {
		return new Promise(async (resolve, reject) => {
			this.formDataKeyword = new FormGroup({
				suggesteds: new FormControl("", [Validators.required]),
			});
			this.formData.get("keyword").push(this.formDataKeyword);
			resolve(true);
		});
	}

	async removeFeeItem(index) {
		return new Promise(async (resolve, reject) => {
			await this.formData.get("keyword").removeAt(index);
			resolve(true);
		});
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getListDepartments(event.pageIndex, event.pageSize);
	}

	async getListDepartments(pageIn, pageOut) {
		const self = this;
		let ELEMENT_DATA = [];

		this.departmentService
			.getPaginatorDepartments(pageIn, pageOut, this.params)
			.subscribe((data: any) => {
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				if (data.list && Array.isArray(data.list)) {
					data.list.forEach((department, index) => {
						ELEMENT_DATA.push({
							_id: department._id,
							position: index + 1,
							name: department.name,
							suggesteds: department.suggesteds,
							showInApp: department.showInApp,
							company: department.company ? department.company : null,
							franchise: department.franchise ? department.franchise : null,
							origin: this.getOrigin(department),
							status: department.status,
						});
					});
					self.dataSource = new MatTableDataSource(ELEMENT_DATA);
					self.totalLength = data.total;
					self.changeDetectorRefs.detectChanges();
				}
			});
	}

	async createDepartmentModalShow(content) {
		this.formSubmitDepartment = false;
		await this.addNewFormData();

		this.formData.reset();
		this.myControl = new FormControl();
		this.modalService
			.open(content, { ariaLabelledBy: "modal-create-department", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async createDepartment(department: Department) {
		department.suggesteds = [];
		if (department.keyword && Array.isArray(department.keyword)) {
			department.suggesteds = department.keyword.map((item) => item.suggesteds);
		}

		if (department.suggesteds.length <= 0) {
			return this.toastr.warning("Informe pelo menos uma sugestão", "Falha!");
		}

		delete department.keyword;

		if (this.params.company) {
			department.company = this.params.company;
		}

		if (this.params.franchise) {
			department.franchise = this.params.franchise;
		}

		this.departmentService.createDepartment(department).subscribe(
			(data: any) => {
				this.toastr.success("Departamento criado com sucesso!", "Sucesso!");

				this.dataSource.data.push({
					_id: data._id,
					position: this.dataSource.data.length + 2,
					name: data.name,
					suggesteds: data.suggesteds,
					showInApp: data.showInApp,
					status: data.status,
				});

				this.dataSource._updateChangeSubscription();
				this.changeDetectorRefs.detectChanges();
				this.formData.reset();
				this.modalService.dismissAll();
			},
			(error) => {
				// this.modalService.dismissAll();

				let message = "Erro ao criar Departamento!";
				if (error.error && error.error.message) {
					message = error.error.message;
				}

				this.toastr.error(message, "Falha!");
			}
		);
	}

	async editDepartmentModalShow(content, department: Department) {
		this.formSubmitDepartment = false;
		await this.addNewFormData();

		this.formData.patchValue({
			_id: department._id,
			name: department.name,
			suggesteds: department.suggesteds,
			showInApp: department.showInApp,
			status: department.status,
		});

		for await (const item of department.suggesteds) {
			this.formDataKeyword = new FormGroup({
				suggesteds: new FormControl(item, [Validators.required]),
			});

			this.formData.get("keyword").push(this.formDataKeyword);
		}

		this.modalService
			.open(content, { ariaLabelledBy: "modal-edit-department", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async updateDepartment(department: Department) {
		department.suggesteds = [];
		if (department.keyword && Array.isArray(department.keyword)) {
			department.suggesteds = department.keyword.map((item) => item.suggesteds);
		}
		delete department.keyword;

		this.departmentService.updateDepartment(department).subscribe(
			(data: any) => {
				const index = this.dataSource.data
					.map((e: any) => e._id)
					.indexOf(department._id);

				this.dataSource.data[index] = data.data;

				this.dataSource._updateChangeSubscription();
				this.changeDetectorRefs.detectChanges();
				this.formData.reset();
				this.modalService.dismissAll();
				this.toastr.success("Departamento alterado com sucesso!", "Sucesso!");
			},
			(error) => {
				this.toastr.error("Erro ao alterar Departamento!", "Falha!");
				this.modalService.dismissAll();
			}
		);
	}

	async confirmDeleteModalShow(content, department) {
		this.departmentIdToDelete = department._id;
		this.modalService
			.open(content, { ariaLabelledBy: "modal-delete-department", size: "sm" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async deleteDepartment() {
		if (!this.departmentIdToDelete) {
			this.toastr.error("Erro ao deletar Departamento!", "Falha!");
			return;
		}
		await this.departmentService
			.deleteDepartment(this.departmentIdToDelete)
			.toPromise();
		this.toastr.success("Departamento deletado com sucesso!", "Sucesso!");
		this.departmentIdToDelete = undefined;
		await this.getListDepartments(0, this.pageSize);
	}

	closeAlert() {
		this.alert = null;
	}

	ngAfterViewInit() {}

	showEdit(item) {
		if (this.params.type === "company") {
			if (item.company && item.company === this.params.company) {
				return true;
			}
		} else if (
			this.params.type === "franchise" &&
			item.franchise === this.params.franchise
		) {
			return true;
		} else if (this.params.type === "admin") {
			return true;
		}

		return false;
	}

	getOrigin(item) {
		if (item.company) {
			return "Empresa";
		} else if (item.franchise) {
			return "Franquia";
		}

		return "Admin";
	}
}
