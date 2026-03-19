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

import { PersonService } from "./../../../../services/person.service";
import { CompanyService } from "./../../../../services/company.service";
import { Person } from "./../../../../../models/person";
import { Company } from "./../../../../../models/company/company";
import { DeliveryMan } from "../../../../../models/deliveryMan";
import { DeliveryManService } from "../../../../services/deliveryMan.service";
import { Alert } from "./../../../../../models/alert";
import { Franchise } from "../../../../../models/franchise";
import { FranchiseService } from "../../../../services/franchise.service";
import { checkObjectIdisValid } from "../../../../util";

@Component({
	selector: "kt-delivery-record",
	templateUrl: "./delivery-record.component.html",
	styleUrls: ["./delivery-record.component.scss"],
})
export class DeliveryRecordComponent implements OnInit, AfterViewInit {
	alert: Alert = undefined;
	companies: Company[] = [];
	companiesFilter: Company[] = [];

	companyValue: string;
	dataSource;
	deliveryManIdToDelete;
	displayedColumns = ["isOnline", "person", "company", "appVersion", "delete"];
	formData;
	formDataNewPercentage = [];
	formFilter: FormGroup;
	formSubmitDeliveryMan = false;
	myControl: FormControl = new FormControl();
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	person: Person[] = [];
	personValue: string;
	totalLength;
	totalLengthDelivery;
	typeAction = "create";
	deliveryOnline;
	resultsDelivery;
	deliveryManId;
	franchises: Franchise[] = [];

