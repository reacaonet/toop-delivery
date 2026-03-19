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
import { startWith, debounceTime, switchMap } from "rxjs/operators";

import { Franchise } from "./../../../../../models/franchise";
import { SliderService } from "../../../../services/mobility/slider.service";
import { Slider } from "../../../../../models/mobility/slider";
import { FranchiseService } from "./../../../../services/franchise.service";
import { checkObjectIdisValid } from "./../../../../util";

@Component({
	selector: "kt-slider",
	templateUrl: "./slider.component.html",
	styleUrls: ["./slider.component.scss"],
})
export class SliderComponent implements OnInit, AfterViewInit {
	idToDelete; // Save id to delete
	dataSource;
	displayedColumns = [
		"image",
		"name",
		"franchise",
		"impressions",
		"status",
		"actions",
	];
	files: Set<File>;
	formData;
	formFilter: FormGroup;
	formSubmitSlider = false;
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	typeAction = "create";
	isRoot: boolean = false;
	currentFranchise: string = "";
	franchises: Franchise[] = [];

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private sliderService: SliderService,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private franchiseService: FranchiseService
	) {}

	async ngOnInit() {
		this.checkIsRoot();
		this.getList(0, this.pageSize);
	}

	FormDataSlider() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),
				file: new FormControl(undefined, [Validators.required]),
				name: new FormControl(undefined, [Validators.required]),
				impressions: new FormControl(undefined, [Validators.required]),
				destinationurl: new FormControl(undefined, [Validators.required]),
				franchise: new FormControl(undefined, [checkObjectIdisValid]),
				status: new FormControl(true),
				target: new FormControl("driver"),
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
				.subscribe((results) => (this.franchises = results));
			resolve(true);
		});
	}

	async getFranchises(userId: string = "") {
		if (!userId) {
			await this.franchiseService.getfranchises().subscribe((data: any) => {
				this.franchises = data;
				this.changeDetectorRefs.detectChanges();
			});
		} else {
			await this.franchiseService.getByUser(userId).subscribe((data: any) => {
				this.franchises = data;
				this.changeDetectorRefs.detectChanges();
			});
		}
	}

	async upsertModalShow(content, slider: Slider, type = "create") {
		this.typeAction = type;
		this.formSubmitSlider = false;
		await this.FormDataSlider();

		if (this.typeAction === "edit") {
			// Alter file permissions
			this.formData.get("file").clearValidators();
			this.formData.get("file").updateValueAndValidity();
		}

		if (slider) {
			this.formData.patchValue({
				_id: slider._id,
				file: "",
				name: slider.name,
				impressions: slider.impressions,
				destinationurl: slider.destinationurl,
				franchise: slider.franchise,
				status: slider.status,
				// target: slider.target,
			});
		}
		this.modalService
			.open(content, { ariaLabelledBy: "modal-edit-slider", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	displayFnFranchise(franchise) {
		if (franchise) {
			return franchise.name;
		}
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getList(event.pageIndex, event.pageSize);
	}

	async getList(pageIn, pageOut) {
		const self = this;
		const ELEMENT_DATA = [];

		await this.sliderService
			.getPaginator(pageIn, pageOut, undefined)
			.subscribe((data: any) => {
				if (data.list && Array.isArray(data.list)) {
					data.list.forEach((data, index) => {
						ELEMENT_DATA.push({
							position: index + 1,
							_id: data._id,
							name: data.name,
							image: data.image && data.image[0] ? data.image[0] : undefined,
							impressions: data.impressions,
							destinationurl: data.destinationurl,
							franchise: data.franchise,
							status: data.status,
							// target: data.target,
						});
					});
					self.dataSource = new MatTableDataSource(ELEMENT_DATA);
					self.totalLength = data.total;
					this.changeDetectorRefs.detectChanges();
				}
			});
	}

	async upsert(slider: Slider) {
		if (this.typeAction === "create") {
			if (this.isRoot) {
				slider.franchise = slider.franchise?._id;
			} else {
				slider.franchise = this.currentFranchise;
			}

			this.sliderService.create(slider).subscribe(
				async (_: any) => {
					this.getList(0, this.pageSize);
					this.changeDetectorRefs.detectChanges();

					this.toastr.success("Slider atualizado com sucesso!", "Sucesso!");
					this.modalService.dismissAll();
				},
				(error) => {
					if (error?.error?.code && error?.error?.message) {
						this.toastr.error(error?.error?.message, "Falha!");
					} else {
						this.toastr.error("Erro ao criar Slider!", "Falha!");
					}
				}
			);
		} else {
			this.sliderService.update(slider).subscribe(
				async (_: any) => {
					await this.getList(0, this.pageSize);
					this.toastr.success("Slider alterado com sucesso!", "Sucesso!");
					this.modalService.dismissAll();
				},
				(error) => {
					console.error(error);
					this.toastr.error("Erro ao alterar slider!", "Falha!");
				}
			);
		}
	}

	async confirmDeleteModalShow(content, data) {
		this.idToDelete = data._id;
		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-delete-slider",
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
		await this.sliderService.delete(this.idToDelete).toPromise();
		// sucesso ao excluir tela
		this.toastr.success("Registro deletado com sucesso!", "Sucesso!");
		// trata o id pra indefinido
		this.idToDelete = undefined;
		// att a tela
		await this.getList(0, this.pageSize);
	}

	async deleteSlider() {
		if (!this.idToDelete) {
			this.toastr.error("Erro ao deletar slider!", "Falha!");
			return;
		}
		await this.sliderService.delete(this.idToDelete).toPromise();
		this.toastr.success("Slider  deletado com sucesso!", "Sucesso!");
		this.idToDelete = undefined;
		await this.getList(0, this.pageSize);
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
				 //const [file] = event.target.files;
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

	checkIsRoot() {
		const user = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;

		this.isRoot = user?.isRoot;
		this.currentFranchise = user?.franchise ?? "";
	}
}
