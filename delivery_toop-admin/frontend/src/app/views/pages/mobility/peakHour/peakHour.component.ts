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
import { TranslateService } from "@ngx-translate/core";

import { ToastrService } from "ngx-toastr";

import { PeakHour } from "../../../../../models/mobility/peakHour";
import { PeakHourService } from "../../../../services/mobility/peakHour.service";
import { FranchiseService } from "../../../../services/franchise.service";
import { checkObjectIdisValid } from "../../../../util";

@Component({
	selector: "kt-peakHour",
	templateUrl: "./peakHour.component.html",
	styleUrls: ["./peakHour.component.scss"],
})
export class PeakHourComponent implements OnInit, AfterViewInit {
	box = "";
	boxNome = "";
	idToDelete; // Save id to delete
	dataSource;
	displayedColumns = ["franchise", "start", "end", "delete"];
	files: Set<File>;
	formData;
	formFilter: FormGroup;
	formSubmitAttempt = false;
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	isRoot: boolean = false;
	currentFranchise: string = "";
	typeAction = "create";

	visible = true;
	selectable = true;
	removable = true;
	addOnBlur = true;

	franchises = [];

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private peakHourService: PeakHourService,
		private franchiseService: FranchiseService,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private translate: TranslateService
	) {}

	async ngOnInit() {
		this.checkIsRoot();
		await this.getList(0, this.pageSize, undefined);
	}

	// --< carrega as franquias >-- //
	async loadFranchises() {
		await this.franchiseService.getfranchises().subscribe((data: any) => {
			if (data && Array.isArray(data)) {
				data.forEach((data, index) => {
					this.franchises.push({ _id: data._id, name: data.name });
				});
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	async newFormData() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),

				start: new FormControl("", [Validators.required]),
				end: new FormControl("", [Validators.required]),
				franchise: new FormControl("", [checkObjectIdisValid]),
				status: new FormControl(""),
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
			return resolve(true);
		});
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getList(event.pageIndex, event.pageSize, undefined);
	}

	async getList(pageIn, pageOut, franchiseId) {
		const self = this;
		const ELEMENT_DATA = [];

		await this.peakHourService
			.getPaginator(pageIn, pageOut)
			.subscribe((data: any) => {
				if (data.list && Array.isArray(data.list)) {
					data.list.forEach((data, index) => {
						ELEMENT_DATA.push({
							_id: data._id,
							position: index + 1,
							start: data.start,
							end: data.end,
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

	async upsertModalShow(content, peakHour: PeakHour, type = "create") {
		this.typeAction = type;
		this.formSubmitAttempt = false;
		await this.newFormData();

		if (peakHour) {
			this.formData.patchValue({
				_id: peakHour._id,
				start: peakHour.start,
				end: peakHour.end,
				franchise: peakHour.franchise,
				status: peakHour.status,
			});
		}

		this.changeDetectorRefs.detectChanges();
		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-edit-peakHour",
				size: "lg",
				backdrop: "static",
			})
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async upsert(data: PeakHour) {
		if (!this.isRoot) {
			data.franchise = this.currentFranchise;
		}

		if (!data.franchise) {
			this.toastr.error(
				this.translate.instant("GLOBAL.LABEL.SELECTAFRANCHISE")
			);
			return;
		}

		if (this.typeAction === "create") {
			this.peakHourService.create(data).subscribe(async (data: any) => {
				await this.getList(0, this.pageSize, undefined);
				this.modalService.dismissAll("");
				this.toastr.success(
					this.translate.instant("GLOBAL.LABEL.CREATEDNEWRECORD")
				);
				this.changeDetectorRefs.detectChanges();
			});
		} else {
			this.peakHourService.update(data).subscribe(
				async (data: any) => {
					await this.getList(0, this.pageSize, undefined);
					this.toastr.success(
						this.translate.instant("GLOBAL.LABEL.SUCCESSFULLYCHANGED")
					);
					this.modalService.dismissAll();
					this.changeDetectorRefs.detectChanges();
				},
				async (error) => {
					// let messageError = "Falha ao criar Franquia!";
					// if (error?.error?.message) {
					// 	messageError = error?.error?.message;

					// }
					this.toastr.error(this.translate.instant("GLOBAL.LABEL.ERRORCREATE"));
					this.modalService.dismissAll();
					this.changeDetectorRefs.detectChanges();
				}
			);
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
			this.toastr.error(
				this.translate.instant("GLOBAL.LABEL.FAILEDTOREMOVETICKET")
			);
			return;
		}
		// delete
		await this.peakHourService.delete(this.idToDelete).toPromise();
		// sucesso ao excluir tela
		this.toastr.success(
			this.translate.instant("GLOBAL.LABEL.SUCCESSFULLYDELETED")
		);
		// trata o id pra indefinido
		this.idToDelete = undefined;
		// att a tela
		await this.getList(0, this.pageSize, undefined);
	}

	displayFnFranchise(franchise) {
		if (franchise) {
			return franchise.name;
		}
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

	checkIsRoot() {
		const user = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;

		this.isRoot = user?.isRoot;
		this.currentFranchise = user?.franchise ?? "";
	}
}
