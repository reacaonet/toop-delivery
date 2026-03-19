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
import { startWith, debounceTime, switchMap, filter } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";

import { Franchise } from "../../../../../models/franchise";
import { Service } from "../../../../../models/mobility/service";
import { ServiceService } from "../../../../services/mobility/service.service";
import { FranchiseService } from "../../../../services/franchise.service";
import { checkObjectIdisValid } from "../../../../util";

@Component({
	selector: "kt-service",
	templateUrl: "./service.component.html",
	styleUrls: ["./service.component.scss"],
})
export class ServiceComponent implements OnInit, AfterViewInit {
	listFranchise: Franchise[] = [];
	box = "";
	boxNome = "";
	idToDelete; // Save id to delete
	dataSource;
	displayedColumns = [
		"image",
		"maker",
		"franchise",
		"name",
		"capacity",
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
	Filter: any;
	filter: any;

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private serviceService: ServiceService,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private franchiseService: FranchiseService
	) {}

	async ngOnInit() {
		await this.addFormFilter();
		await this.getList(
			0,
			this.pageSize,
			this.formFilter.controls.name.value,
			this.formFilter.controls.franchise.value
		);
	}

	async addFormFilter() {
		return new Promise(async (resolve, reject) => {
			// Criando os campos do formulário
			this.formFilter = new FormGroup({
				name: new FormControl(undefined, []),
				franchise: new FormControl(undefined, [checkObjectIdisValid]),
			});

			this.formFilter
				.get("name")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) =>
						typeof value === "string" && value.length > 0
							? this.getList(
									0,
									this.pageSize,
									value,
									this.formFilter.controls.franchise.value
							  )
							: []
					)
				)
				.subscribe((results) => {
					this.changeDetectorRefs.detectChanges();
				});

			this.formFilter
				.get("franchise")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(700),
					switchMap((value) =>
						typeof value === "string" && value.length > 0
							? this.franchiseService.getFranchisesNome(value)
							: []
					)
				)
				.subscribe((results: Franchise[]) => {
					this.listFranchise = results;
					this.changeDetectorRefs.detectChanges();
				});

			return resolve(true);
		});
	}

	async onClickFranchiseFilter(franchise) {
		await this.getList(
			0,
			this.pageSize,
			this.formFilter.controls.name.value,
			franchise._id
		);
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getList(
			event.pageIndex,
			event.pageSize,
			this.formFilter.controls.name.value,
			this.formFilter.controls.franchise.value
		);
	}

	async getList(pageIn, pageOut, name, franchise) {
		const self = this;
		const ELEMENT_DATA = [];

		await this.serviceService
			.getPaginator(pageIn, pageOut, name, franchise)
			.subscribe((data: any) => {
				if (data.list && Array.isArray(data.list)) {
					data.list.forEach((data, index) => {
						ELEMENT_DATA.push({
							_id: data._id,
							position: index + 1,
							image: data.images.length > 0 ? data.images[0] : null,
							maker: data.makers.length > 0 ? data.makers[0] : null,
							franchise:
								data.franchise && data.franchise.name
									? data.franchise.name
									: "",
							name: data.name,
							capacity: data.capacity,
							// priceCalculation: data.priceCalculation.name,
							status: data.status,
						});
					});
					self.dataSource = new MatTableDataSource(ELEMENT_DATA);
					self.totalLength = data.total;
					this.changeDetectorRefs.detectChanges();
				}
			});
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
			this.toastr.error("Falha ao deletar Registro!", "Falha!");
			return;
		}
		// delete
		await this.serviceService.delete(this.idToDelete).toPromise();
		// sucesso ao excluir tela
		this.toastr.success("Registro deletado com sucesso!", "Sucesso!");
		// trata o id pra indefinido
		this.idToDelete = undefined;
		// att a tela
		await this.getList(
			0,
			this.pageSize,
			this.formFilter.controls.name.value,
			this.formFilter.controls.franchise.value
		);
	}

	ngAfterViewInit() {}

	// --> obtem o status do registro
	getStatusColor(status) {
		if (status === true) {
			return "bg-success";
		} else {
			return "bg-warning";
		}
	}

	displayFn(data: any) {
		if (data) {
			return data.name;
		}
	}
	// --> obtem a cor da linha do registro
	getPositionColor(position) {
		if (position % 2 !== 0) {
			return "bg-secondary";
		}
	}
}
