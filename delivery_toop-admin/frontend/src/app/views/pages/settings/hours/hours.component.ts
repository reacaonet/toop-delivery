import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import {
	FormGroup,
	FormControl,
	FormBuilder,
	FormArray,
	Validators,
} from "@angular/forms";
import moment from "moment";
import { ToastrService } from "ngx-toastr";

import { Alert } from "./../../../../../models/alert";
import { AlertModal } from "./../../../../../models/alertModal";
import { Company } from "./../../../../../models/company/company";
import { CompanyService } from "./../../../../services/company.service";
import { Hours } from "./../../../../../models/hours";
import { HoursService } from "./../../../../services/hours.service";

@Component({
	selector: "kt-hours",
	templateUrl: "./hours.component.html",
	styleUrls: ["./hours.component.scss"],
})
export class HoursComponent implements OnInit, AfterViewInit {
	alert: Alert = undefined;
	alertModal: AlertModal = undefined;
	companies: Company;
	formData;
	formDataDay;
	formDataHour;
	displayedColumns = [
		"company",
		"StartHours",
		"StopHours",
		"DayWeek",
		"Actions",
	];
	formSubmitAttempt = false;
	formSubmitDay = false;
	dataSource = new MatTableDataSource([]);
	scheduleIdToDelete;

	scheduleDaysByCompany = [];

