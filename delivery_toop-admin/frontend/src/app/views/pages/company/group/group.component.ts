import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { startWith, debounceTime, switchMap } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";

import { Group } from "./../../../../../models/group";
import { GroupService } from "./../../../../services/group.service";
import { Franchise } from "../../../../../models/franchise";
import { FranchiseService } from "../../../../services/franchise.service";

@Component({
	selector: "kt-group",
	templateUrl: "./group.component.html",
	styleUrls: ["./group.component.scss"],
})
export class GroupComponent implements OnInit, AfterViewInit {
	dataSource;
	displayedColumns = [
		"image",
		"franchise",
		"name",
		"description",
		"status",
		"delete",
	];
	formData;
	formFilter: FormGroup;
	formSubmitGroup = false;
	files: Set<File>;
	groupIdToDelete;
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	typeAction = "create";

	franchises: Franchise[] = [];

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private groupService: GroupService,
		private franchiseService: FranchiseService
	) { }

	ngOnInit() {
		this.getListFranchises();

		this.formFilter = new FormGroup({
			name: new FormControl(""),
			group: new FormControl(""),
		});
		this.formFilter
			.get("name")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) => (value && typeof value === 'string' && value.length > 0) ? this.getListGroups(0, this.pageSize, value) : [])
			)
			.subscribe((results) => {
				this.changeDetectorRefs.detectChanges();
			});

		this.getListGroups(0, this.pageSize, undefined);
	}

	newFormData() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),
				name: new FormControl(undefined, [Validators.required]),
				description: new FormControl(undefined, [Validators.required]),
				file: new FormControl(undefined, [Validators.required]),
				status: new FormControl(true),
				franchise: new FormControl(undefined, [Validators.required]),
			});

			this.formData
				.get("franchise")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) =>
						value && typeof value === "string" && value.length > 0
							? this.getListFranchises()
							: []
					)
				)
				.subscribe((results) => {
					this.franchises = results;
					this.changeDetectorRefs.detectChanges();
				});

			resolve(true);
		});
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getListGroups(event.pageIndex, event.pageSize, undefined);
	}

	async getListGroups(pageIn, pageOut, name) {
		const self = this;
		const ELEMENT_DATA = [];
		this.groupService
			.getGroupsPaginator(pageIn, pageOut, name)
			.subscribe((data: any) => {
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				if (data.list && Array.isArray(data.list)) {
					data.list.forEach((group, index) => {
						ELEMENT_DATA.push({
							position: index + 1,
							_id: group._id,
							name: group.name,
							image:
								group.images && group.images[0] ? group.images[0] : undefined,
							description: group.description,
							status: group.status,
							franchise: group?.franchise ? group?.franchise : undefined,
						});
					});
					self.dataSource = new MatTableDataSource(ELEMENT_DATA);
					self.totalLength = data.total;
					this.changeDetectorRefs.detectChanges();
				}
			});
	}

	async upSertGroupModalShow(content, group: Group, type = "create") {
		this.typeAction = type;
		this.formSubmitGroup = false;
		await this.newFormData();

		if (this.typeAction === "edit") {
			// Alter file permissions
			this.formData.get("file").clearValidators();
			this.formData.get("file").updateValueAndValidity();
		}

		if (group) {
			this.formData.patchValue({
				_id: group._id,
				position: this.dataSource.data.length + 2,
				name: group.name,
				description: group.description,
				status: group.status,
				file: "",
				franchise: group?.franchise?._id,
			});
		}

		this.modalService
			.open(content, { ariaLabelledBy: "modal-edit-group", size: "lg" })
			.result.then(
				(result) => { },
				(reason) => { }
			);
	}

	async upSertGroup(group: Group) {
		if (this.typeAction === "create") {
			this.groupService.createGroup(group).subscribe(
				async (_: any) => {
					await this.getListGroups(0, this.pageSize, undefined);
					this.changeDetectorRefs.detectChanges();

					this.toastr.success("Group atualizado com sucesso!", "Sucesso!");
					this.modalService.dismissAll();
				},
				(error) => {
					if (error?.error?.code  && error?.error?.message) {
						this.toastr.error(error?.error?.message, "Falha!");
					} else {
						this.toastr.error("Erro ao criar Group!", "Falha!");
					}
					this.modalService.dismissAll();
				}
			);
		} else {
			this.groupService.updateGroup(group).subscribe(
				async (_: any) => {
					await this.getListGroups(0, this.pageSize, undefined);
					this.toastr.success("Group alterado com sucesso!", "Sucesso!");
					this.modalService.dismissAll();
				},
				(error) => {
					console.error(error);
					this.toastr.error("Erro ao alterar group!", "Falha!");
					this.modalService.dismissAll();
				}
			);
		}
	}

	displayFnFranchise(franchise: Franchise) {
		if (franchise) {
			return franchise.name;
		}
	}

	async confirmDeleteModalShow(content, group) {
		this.groupIdToDelete = group._id;
		this.modalService
			.open(content, { ariaLabelledBy: "modal-delete-group", size: "sm" })
			.result.then(
				(result) => { },
				(reason) => { }
			);
	}

	async deleteGroup() {
		if (!this.groupIdToDelete) {
			this.toastr.error("Erro ao deletar group!", "Falha!");
			return;
		}
		await this.groupService.deleteGroup(this.groupIdToDelete).toPromise();
		this.toastr.success("Group deletado com sucesso!", "Sucesso!");
		this.groupIdToDelete = undefined;
		await this.getListGroups(0, this.pageSize, undefined);
	}

	ngAfterViewInit() { }

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

	async getFranchises(userId: string = "") {
		if (!userId) {
			await this.franchiseService.getfranchises().subscribe((data: any) => {
				this.franchises = data;
				this.changeDetectorRefs.detectChanges();
			});
		} else {
			await this.franchiseService.getByUser(userId, undefined).subscribe((data: any) => {
				this.franchises = data;
				this.changeDetectorRefs.detectChanges();
			});
		}
	}

	async getListFranchises() {
		const user = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;

		if (user && user._id) {
			if (user.company === "5eb311b4161dd2f719517d62") {
				this.getFranchises();
			} else {
				this.getFranchises(user._id);
			}
		}
	}
}
