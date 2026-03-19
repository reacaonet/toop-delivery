import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
	Input,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import moment from "moment";

import { Schedule } from "./../../../../../../models/schedule";
import { ScheduleService } from "./../../../../../services/company/schedule.service";

@Component({
	selector: "kt-schedule",
	templateUrl: "./schedule.component.html",
	styleUrls: ["./schedule.component.scss"],
})
export class ScheduleComponent implements OnInit, AfterViewInit {
	@Input() company: any;

	dataSource;
	displayedColumns = ["dayWeek", "startHour", "endHour", "type", "delete"];
	formData;
	formDataDay;
	formSubmitSchedule = false;
	scheduleIdToDelete;
	typeAction = "create";

	daysOfWeek: Array<any> = [
		{ name: "SUNDAY", value: "SUNDAY" },
		{ name: "MONDAY", value: "MONDAY" },
		{ name: "TUESDAY", value: "TUESDAY" },
		{ name: "WEDNESDAY", value: "WEDNESDAY" },
		{ name: "THURSDAY", value: "THURSDAY" },
		{ name: "FRIDAY", value: "FRIDAY" },
		{ name: "SATURDAY", value: "SATURDAY" },
	];

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private scheduleService: ScheduleService
	) {}

	async ngOnInit() {
		if (this.company?._id) {
			await this.getListSchedule(this.company?._id);
		}
	}

	async newFormData() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),
				dayWeek: new FormArray([], [Validators.required]),
				hours: new FormArray([]),
				type: new FormControl("BOTH", [Validators.required]),
			});

			return resolve(true);
		});
	}

	onCheckboxChange(e) {
		const checkArray: FormArray = this.formData.get("dayWeek") as FormArray;

		if (e.target.checked) {
			checkArray.push(new FormControl(e.target.value));
		} else {
			let i = 0;
			checkArray.controls.forEach((item: FormControl) => {
				if (item.value === e.target.value) {
					checkArray.removeAt(i);
					return;
				}
				i++;
			});
		}
	}

	addNewHour() {
		return new Promise(async (resolve, reject) => {
			this.formDataDay = new FormGroup({
				startHour: new FormControl("", [Validators.required]),
				endHour: new FormControl("", [Validators.required]),
			});
			this.formData.get("hours").push(this.formDataDay);
			resolve(true);
		});
	}

	async removeHour(index) {
		return new Promise(async (resolve, reject) => {
			await this.formData.get("hours").removeAt(index);

			resolve(true);
		});
	}

	async getListSchedule(companyId) {
		const self = this;
		const ELEMENT_DATA = [];

		this.scheduleService.getSchedule(companyId).subscribe((data: any) => {
			self.dataSource = new MatTableDataSource(ELEMENT_DATA);
			if (data && Array.isArray(data)) {
				data.forEach((schedule, index) => {
					ELEMENT_DATA.push({
						_id: schedule._id,
						position: index + 1,
						dayWeek: schedule.dayWeek,
						type: schedule.type,
						startHour: moment(schedule.startHour, "Hmm").format("HH:mm"),
						endHour: moment(schedule.endHour, "Hmm").format("HH:mm"),
					});
				});

				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	async upSertScheduleModalShow(content, schedule: Schedule, type = "create") {
		this.typeAction = type;
		this.formSubmitSchedule = false;
		await this.newFormData();

		this.modalService
			.open(content, { ariaLabelledBy: "modal-edit-schedule", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async upSertSchedule(schedule: Schedule) {
		// get company id
		if (!this.company?._id) {
			this.toastr.error("Erro ao localizar a company vinculada!", "Falha!");
			return;
		}

		// Validatios
		console.log("veiooo", schedule);

		if (
			!schedule.dayWeek ||
			!Array.isArray(schedule.dayWeek) ||
			schedule.dayWeek.length <= 0
		) {
			this.toastr.error("Selecione os dias da semana!", "Falha!");
			return;
		}

		if (
			!schedule.hours ||
			!Array.isArray(schedule.hours) ||
			schedule.hours.length <= 0
		) {
			this.toastr.error("Informe as horas corretamente!", "Falha!");
			return;
		}

		if (this.typeAction === "create") {
			this.scheduleService.createSchedule(schedule, this.company._id).subscribe(
				async (_: any) => {
					if (this.company?._id) {
						await this.getListSchedule(this.company?._id);
					}
					this.changeDetectorRefs.detectChanges();
					this.toastr.success("Agendamento criado com sucesso!", "Sucesso!");
				},
				(error) => {
					console.log("Errro", error);
					this.toastr.error("Erro ao criar agendamento!", "Falha!");
				}
			);
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
			this.toastr.error("Erro ao deletar agendamento!", "Falha!");
			return;
		}
		await this.scheduleService
			.deleteSchedule(this.scheduleIdToDelete)
			.toPromise();
		this.toastr.success("Agendamento deletado com sucesso!", "Sucesso!");
		this.scheduleIdToDelete = undefined;
		if (this.company?._id) {
			await this.getListSchedule(this.company?._id);
		}
	}

	ngAfterViewInit() {}
}