	user = {
		days: [
			{ name: "DOM", selected: false, id: "SUNDAY", index: 0 },
			{ name: "SEG", selected: false, id: "MONDAY", index: 1 },
			{ name: "TER", selected: false, id: "TUESDAY", index: 2 },
			{ name: "QUA", selected: false, id: "WEDNESDAY", index: 3 },
			{ name: "QUI", selected: false, id: "THURSDAY", index: 4 },
			{ name: "SEX", selected: false, id: "FRIDAY", index: 5 },
			{ name: "SAB", selected: false, id: "SATURDAY", index: 6 },
		],
	};

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private companyService: CompanyService,
		private fb: FormBuilder,
		private hoursService: HoursService
	) {}

	ngOnInit() {
		this.getListSchedule();
	}

	async getListSchedule() {
		const { _id } = JSON.parse(localStorage.getItem("@company-main") ?? "{}");
		const self = this;
		let ELEMENT_DATA = [];
		let openingHours;
		let closingHours;

		this.hoursService.showHours(_id).subscribe((data: any) => {
			self.dataSource = new MatTableDataSource(ELEMENT_DATA);
			if (data && Array.isArray(data.data)) {
				data.data.forEach((hours, index) => {
					if (hours.openingHours >= 0 && hours.openingHours <= 9) {
						openingHours = `00:0${hours.openingHours}`;
					} else if (hours.openingHours > 9 && hours.openingHours <= 59) {
						openingHours = `00:${hours.openingHours}`;
					} else {
						openingHours = moment(hours.openingHours, "Hmm").format("HH:mm");
					}

					if (hours.closingHours >= 0 && hours.closingHours <= 9) {
						closingHours = `00:0${hours.closingHours}`;
					} else if (hours.closingHours > 9 && hours.closingHours <= 59) {
						closingHours = `00:${hours.closingHours}`;
					} else {
						closingHours = moment(hours.closingHours, "Hmm").format("HH:mm");
					}

					ELEMENT_DATA.push({
						_id: hours._id,
						position: index + 1,
						openingHours,
						closingHours,
						dayWeek: hours.dayWeek,
						company: hours.company?.name,
					});
				});
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	createNewForm() {
		return new Promise(async (resolve, reject) => {
			const { _id = null, name } = JSON.parse(
				localStorage.getItem("@company-main")
			);

			this.formDataDay = new FormGroup({
				_id: new FormControl(_id),
				dayWeek: this.buildSkills(),
				hours: new FormArray([]),
			});

			// const data = await this.companyService.getCompaniesNome(name).toPromise();
			// if (data) {
			// 	this.formDataDay = new FormGroup({
			// 		_id: new FormControl(_id),
			// 		dayWeek: this.buildSkills(),
			// 		hours: new FormArray([]),
			// 	});
			// }
			resolve(true);
		});
	}

	addHourForm() {
		this.formDataHour = new FormGroup({
			openingHours: new FormControl("", [Validators.required]),
			closingHours: new FormControl("", [Validators.required]),
		});
		this.formDataDay.get("hours").push(this.formDataHour);
	}

	buildSkills() {
		const arr = this.user.days.map((day) => {
			return this.fb.control("");
		});
		return this.fb.array(arr);
	}

	displayFn(hours: Hours) {
		if (hours) {
			return hours.openingHours;
		}
	}

	async getToView(content, hours) {
		this.scheduleDaysByCompany = [];
		this.modalService
			.open(content, { ariaLabelledBy: "modal-viewschedule" })
			.result.then(
				(result) => {},
				(reason) => {}
			);

		// hours.map(async (day, index) => {
		let countIndex = 0;
		for await (const day of hours) {
			const daysWeek = Object.keys(day);
			const hoursWeek: any = Object.values(day);
			const dayAtual = daysWeek[countIndex];

			if (!hoursWeek[countIndex]) {
				continue;
			}

			for await (const hour of hoursWeek[countIndex]) {
				this.scheduleDaysByCompany.push({
					week: dayAtual,
					start: moment(hour.start, "Hmm").format("HH:mm"),
					end: moment(hour.end, "Hmm").format("HH:mm"),
				});
			}
			countIndex++;
		}
	}

	async createScheduleModalShow(content) {
		this.formSubmitDay = false;
		await this.createNewForm();
		this.modalService
			.open(content, { ariaLabelledBy: "modal-create-schedule", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async ValidatorsHours(hours: Hours) {
		return new Promise(async (resolve) => {
			if (hours && hours.hours && Array.isArray(hours.hours)) {
				for await (const hourItem of hours.hours) {
					const closingHoursAtual = Number(
						moment(hourItem.closingHours, "HHmm")
					);
					const openingHoursAtual = Number(
						moment(hourItem.openingHours, "HHmm")
					);

					const message = `Horário inicial ${moment(
						hourItem.openingHours,
						"HHmm"
					).format("HH:mm")} deve ser menor à horário final: ${moment(
						hourItem.closingHours,
						"HHmm"
					).format("HH:mm")}`;

					if (openingHoursAtual > closingHoursAtual) {
						this.alertModal = new AlertModal(message, "danger");
						resolve(false);
						return;
					}
				}
			}
			resolve(true);
		});
	}

	async createSchedule(hours: Hours) {
		const validHours = await this.ValidatorsHours(hours);

		if (!validHours) {
			return;
		}

		if (hours && hours.dayWeek && Array.isArray(hours.dayWeek)) {
			let countDay = 0;
			const company = hours._id;
			for await (const day of hours.dayWeek) {
				if (day) {
					if (hours && hours.hours && Array.isArray(hours.hours)) {
						for await (const hour of hours.hours) {
							if (hour && hour.openingHours && hour.closingHours) {
								const closingHours = Number(
									moment(hour.closingHours, "HH:mm").format("Hmm")
								);
								const openingHours = Number(
									moment(hour.openingHours, "HH:mm").format("Hmm")
								);

								const payload = {
									company,
									openingHours,
									closingHours,
									dayWeek: this.user.days[countDay].id,
								};
								await this.hoursService.createHours(payload).toPromise();
							}
						}
					}
				}
				countDay++;
			}

			this.toastr.success("Schedule criado com sucesso!", "Sucesso!");
			this.modalService.dismissAll("");
			this.getListSchedule();
		}
	}

	async confirmDeleteModalShow(content, schedule) {
		this.scheduleIdToDelete = schedule._id;
		this.modalService
			.open(content, { ariaLabelledBy: "modal-delete-schedule", size: "sm" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async deleteSchedule() {
		if (!this.scheduleIdToDelete) {
			this.toastr.error("Erro ao deletar Schedule!", "Falha!");
			return;
		}
		await this.hoursService.deleteHours(this.scheduleIdToDelete).toPromise();
		this.toastr.success("Schedule deletado com sucesso!", "Sucesso!");
		this.scheduleIdToDelete = undefined;
		await this.getListSchedule();
	}

	closeAlert() {
		this.alert = null;
	}

	closeAlertModal() {
		this.alertModal = null;
	}

	ngAfterViewInit() {}
}
