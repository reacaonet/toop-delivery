import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import {
	startWith,
	debounceTime,
	switchMap,
	distinctUntilChanged,
} from "rxjs/operators";
import { ToastrService } from "ngx-toastr";

import { Alert } from "./../../../../../models/alert";
import { CostCenters } from "./../../../../../models/finance/CostCenters";
import { CostCentersService } from "./../../../../services/finance/costCenters";

@Component({
	selector: "kt-cost-centers",
	templateUrl: "./cost-centers.component.html",
	styleUrls: ["./cost-centers.component.scss"],
})
export class CostCentersComponent implements OnInit, AfterViewInit {
	alert: Alert = undefined;
	dataSource;
	displayedColumns = ["name", "status", "delete"];
	files: Set<File>;
	formData;
	formSubmitCostCenters = false;
	myControl: FormControl = new FormControl();
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	typeAction = "create";
	costCentersIdToDelete;

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private costCentersService: CostCentersService
	) {}

	ngOnInit() {
		this.newForm();
		this.getList(0, this.pageSize);
	}

	newForm() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(""),
				name: new FormControl("", [Validators.required]),
				status: new FormControl(""),
			});
			return resolve(true);
		});
	}

	changePage(event) {
		console.log(event);
		this.pageSize = event.pageSize;
		this.getList(event.pageIndex, event.pageSize);
	}

	async getList(pageIn, pageOut) {
		const self = this;
		const ELEMENT_DATA = [];

		this.costCentersService
			.getPaginator(pageIn, pageOut, "")
			.subscribe((data: any) => {
				if (data.list && Array.isArray(data.list)) {
					data.list.forEach((costCenters, index) => {
						ELEMENT_DATA.push({
							_id: costCenters._id,
							position: index + 1,
							name: costCenters.name,
							status: costCenters.status,
						});
					});
					self.dataSource = new MatTableDataSource(ELEMENT_DATA);
					self.totalLength = data.total;
					this.changeDetectorRefs.detectChanges();
				}
			});
	}

	async upSertCostCentersModalShow(
		content,
		costCenters: CostCenters,
		type = "create"
	) {
		this.typeAction = type;
		this.formSubmitCostCenters = false;
		await this.newForm();

		// Only edit
		if (costCenters) {
			this.formData.patchValue({
				_id: costCenters._id,
				name: costCenters.name,
				status: costCenters.status,
			});
		}

		this.modalService
			.open(content, { ariaLabelledBy: "modal-edit-costCenters", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async upSertCostCenters(costCenters: CostCenters) {
		if (this.typeAction === "create") {
			this.costCentersService.create(costCenters).subscribe(
				async (_: any) => {
					await this.getList(0, this.pageSize);
					this.changeDetectorRefs.detectChanges();
					this.toastr.success(
						"Centro de custo atualizado com sucesso!",
						"Sucesso!"
					);
					this.modalService.dismissAll();
				},
				(error) => {
					this.toastr.error("Erro ao criar Centro de custo!", "Falha!");
					this.modalService.dismissAll();
				}
			);
		} else {
			// if (data.data && data.data.images && data.data.images[0]) {
			//   this.dataSource.data[index].image = data.data.images[0];
			// }

			this.costCentersService.update(costCenters).subscribe(
				async (_: any) => {
					await this.getList(0, this.pageSize);
					this.toastr.success(
						"Centro de custo alterado com sucesso!",
						"Sucesso!"
					);
					this.modalService.dismissAll();
				},
				(error) => {
					console.error(error);
					this.toastr.error("Erro ao alterar Centro de custo!", "Falha!");
					this.modalService.dismissAll();
				}
			);
		}
	}

	async confirmDeleteModalShow(content, costCenters) {
		this.costCentersIdToDelete = costCenters._id;
		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-delete-costCenters",
				size: "sm",
			})
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async deleteCostCenters() {
		if (!this.costCentersIdToDelete) {
			this.toastr.error("Erro ao deletar centro de custo!", "Falha!");
			return;
		}
		await this.costCentersService
			.delete(this.costCentersIdToDelete)
			.toPromise();
		this.toastr.success("Centro de custo deletado com sucesso!", "Sucesso!");
		this.costCentersIdToDelete = undefined;
		await this.getList(0, this.pageSize);
	}

	closeAlert() {
		this.alert = null;
	}

	ngAfterViewInit() {}

	onChange(event) {
		console.log(event);
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
