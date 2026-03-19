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
import moment from "moment";

import { Alert } from "./../../../../../models/alert";
import { Person } from "./../../../../../models/person";
import { Franchise } from "./../../../../../models/franchise";
import { EvaluationService } from "./../../../../services/mobility/evaluation.service";

import { Passenger } from "./../../../../../models/mobility/passenger";
import { Company } from "../../../../core/auth";
import { User } from "./../../../../../models/user";
import { checkObjectIdisValid } from "../../../../util";

@Component({
	selector: "kt-passenger",
	templateUrl: "./evaluation-passenger.component.html",
	styleUrls: ["./evaluation-passenger.component.scss"],
})
export class EvaluationPassengerComponent implements OnInit, AfterViewInit {
	alert: Alert = undefined;
	person: Person[] = [];
	selectedPerson: Person;
	personValue: string;
	dataSource;
	displayedColumns = [
		"passenger",
		"driver",
		"stars",
		"description",
		"createdAt",
		"action",
	];
	formData;
	formFilter: FormGroup;
	formSubmit = false;
	myControl: FormControl = new FormControl();
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	idToDelete;
	isAdmin = false;
	userCompany: Company;
	userData: User;
	franchises: Franchise[] = [];

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private evaluationService: EvaluationService
	) { }

	ngOnInit() {
		this.getList(1, this.pageSize);

		this.newForm();
	}

	newFilter() { }

	newForm() {
		this.formData = new FormGroup({
			_id: new FormControl(""),
			person: new FormControl("", [Validators.required, checkObjectIdisValid]),
			franchise: new FormControl("", [Validators.required]),
			status: new FormControl(""),
		});
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getList(event.pageIndex + 1, event.pageSize);
	}

	async getList(pageIn, pageOut) {
		const self = this;
		const ELEMENT_DATA = [];

		this.evaluationService
			.evaluationPassengerPaginator(pageIn, pageOut)
			.subscribe((data: any) => {
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				if (data.list && Array.isArray(data.list)) {
					data.list.forEach((item, index) => {
						ELEMENT_DATA.push({
							_id: item._id,
							position: index + 1,
							passenger: item.passenger,
							driver: item.driver,
							stars: item.stars ? parseInt(item.stars) : 1,
							description: item.description,
							createdAt: moment(item.createdAt)
								.utc(true)
								.format("DD/MM/YYYY HH:mm"),
						});
					});
					self.dataSource = new MatTableDataSource(ELEMENT_DATA);
					self.totalLength = data.total;
					this.changeDetectorRefs.detectChanges();
				}
			});
	}

	async editModalShow(content, data: Passenger) {
		this.formSubmit = false;
		this.newForm();

		this.formData.patchValue({
			_id: data._id,
			person: data.person,
			cpf: data.person?.cpf ? data.person?.cpf : "",
			phone: data.person?.phone ? data.person?.phone : "",
			email: data.person?.email ? data.person?.email : "",
			franchise: data.franchise?._id,
			status: data.status,
		});
		this.selectedPerson = data.person;

		this.myControl = new FormControl(data.person.name);
		this.modalService
			.open(content, { ariaLabelledBy: "modal-edit-data", size: "lg" })
			.result.then(
				(result) => { },
				(reason) => { }
			);
	}

	closeAlert() {
		this.alert = null;
	}

	ngAfterViewInit() { }
}
