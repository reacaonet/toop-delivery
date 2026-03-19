import { Component, OnInit, AfterViewInit, ChangeDetectorRef, Inject } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { startWith, debounceTime, switchMap } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import geocoder from "google-geocoder";

import { City } from "./../../../../../models/city";
import { CityService } from "./../../../../services/city.service";
import { State } from "./../../../../../models/state";
import { StateService } from "./../../../../services/state.service";

import { environment } from "../../../../../environments/environment";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { DataService } from "../../../../services/data.service";

@Component({
	selector: "kt-city",
	templateUrl: "./city.component.html",
	styleUrls: ["./city.component.scss"],
})
export class CityComponent implements OnInit, AfterViewInit {
	state: State[] = [];
	stateValue: string;
	dataSource;
	cityIdToDelete;
	displayedColumns = ["name", "state", "delete"];
	public formData;
	formSubmitAttempt = false;
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	typeAction = "create";
	dialogRef: MatDialogRef<any>;

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private cityService: CityService,
		private modalService: NgbModal,
		private toastr: ToastrService,
		public dialog: MatDialog,
		private stateService: StateService,
		private dataService: DataService
	) {}

	ngOnInit() {
		this.getListCity(0, this.pageSize, undefined);
	}

	newFormData() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),
				name: new FormControl(undefined, [Validators.required]),
				state: new FormControl(undefined, [Validators.required]),
				latitude: new FormControl(undefined, [Validators.required]),
				longitude: new FormControl(undefined, [Validators.required]),
			});

			this.formData
				.get("state")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) =>
						typeof value === "string" && value.length ? this.stateService.getStatesNome(value) : []
					)
				)
				.subscribe((results) => {
					if (results && Array.isArray(results)) {
						this.state = results;
					} else {
						this.state = [];
					}

					this.dataService.updateData(this.state);
				});
			resolve(true);
		});
	}

	displayFn(state: State) {
		if (state) {
			return state.name;
		}
	}

	async getListCity(pageIn, pageOut, name) {
		const self = this;
		let ELEMENT_DATA = [];

		this.cityService.getPaginator(pageIn, pageOut, name).subscribe((data: any) => {
			self.dataSource = new MatTableDataSource(ELEMENT_DATA);
			if (data.list && Array.isArray(data.list)) {
				data.list.forEach((city, index) => {
					ELEMENT_DATA.push({
						_id: city._id,
						position: index + 1,
						name: city.name,
						state: city.state ? city.state : "-",
						latitude: city.latitude ?? "",
						longitude: city.longitude ?? "",
					});
				});
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				self.totalLength = data.total;
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getListCity(event.pageIndex, event.pageSize, undefined);
	}

	async upSertCityModalShow(content, city: City, type = "create") {
		this.typeAction = type;
		this.formSubmitAttempt = false;
		await this.newFormData();
		this.formData.reset();

		if (city) {
			this.formData.reset();
			this.formData.patchValue({
				_id: city._id,
				name: city.name,
				state: city.state,
				latitude: city.latitude ?? "",
				longitude: city.longitude ?? "",
			});
		}

		this.dialogRef = this.dialog.open(EditClientDialog, {
			width: "600px",
			data: {
				formData: this.formData,
				formSubmitAttempt: this.formSubmitAttempt,
				getCoordinates: this.getCoordinates,
				state: this.state,
				displayFn: this.displayFn,
			},
		});

		this.dialogRef.afterClosed().subscribe((result: any) => {
			if (result?.type === "add" && result?.form) {
				this.upsertCity(result?.form);
			}
		});
	}

	async upsertCity(city: City) {
		if (this.typeAction === "create") {
			this.cityService.createCity(city).subscribe(
				(data: any) => {
					this.toastr.success("Cidade atualizada com sucesso!", "Sucesso!");
					this.getListCity(0, this.pageSize, undefined);
					this.modalService.dismissAll();
				},
				(error) => {
					this.toastr.error("Falha ao criar Cidade!", "Falha!");
				}
			);
		} else {
			this.cityService.updateCity(city).subscribe(
				(data: any) => {
					this.getListCity(0, this.pageSize, undefined);
					this.toastr.success("Cidade atualizada com sucesso!", "Sucesso!");
					this.modalService.dismissAll();
				},
				(error) => {
					console.error(error);
					this.toastr.error("Falha ao alterar Cidade!", "Falha!");
				}
			);
		}
	}

	async confirmDeleteModalShow(content, city) {
		this.cityIdToDelete = city._id;
		this.modalService
			.open(content, { ariaLabelledBy: "modal-delete-city", size: "sm" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async deleteCity() {
		if (!this.cityIdToDelete) {
			this.toastr.error("Falha ao deletar Cidade!", "Falha!");
			return;
		}
		await this.cityService.deleteCity(this.cityIdToDelete).toPromise();
		this.toastr.success("Cidade deletada com sucesso!", "Sucesso!");
		this.cityIdToDelete = undefined;
		await this.getListCity(0, this.pageSize, undefined);
	}

	async getCoordinates() {
		const city = this.formData.get("name").value;
		const state = this.formData.get("state").value?.name ?? "";

		if (city && state) {
			var geo = geocoder({
				key: environment.GOOGLE_MAPS,
			});

			return await geo.find(`${city} - ${state}`, (err, data) => {
				if (data && data.length > 0) {
					const coordinates = data[0].location;

					if (coordinates.lat && coordinates.lng) {
						this.formData.get("latitude").setValue(coordinates.lat);
						this.formData.get("longitude").setValue(coordinates.lng);
					}
				}
			});
		}
	}

	ngAfterViewInit() {}
}

@Component({
	selector: "edit-city-dialog",
	templateUrl: "edit-city-dialog.html",
})
export class EditClientDialog {
	state: State[] = [];

	constructor(
		public dialogRef: MatDialogRef<EditClientDialog>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private dataService: DataService
	) {}

	ngOnInit() {
		this.dataService.getDataChanged().subscribe((resp) => {
			if (resp && Array.isArray(resp)) {
				this.state = resp;
			} else {
				this.state = [];
			}
		});
	}

	onNoClick(): void {
		this.dialogRef.close();
	}

	onSucess(value: any): void {
		let payload = {
			type: "add",
			form: value?.formData?.value,
		};

		this.dialogRef.close(payload);
	}
}
