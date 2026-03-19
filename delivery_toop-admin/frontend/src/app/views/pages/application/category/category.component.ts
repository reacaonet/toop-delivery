import { Category } from "./../../../../../models/application/category";
import { CategoryService } from "./../../../../services/category.service";
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

import { Alert } from "../../../../../models/alert";
import { SegmentService } from "./../../../../services/company/segment.service";
import { SegmentModel } from "../../../../../models/company/segment";

@Component({
	selector: "kt-category",
	templateUrl: "./category.component.html",
	styleUrls: ["./category.component.scss"],
})
export class CategoryComponent implements OnInit, AfterViewInit {
	alert: Alert = undefined;
	dataSource;
	displayedColumns = [
		"image",
		"name",
		"keyword",
		"segment",
		"showInApp",
		"showHome",
		"status",
		"order",
		"delete",
	];
	files: Set<File>;
	formData;
	formSubmitCategory = false;
	myControl: FormControl = new FormControl();
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	categoryIdToDelete;
	totalLength;
	segments: SegmentModel[] = [];

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private categoryService: CategoryService,
		private segmentService: SegmentService
	) {}

	ngOnInit() {
		this.getListCategory(0, this.pageSize);
	}

	async addNewFormData() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),
				name: new FormControl("", [Validators.required]),
				// type: new FormControl('', [Validators.required]),
				showInApp: new FormControl(""),
				showHome: new FormControl(true),
				segment: new FormControl("", [Validators.required]),
				keyword: new FormControl("", [Validators.required]),
				file: new FormControl("", [Validators.required]),
				order: new FormControl(1, [Validators.required]),
				status: new FormControl(""),
			});

			this.formData
				.get("segment")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) =>
						value && typeof value === "string" && value.length > 0
							? this.segmentService.get(value)
							: []
					)
				)
				.subscribe((results) => {
					this.segments = results;
					this.changeDetectorRefs.detectChanges();
				});

			resolve(true);
		});
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getListCategory(event.pageIndex, event.pageSize);
	}

	async getListCategory(pageIn, pageOut) {
		await this.addNewFormData();

		const self = this;
		let ELEMENT_DATA = [];

		this.categoryService
			.getPaginatorCategory(pageIn, pageOut)
			.subscribe((data: any) => {
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				if (data.list && Array.isArray(data.list)) {
					data.list.forEach((category, index) => {
						ELEMENT_DATA.push({
							_id: category._id,
							position: index + 1,
							name: category.name,
							// type: category.type,
							showInApp: category.showInApp,
							showHome: category.showHome ? category.showHome : false,
							segment: category.segment ? category.segment : [],
							keyword: category.keyword,
							status: category.status,
							order: category.order ? category.order : "",
							image:
								category.images && category.images[0]
									? category.images[0]
									: undefined,
						});
					});
					self.dataSource = new MatTableDataSource(ELEMENT_DATA);
					self.totalLength = data.total;
					self.changeDetectorRefs.detectChanges();
				}
			});
	}

	async createCategoryModalShow(content) {
		this.formSubmitCategory = false;
		await this.addNewFormData();

		this.formData.reset();
		this.modalService
			.open(content, { ariaLabelledBy: "modal-create-category", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async createCategory(category: Category) {
		if (!this.files || this.files.size <= 0) {
			this.alert = new Alert(
				"Falha ao criar categoria! Imagem é obrigatoria!",
				"danger"
			);
			return;
		}

		this.categoryService.createCategory(category).subscribe(
			(data: any) => {
				const category = data.data;

				this.alert = new Alert("Categoria criado com sucesso!", "success");

				if (category && category.images && category.images[0]) {
					category.image = category.images[0];
				}

				this.dataSource.data.push({
					_id: category._id,
					position: this.dataSource.data.length + 2,
					name: category.name,
					// type: category.type,
					showInApp: category.showInApp,
					keyword: category.keyword,
					status: category.status,
					image: category.image,
					order: category.order,
					segment: category.segment,
				});

				this.dataSource._updateChangeSubscription();
				this.getListCategory(0, this.pageSize);
				this.modalService.dismissAll();
				this.changeDetectorRefs.detectChanges();
				this.formData.reset();
			},
			(error) => {
				this.alert = new Alert("Falha ao criar categoria!", "danger");
				this.modalService.dismissAll();
			}
		);
	}

	async editCategoryModalShow(content, category: Category) {
		this.formSubmitCategory = false;
		await this.addNewFormData();

		this.formData.get("file").clearValidators();
		this.formData.get("file").updateValueAndValidity();

		this.formData.patchValue({
			_id: category._id,
			name: category.name,
			// type: category.type,
			showInApp: category.showInApp,
			showHome: category.showHome ? category.showHome : false,
			segment: category.segment ? category.segment._id : "",
			keyword: category.keyword,
			status: category.status,
			order: category.order ? category.order : 1,
			file: "",
		});
		this.modalService
			.open(content, { ariaLabelledBy: "modal-edit-category", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async updateCategory(category: Category) {
		this.categoryService.updateCategory(category).subscribe(
			(data: any) => {
				const index = this.dataSource.data
					.map((e: any) => e._id)
					.indexOf(category._id);

				this.dataSource.data[index] = data.data;

				if (data.data && data.data.images && data.data.images[0]) {
					this.dataSource.data[index].image = data.data.images[0];
				}
				this.alert = new Alert("Categoria alterado com sucesso!", "success");

				this.dataSource._updateChangeSubscription();
				this.changeDetectorRefs.detectChanges();
				this.formData.reset();
				this.modalService.dismissAll();
				this.getListCategory(0, this.pageSize);
			},
			(error) => {
				this.alert = new Alert("Falha ao alterar Categoria!", "danger");
				this.modalService.dismissAll();
			}
		);
	}

	displayFnSegment(segment: SegmentModel) {
		if (segment) {
			return segment.name;
		}
	}

	async confirmDeleteModalShow(content, category) {
		this.categoryIdToDelete = category._id;
		this.modalService
			.open(content, { ariaLabelledBy: "modal-delete-category", size: "sm" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async deleteCategory() {
		if (!this.categoryIdToDelete) {
			this.alert = new Alert("Falha ao deletar categoria!", "danger");
			return;
		}
		await this.categoryService
			.deleteCategory(this.categoryIdToDelete)
			.toPromise();
		this.alert = new Alert("Categoria deletado com sucesso!", "success");
		this.categoryIdToDelete = undefined;
		await this.getListCategory(0, this.pageSize);
	}


	closeAlert() {
		this.alert = null;
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

}
