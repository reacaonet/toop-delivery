import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { startWith, debounceTime, switchMap } from "rxjs/operators";

import { Franchise } from "../../../../../models/franchise";
import { FranchiseService } from "./../../../../services/franchise.service";
import { SegmentService } from "./../../../../services/company/segment.service";
import { SegmentModel } from "./../../../../../models/company/segment";

@Component({
	selector: "kt-segment",
	templateUrl: "./segment.component.html",
	styleUrls: ["./segment.component.scss"],
})
export class SegmentComponent implements OnInit, AfterViewInit {
	displayedColumns = [
		"image",
		"name",
		"franchise",
		"category",
		"order",
		"status",
		"delete",
	];
	franchises: Franchise[] = [];
	segmentIdToDelete;
	dataSource;
	files: Set<File>;
	formData;
	formSubmitSegment = false;
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	typeAction = "create";

	listCategory = [
		{
			key: "delivery",
			name: "Delivery",
		},
		{
			key: "service",
			name: "Serviços",
		},
	];

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private segmentService: SegmentService,
		private franchiseService: FranchiseService,
		private toastr: ToastrService
	) {}

	ngOnInit() {
		this.getSegmentsList(0, this.pageSize, undefined);
	}

	async getSegmentsList(pageIn, pageOut, name) {
		const self = this;
		const ELEMENT_DATA = [];

		this.segmentService
			.paginator(pageIn, pageOut, name)
			.subscribe((data: any) => {
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				if (data && data.list && Array.isArray(data.list)) {
					data.list.forEach((segment, index) => {
						ELEMENT_DATA.push({
							_id: segment._id,
							position: index + 1,
							name: segment.name,
							image:
								segment.images && segment.images[0]
									? segment.images[0]
									: undefined,
							category: segment.category ? segment.category : "delivery",
							status: segment.status,
							order: segment.order ? segment.order : "",
							franchise: segment.franchise,
						});
					});
					self.dataSource = new MatTableDataSource(ELEMENT_DATA);
					self.totalLength = data.total;
					this.changeDetectorRefs.detectChanges();
				}
			});
	}

	async newFormData() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),
				name: new FormControl(undefined, [Validators.required]),
				franchise: new FormControl(undefined, [Validators.required]),
				category: new FormControl("delivery", [Validators.required]),
				status: new FormControl(true),
				order: new FormControl(1, [Validators.required]),
				file: new FormControl(undefined, [Validators.required]),
			});

			this.formData
				.get("franchise")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) =>
						value && typeof value === "string" && value.length > 0
							? this.getListFranchises(value)
							: []
					)
				)
				.subscribe((results) => {
					console.log("rrr", results);
					this.franchises = results;
					this.changeDetectorRefs.detectChanges();
				});

			resolve(true);
		});
	}

	async getListFranchises(name) {
		return new Promise(async (resolve, reject) => {
			const user = localStorage.getItem("@user-info")
				? JSON.parse(localStorage.getItem("@user-info"))
				: undefined;

			if (user && user._id) {
				const userLogged =
					user.company === "5eb311b4161dd2f719517d62" ? undefined : user._id;

				const list = await this.franchiseService
					.getFranchisesNome(name, userLogged)
					.toPromise();
				return resolve(list);
			}
			resolve([]);
		});
	}

	async upsertModalShow(content, segment: SegmentModel, type = "create") {
		this.typeAction = type;
		this.formSubmitSegment = false;

		// await this.getListFranchises();
		await this.newFormData();

		if (this.typeAction === "edit") {
			// Alter file permissions
			this.formData.get("file").clearValidators();
			this.formData.get("file").updateValueAndValidity();
		}

		if (segment) {
			this.formData.patchValue({
				_id: segment._id,
				position: this.dataSource.data.length + 2,
				name: segment.name,
				franchise: segment?.franchise,
				category: segment.category ? segment.category : "delivery",
				status: segment.status,
				order: segment.order ? segment.order : 1,
				file: "",
			});
		}

		this.modalService
			.open(content, { ariaLabelledBy: "modal-edit-segment", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async upsert(segment: SegmentModel) {
		if (this.typeAction === "create") {
			this.segmentService.create(segment).subscribe(
				async (_: any) => {
					await this.getSegmentsList(0, this.pageSize, undefined);
					this.changeDetectorRefs.detectChanges();
					this.toastr.success("Registro atualizado com sucesso!", "Sucesso!");
					this.modalService.dismissAll();
				},
				(error) => {
					this.toastr.error("Falha ao criar registro!", "Falha!");
					this.modalService.dismissAll();
				}
			);
		} else {
			this.segmentService.update(segment).subscribe(
				async (_: any) => {
					await this.getSegmentsList(0, this.pageSize, undefined);
					this.toastr.success("Registro alterado com sucesso!", "Sucesso!");
					this.modalService.dismissAll();
				},
				(error) => {
					console.error(error);
					this.toastr.error("Falha ao alterar registro!", "Falha!");
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

	async confirmDeleteModalShow(content, segment) {
		this.segmentIdToDelete = segment._id;
		this.modalService
			.open(content, { ariaLabelledBy: "modal-delete-segment", size: "sm" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	// Deleta o segment
	async delete() {
		if (!this.segmentIdToDelete) {
			this.toastr.error("Erro ao deletar registro!", "Falha!");
			return;
		}
		await this.segmentService.delete(this.segmentIdToDelete).toPromise();
		this.toastr.success("Registro deletado com sucesso!", "sucesso!");
		this.segmentIdToDelete = undefined;
		await this.getSegmentsList(0, this.pageSize, undefined);
	}

	ngAfterViewInit() {}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getSegmentsList(event.pageIndex, event.pageSize, undefined);
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
}