	deliveryCompanyFilter: Company[] = [];
	listDeliveryCompany: any = [];

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private deliveryManService: DeliveryManService,
		private companyService: CompanyService,
		private personService: PersonService,
		private franchiseService: FranchiseService
	) { }

	ngOnInit() {
		// this.getListPerson();
		this.getCompany();

		// Filter
		this.initFormFilter();
		this.getListDeliveryMan(
			0,
			this.pageSize,
			this.formFilter.controls.person.value,
			this.formFilter.controls.company.value,
			this.formFilter.controls.isOnline.value
		);

		this.getFranchises();
	}

	initFormDelivery() {
		this.companies = [];
		const indexCompany = this.companies.length;

		this.formData = new FormGroup({
			_id: new FormControl(""),
			franchise: new FormControl("", [Validators.required]),
			isOnline: new FormControl(""),
			phone: new FormControl(""),
			typeOfVehicle: new FormControl("", [Validators.required]),
			board: new FormControl(""),
			model: new FormControl(""),
			manufacturer: new FormControl(""),
			color: new FormControl(""),
			year: new FormControl("", [
				Validators.minLength(4),
				Validators.maxLength(4),
			]),
			person: new FormControl("", [Validators.required, checkObjectIdisValid]),
			showFreightValue: new FormControl(true),
			company: new FormControl(null, [checkObjectIdisValid]),
			deliveryCompany: new FormControl(null, [checkObjectIdisValid]),
			merchantId: new FormControl(""),
			deliveryFee: new FormGroup({
				percentage: new FormControl("100", [Validators.required]),
				division: new FormArray([]),
			}),
			bankData: new FormGroup({
				favoredName: new FormControl(undefined),
				bankName: new FormControl(undefined),
				agency: new FormControl(undefined),
				account: new FormControl(undefined),
				typeAccount: new FormControl("CURRENT"),
				pixKey: new FormControl(undefined),
				pixType: new FormControl(""),
			}),
			status: new FormControl(""),
		});

		this.formData
			.get("company")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				distinctUntilChanged(),
				switchMap((value) =>
					typeof value === "string" && value.length > 0
						? this.companyService.getCompaniesNome(value)
						: []
				)
			)
			.subscribe((results) => (this.companies[indexCompany] = results));

		this.formData
			.get("deliveryCompany")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) =>
					typeof value === "string" && value.length > 0
						? this.companyService.getCompaniesNome(value)
						: []
				)
			)
			.subscribe((results: Company[]) => {
				if (results && results.length > 0) {
					this.deliveryCompanyFilter = results;
				} else {
					this.deliveryCompanyFilter = [];
				}

				this.changeDetectorRefs.detectChanges();
			});

		this.formData
			.get("franchise")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) =>
					value && typeof value === "string" && value.length > 0
						? this.getFranchises()
						: []
				)
			)
			.subscribe((results) => {
				this.franchises = results;
				this.changeDetectorRefs.detectChanges();
			});

		this.formData
			.get("person")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				distinctUntilChanged(),
				switchMap((value) =>
					typeof value === "string" && value.length > 0
						? this.personService.getPersonNome(value)
						: []
				)
			)
			.subscribe((results) => (this.person = results));

		this.formData
			.get("isOnline")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) =>
					typeof value === "string" && value.length > 0
						? this.getListDeliveryMan(
							0,
							this.pageSize,
							this.formFilter.controls.person.value,
							this.formFilter.controls.company.value,
							value
						)
						: []
				)
			)
			.subscribe(() => {
				this.changeDetectorRefs.detectChanges();
			});
	}

	async addNewPercentage(percentage = "", company = "") {
		return new Promise(async (resolve, reject) => {
			const indexCompany = this.formDataNewPercentage.length;

			this.formDataNewPercentage[indexCompany] = new FormGroup({
				percentage: new FormControl(percentage, [Validators.required]),
				company: new FormControl(company, [Validators.required]),
			});

			this.formDataNewPercentage[indexCompany]
				.get("company")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					distinctUntilChanged(),
					switchMap((value) =>
						typeof value === "string" && value.length > 0
							? this.companyService.getCompaniesNome(value)
							: []
					)
				)
				.subscribe((results) => (this.companies[indexCompany] = results));

			this.formData
				.get("deliveryFee")
				.controls.division.push(this.formDataNewPercentage[indexCompany]);
			resolve(true);
		});
	}

	initFormFilter() {
		this.formFilter = new FormGroup({
			person: new FormControl(""),
			company: new FormControl(""),
			isOnline: new FormControl(""),
		});
		this.formFilter
			.get("person")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) =>
					typeof value === "string" && value.length > 0
						? this.personService.getPersonNome(value)
						: []
				)
			)
			.subscribe((results: Person[]) => {
				this.person = results;
				this.changeDetectorRefs.detectChanges();
			});

		this.formFilter
			.get("company")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) =>
					typeof value === "string" && value.length > 0
						? this.companyService.getCompaniesNome(value)
						: []
				)
			)
			.subscribe((results: Company[]) => {
				this.companiesFilter = results;
				this.changeDetectorRefs.detectChanges();
			});

		this.formFilter
			.get("isOnline")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) => {
					if (typeof value === "string" && value.length > 0) {
						return this.getListDeliveryMan(
							0,
							this.pageSize,
							this.formFilter.controls.person.value,
							this.formFilter.controls.company.value,
							value === "ALL" ? "" : value
						);
					}

					return [];
				})
			)
			.subscribe(() => {
				this.changeDetectorRefs.detectChanges();
			});
	}

	displayFnFilter(company: Company) {
		if (company) {
			return company.name;
		}
	}

	displayFnFilterTwo(person: Person) {
		if (person) {
			return person.name;
		}
	}

	displayFnFranchise(franchise: Franchise) {
		if (franchise) {
			return franchise.name;
		}
	}

	async onClickCompanyFilter(company) {
		await this.getListDeliveryMan(
			0,
			this.pageSize,
			this.formFilter.controls.person.value,
			company._id,
			this.formFilter.controls.isOnline.value
		);
	}

	async onClickPersonFilter(person) {
		await this.getListDeliveryMan(
			0,
			this.pageSize,
			person._id,
			this.formFilter.controls.company.value,
			this.formFilter.controls.isOnline.value
		);
	}

	displayFnAll(value: any) {
		if (value) {
			return value.name;
		}
	}

	displayFn(company: Company) {
		if (company) {
			return company.name;
		}
	}

	displayFnPerson(person: Person) {
		if (person) {
			return person.name;
		}
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getListDeliveryMan(
			event.pageIndex,
			event.pageSize,
			this.formFilter.controls.person.value,
			this.formFilter.controls.company.value,
			this.formFilter.controls.isOnline.value
		);
	}

	async removeFeePercentage(index) {
		return new Promise(async (resolve, reject) => {
			await this.formData.get("deliveryFee").get("division").removeAt(index);

			resolve(true);
		});
	}

	getListPerson() {
		this.personService.getPerson().subscribe(
			(data: Person[]) => {
				const list = Object.keys(data).map((index) => {
					const person = data[index];
					return person;
				});
				this.person = list;
			},
			(error) => { }
		);
	}

	getCompany() {
		this.companyService.getCompanies().subscribe(
			(data: Company[]) => {
				const list = Object.keys(data).map((index) => {
					const company = data[index];
					return company;
				});
				this.companies = list;
			},
			(error) => { }
		);
	}

	changePageDeliveryMan(event) {
		this.pageSize = event.pageSize;
		this.getListDeliveryMan(
			event.pageIndex,
			event.pageSize,
			this.formFilter.controls.person.value,
			this.formFilter.controls.company.value,
			this.formFilter.controls.isOnline.value
		);
	}

	async getListDeliveryMan(pageIn, pageOut, personId, companyId, isOnline) {
		const self = this;
		const ELEMENT_DATA = [];

		this.deliveryManService
			.getDeliveryManPaginator(pageIn, pageOut, personId, companyId, isOnline)
			.subscribe((data: any) => {
				if (data.list && Array.isArray(data.list)) {
					data.list.forEach((deliveryMan, index) => {
						ELEMENT_DATA.push({
							_id: deliveryMan._id,
							position: index + 1,
							isOnline: deliveryMan.isOnline,
							phone: deliveryMan.phone,
							typeOfVehicle: deliveryMan.typeOfVehicle,
							board: deliveryMan.board,
							model: deliveryMan.model,
							manufacturer: deliveryMan.manufacturer,
							color: deliveryMan.color,
							year: deliveryMan.year,
							showFreightValue: deliveryMan.showFreightValue,
							merchantId: deliveryMan.merchantId,
							deliveryFee: deliveryMan.deliveryFee,
							person: deliveryMan.person ? deliveryMan.person : "-",
							company: deliveryMan.company ? deliveryMan.company : null,
							bankData: deliveryMan.bankData ? deliveryMan.bankData : {},
							status: deliveryMan.status,
							appVersion: deliveryMan.appVersion ? deliveryMan.appVersion : "-",
							franchise: deliveryMan?.franchise
								? deliveryMan?.franchise
								: undefined,
							companyService: deliveryMan.companyService
								? deliveryMan.companyService
								: [],
						});
					});

					self.dataSource = new MatTableDataSource(ELEMENT_DATA);
					self.totalLength = data.total;
					this.changeDetectorRefs.detectChanges();
				}
			});
	}

	async getDeliveryManOnlineLastWeek(deliveryMan: string, pageIn, pageOut) {
		return new Promise(async (resolve, reject) => {
			let list = await this.deliveryManService
				.getDeliveryManOnlineLastWeek(deliveryMan, pageIn, pageOut)
				.toPromise();

			const result = Object.keys(list).map((index) => {
				const company = list[index];
				return company;
			});

			resolve(result);
		});
	}

	async upSertDeliveryManModalShow(content, deliveryMan: any, type = "create") {
		this.typeAction = type;
		this.formSubmitDeliveryMan = false;
		await this.initFormDelivery();
		this.formData.reset();

		// Only edit
		if (deliveryMan) {
			this.deliveryManId = deliveryMan._id;
			this.deliveryOnline = await this.getDeliveryManOnlineLastWeek(
				deliveryMan._id,
				0,
				this.pageSize
			);
			this.resultsDelivery = this.deliveryOnline[1];
			this.totalLengthDelivery = this.deliveryOnline[0].length;

			this.formData.patchValue({
				_id: deliveryMan._id,
				isOnline: deliveryMan.isOnline,
				phone: deliveryMan.phone,
				typeOfVehicle: deliveryMan.typeOfVehicle,
				board: deliveryMan.board,
				model: deliveryMan.model,
				manufacturer: deliveryMan.manufacturer,
				color: deliveryMan.color,
				year: deliveryMan.year,
				showFreightValue: deliveryMan.showFreightValue,
				distance: [],
				deliveryFee: {
					percentage:
						deliveryMan.deliveryFee && deliveryMan.deliveryFee.percentage
							? deliveryMan.deliveryFee.percentage
							: "",
				},
				merchantId: deliveryMan.merchantId,
				company: deliveryMan.company ? deliveryMan.company : null,
				person: deliveryMan.person,
				bankData: deliveryMan.bankData ? deliveryMan.bankData : {},
				status: deliveryMan.status,
				franchise: deliveryMan?.franchise?._id,
			});

			if (deliveryMan.deliveryFee && deliveryMan.deliveryFee.division) {
				deliveryMan.deliveryFee.division.forEach((item) => {
					this.addNewPercentage(item.percentage, item.company);
				});
			}

			if (
				deliveryMan.companyService &&
				Array.isArray(deliveryMan.companyService)
			) {
				this.listDeliveryCompany = deliveryMan.companyService;
			}
		}

		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-edit-deliveryMan",
				size: "lg",
				backdrop: "static",
			})
			.result.then(
				(result) => { },
				(reason) => { }
			);
	}

	async upSertDeliveryMan(deliveryMan: any) {
		if (
			this.listDeliveryCompany &&
			Array.isArray(this.listDeliveryCompany) &&
			this.listDeliveryCompany.length > 0
		) {
			deliveryMan.companyService = this.listDeliveryCompany.map((item) => {
				return item._id;
			});
		} else {
			deliveryMan.companyService = [];
		}

		if (this.typeAction === "create") {
			this.deliveryManService.createDeliveryMan(deliveryMan).subscribe(
				async (_: any) => {
					await this.getListDeliveryMan(
						0,
						this.pageSize,
						this.formFilter.controls.person.value,
						this.formFilter.controls.company.value,
						this.formFilter.controls.isOnline.value
					);
					this.changeDetectorRefs.detectChanges();
					this.toastr.success(
						"DeliveryMan atualizado com sucesso!",
						"Sucesso!"
					);
					this.modalService.dismissAll();
				},
				(error) => {
					this.toastr.error("Erro ao criar DeliveryMan!", "Falha!");
					// this.modalService.dismissAll();
				}
			);
		} else {
			this.deliveryManService.updateDeliveryMan(deliveryMan).subscribe(
				async (_: any) => {
					await this.getListDeliveryMan(
						0,
						this.pageSize,
						this.formFilter.controls.person.value,
						this.formFilter.controls.company.value,
						this.formFilter.controls.isOnline.value
					);
					this.toastr.success("DeliveryMan alterado com sucesso!", "Sucesso!");
					this.modalService.dismissAll();
				},
				(error) => {
					let message = "Erro ao alterar DeliveryMan!";

					if (error.error && error.error.message) {
						message = error.error.message;
					}

					this.toastr.error(message, "Falha!");
					// this.modalService.dismissAll();
				}
			);
		}
	}

	async confirmDeleteModalShow(content, deliveryMan) {
		this.deliveryManIdToDelete = deliveryMan._id;
		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-delete-deliveryMan",
				size: "sm",
				backdrop: "static",
			})
			.result.then(
				(result) => { },
				(reason) => { }
			);
	}

	async deleteDeliveryMan() {
		if (!this.deliveryManIdToDelete) {
			this.toastr.error("Erro ao deletar DeliveryMan!", "Falha!");
			return;
		}
		await this.deliveryManService
			.deleteDeliveryMan(this.deliveryManIdToDelete)
			.toPromise();
		this.toastr.success("DeliveryMan deletado com sucesso!", "Sucesso!");

		this.deliveryManIdToDelete = undefined;
		await this.getListDeliveryMan(
			0,
			this.pageSize,
			this.formFilter.controls.person.value,
			this.formFilter.controls.company.value,
			this.formFilter.controls.isOnline.value
		);
	}

	closeAlert() {
		this.alert = null;
	}

	ngAfterViewInit() { }

	focusInOnline(person) {
		this.personValue = person.target.value;
	}

	focusOutOnline(person, modalType) {
		const personValue = person.target.value;

		this.person.forEach((person: Person, index) => {
			if (person.name === personValue) {
				this.formData.controls.person.setValue(person._id);
				this.personValue = person.name;
				return true;
			}
		});

		person.target.value = this.personValue;
	}

	focusInPerson(person) {
		this.personValue = person.target.value;
	}

	focusOutPerson(person, modalType) {
		const personValue = person.target.value;

		this.person.forEach((person: Person, index) => {
			if (person.name === personValue) {
				this.formData.controls.person.setValue(person._id);
				this.personValue = person.name;
				return true;
			}
		});

		person.target.value = this.personValue;
	}

	focusInCompany(company) {
		this.companyValue = company.target.value;
	}

	focusOutCompany(company, modalType) {
		const companyValue = company.target.value;

		this.companies.forEach((company: Company, index) => {
			if (company.name === companyValue) {
				this.formData.controls.company.setValue(company._id);
				this.companyValue = company.name;
				return true;
			}
		});

		company.target.value = this.companyValue;
	}

	async getFranchises(userId: string = "") {
		this.franchiseService
			.getfranchises({ limit: 1000 })
			.subscribe((data: any) => {
				this.franchises = data;
				this.changeDetectorRefs.detectChanges();
			});
	}

	addCompanyInList(event) {
		const company = event.option.value;

		if (company && company._id) {
			this.listDeliveryCompany.push({
				_id: company._id,
				name: company.name,
			});
		}

		this.deliveryCompanyFilter = [];
		this.changeDetectorRefs.detectChanges();
	}

	removeCompanyList(user) {
		if (this.listDeliveryCompany && this.listDeliveryCompany.length <= 0) {
			return;
		}

		this.listDeliveryCompany = this.listDeliveryCompany.filter((item) => {
			return item._id !== user._id;
		});

		this.changeDetectorRefs.detectChanges();
	}
}
