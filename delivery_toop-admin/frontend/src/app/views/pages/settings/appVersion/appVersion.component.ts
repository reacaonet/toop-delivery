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
import { AppVersionService } from "./../../../../services/appVersion.service";

@Component({
	selector: "kt-appVersion",
	templateUrl: "./appVersion.component.html",
	styleUrls: ["./appVersion.component.scss"],
})
export class AppVersionComponent implements OnInit, AfterViewInit {
	alert: Alert = undefined;
	stateValue: string;
	dataSource;
	cityIdToDelete;
	displayedColumns = ["name", "version", "platform"];
	formData;
	formSubmitAttempt = false;
	myControl: FormControl = new FormControl();

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private appVersionService: AppVersionService,
		private modalService: NgbModal
	) {}

	ngOnInit() {
		this.getList();

		this.formData = new FormGroup({
			_id: new FormControl(""),
			name: new FormControl("", [Validators.required]),
			version: new FormControl("", [Validators.required]),
			platform: new FormControl("", [Validators.required]),
		});
	}

	async getList() {
		const self = this;
		let ELEMENT_DATA = [];

		this.appVersionService.getVersion().subscribe((data: any) => {
			self.dataSource = new MatTableDataSource(ELEMENT_DATA);
			if (data && Array.isArray(data)) {
				data.forEach((version, index) => {
					ELEMENT_DATA.push({
						_id: version._id,
						position: index + 1,
						name: version.name,
						version: version.version,
						platform: version.platform,
					});
				});
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	createVersionModalShow(content) {
		this.formData.reset();
		this.myControl = new FormControl();
		this.modalService
			.open(content, { ariaLabelledBy: "modal-create-version", size: "md" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async createVersion(data: any) {
		this.appVersionService.createVersion(data).subscribe(
			(data: any) => {
				this.alert = new Alert("Versão criada com sucesso!", "success");

				this.getList();

				this.dataSource._updateChangeSubscription();
				this.changeDetectorRefs.detectChanges();
			},
			(error) => {
				this.alert = new Alert("Falha ao criar Cidade!", "danger");
			}
		);
	}

	closeAlert() {
		this.alert = null;
	}

	ngAfterViewInit() {}
}
