import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { startWith, debounceTime, switchMap } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { NgxPermissionsService } from "ngx-permissions";
import { TranslateService } from "@ngx-translate/core";
import moment from "moment";
import { AdmReportService } from "../../../../services/mobility/report/admReport.service";

import { Person } from "./../../../../../models/person";
import { Franchise } from "./../../../../../models/franchise";
import { Company } from "./../../../../../models/company";
import { PersonService } from "./../../../../services/person.service";
import { CompanyService } from "./../../../../services/company.service";
import { PassengerService } from "./../../../../services/mobility/passenger.service";
import { FranchiseService } from "./../../../../services/franchise.service";
import { Passenger } from "./../../../../../models/mobility/passenger";
import { checkObjectIdisValid } from "../../../util";
import { ExcelService } from "../../../../services/excel/excel.service";
import { ApplicationsService } from "../../../../services/applications.service";

@Component({
	selector: "kt-passenger",
	templateUrl: "./passengers.component.html",
	styleUrls: ["./passengers.component.scss"],
})
export class PassengersComponent implements OnInit, AfterViewInit {
	helpdeskUrl = "/helpdesk/faq/63a1c1e2f0f5dbc1805e58f6";
	person: Person[] = [];
	selectedPerson: Person;
	personValue: string;
	files: Set<File>;
	dataSource;
	companies: Company[] = [];
	companiesFilter: Company[] = [];
	companyValue: string;
	displayedColumns = [
		"image",
		"person",
		"franchise",
		"company",
		"createdAt",
		"status",
		"approved",
		"block",
		"delete",
	];
	formData;
	formFilter: FormGroup;
	filter: any = {};
	formSubmit = false;
	formSubmitAttempt = false;
	pageSize = 20;
	pageLimit: number[];
	//	pageLimit: number[] = [20, 50, 100, 200];
	totalLength;
	idToDelete;
	toDelete;
	isAdmin = false;
	franchises: Franchise[] = [];
	company: Company[] = [];
	isRoot: boolean = false;
	userFranchise: any;
	typeAction = "create";
	personImage;
	pageAtual = 0;
	formSubmitFilter = false;
	pageIndex = 0;
	exporting: Boolean = false;
	appversion = "";
	operationalSystem = "";
	load: Boolean = false;
	showPaginator = false;
	languageDefault = "pt-BR";
	listFranchise: any = [];
	isColumApproved = false;
	maskPhone = "(00) 00000-0000";

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private passengerService: PassengerService,
		private personService: PersonService,
		private franchiseService: FranchiseService,
		private permissionsService: NgxPermissionsService,
		private translate: TranslateService,
		private admReportService: AdmReportService,
		private companyService: CompanyService,
		private excelService: ExcelService,
		private applicationsService: ApplicationsService
	) {}

	async ngOnInit() {
		this.isColumApproved = false;
		const userStorage = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;

		this.languageDefault = userStorage?.languageDefault || "pt-BR";

		if (this.languageDefault === "pt-PT") {
			this.pageLimit = [20, 50, 100, 200, 1000000];
		} else {
			this.pageLimit = [20, 50, 100, 200];
		}
		await this.newFilter();
		await this.checkIsRoot();

		this.getList(
			this.pageIndex,
			this.pageSize,
			this.formFilter.controls.person.value?._id || this.formFilter.controls.person.value,
			this.formFilter.controls.company.value,
			this.formFilter.controls.franchise.value,
			this.formFilter.controls.start_date.value,
			this.formFilter.controls.end_date.value,
			this.formFilter?.controls?.approved?.value
		);
		// this.getListPerson();

		// this.newFormData();

		const permissions = this.permissionsService.getPermissions();
		if (permissions && permissions.accessToGlobal) {
			this.isAdmin = true;
		}
	}

	validatedFilterPaginator() {
		return new Promise(async (resolve, reject) => {
			const page = this.pageAtual || 0;
			const limit = this.pageSize;
			let startDate: string;
			let endDate: string;
			let person = this.formFilter?.controls?.person?.value;
			let company = this.formFilter?.controls?.company?.value;
			let franchise = this.formFilter?.controls?.franchise?.value;
			let approved = this.formFilter?.controls?.approved?.value;

			if (person?._id) {
				person = person._id;
			}
			if (company?._id) {
				company = company._id;
			}
			if (franchise?._id) {
				franchise = franchise._id;
			}

			// Valid startDate
			if (
				this.formFilter?.controls?.start_date?.value &&
				moment(this.formFilter?.controls?.start_date?.value, "DDMMYYYY", true).isValid()
			) {
				startDate = moment(this.formFilter?.controls?.start_date?.value, "DDMMYYYY")
					.format("YYYY-MM-DD")
					.toString();
			}

			// Valid endDate
			if (
				this.formFilter?.controls?.end_date?.value &&
				moment(this.formFilter?.controls?.end_date?.value, "DDMMYYYY", true).isValid()
			) {
				endDate = moment(this.formFilter?.controls?.end_date?.value, "DDMMYYYY")
					.format("YYYY-MM-DD")
					.toString();
			}

			// Valids start and end date
			if (
				(this.formFilter?.controls?.start_date?.value ||
					this.formFilter?.controls?.end_date?.value) &&
				(!moment(this.formFilter?.controls?.start_date?.value, "DDMMYYYY", true).isValid() ||
					!moment(this.formFilter?.controls?.end_date?.value, "DDMMYYYY", true).isValid())
			) {
				return resolve(true);
			}
			this.getList(
				this.pageIndex,
				this.pageSize,
				this.formFilter.controls.person.value?._id || this.formFilter.controls.person.value,
				this.formFilter.controls.company.value,
				this.formFilter.controls.franchise.value,
				this.formFilter.controls.start_date.value,
				this.formFilter.controls.end_date.value,
				approved
			);

			return resolve(true);
		});
	}

	newFilter() {
		return new Promise(async (resolve, reject) => {
			this.formFilter = new FormGroup({
				person: new FormControl("", [checkObjectIdisValid]),
				start_date: new FormControl(undefined, [Validators.required]),
				end_date: new FormControl(undefined, [Validators.required]),
				company: new FormControl(undefined, [checkObjectIdisValid]),
				franchise: new FormControl(undefined, [checkObjectIdisValid]),
				approved: new FormControl("all"),
			});

			this.formFilter
				.get("person")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => this.personService.getPersonNome(value !== null ? value : ""))
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
					switchMap((value) => {
						if (value && !this.formFilter?.controls?.franchise?.value) {
							return new Promise(async (resolve, reject) => {
								return resolve([
									{
										_id: undefined,
										name: this.translate.instant("GLOBAL.LABEL.FIRSTSELECTFRANCHISE"),
									},
								]);
							});
						}
						return typeof value === "string" && value.length > 0
							? this.companyService.getCompaniesByFranchise(
									value,
									this.formFilter?.controls?.franchise?.value
							  )
							: [];
					})
				)
				.subscribe((results) => {
					this.companies = results;
					this.changeDetectorRefs.detectChanges();
				});

			this.formFilter
				.get("franchise")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => this.franchiseService.getFranchisesNome(value !== null ? value : ""))
				)
				.subscribe((results: Franchise[]) => {
					this.listFranchise = results;
					this.changeDetectorRefs.detectChanges();
				});

			this.formFilter
				.get("start_date")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) =>
						typeof value === "string" && value.length > 0 ? this.validatedFilterPaginator() : []
					)
				)
				.subscribe(() => {
					this.changeDetectorRefs.detectChanges();
				});

			this.formFilter
				.get("end_date")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) =>
						typeof value === "string" && value.length > 0 ? this.validatedFilterPaginator() : []
					)
				)
				.subscribe((value) => {
					this.changeDetectorRefs.detectChanges();
				});

			this.formFilter
				.get("approved")
				.valueChanges.pipe(
					startWith(""),
					switchMap((value) => {
						if (typeof value === "string" && value.length > 0) {
							return this.validatedFilterPaginator();
						}

						return [];
					})
				)
				.subscribe((value) => {
					this.changeDetectorRefs.detectChanges();
				});

			return resolve(true);
		});
	}

	newFormData() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),
				franchise: new FormControl(undefined, [Validators.required, checkObjectIdisValid]),
				company: new FormControl(undefined, [checkObjectIdisValid]),
				status: new FormControl(undefined),
				block: new FormControl(false),
				personId: new FormControl(undefined, [checkObjectIdisValid]),
				file: new FormControl(undefined),
				person: new FormGroup({
					_id: new FormControl(undefined),
					name: new FormControl(undefined),
					cpf: new FormControl(undefined),
					ddi: new FormControl("+55"),
					phone: new FormControl(undefined),
					email: new FormControl(undefined),
				}),
				approved: new FormControl(undefined),
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

			if (!this.isRoot) {
				this.formData.patchValue({
					franchise: this.userFranchise,
				});
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
				.subscribe((results) => {
					this.franchises = results;
					this.changeDetectorRefs.detectChanges();
				});

			this.formData
				.get("personId")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) =>
						typeof value === "string" && value.length > 0
							? this.personService.getPersonNome(value)
							: []
					)
				)
				.subscribe((results) => (this.person = results));
			this.changeDetectorRefs.detectChanges();

			this.formData
				.get("company")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => {
						if (value && !this.formData?.controls?.franchise?.value) {
							return new Promise(async (resolve, reject) => {
								return resolve([{ _id: undefined, name: "PRIMEIRO SELECIONE UMA FRANQUIA" }]);
							});
						}

						return typeof value === "string" && value.length > 0
							? this.companyService.getCompaniesByFranchise(
									value,
									this.formData?.controls?.franchise?.value
							  )
							: [];
					})
				)
				.subscribe((results) => {
					this.companies = results;
					this.changeDetectorRefs.detectChanges();
				});

			return resolve(true);
		});
	}

	async onClickFranchise(franchise) {
		// Limpar campo company
		this.formData.patchValue({ company: undefined });
		this.companies = [];

		this.changeDetectorRefs.detectChanges();
		return franchise;
	}

	async onClickFranchiseFilter(franchise) {
		// Limpar campo company
		this.formFilter.patchValue({ company: undefined });
		this.companiesFilter = [];

		this.changeDetectorRefs.detectChanges();

		if (franchise && franchise._id) {
			this.filter.franchise = franchise._id;
			this.getList(
				this.pageIndex,
				this.pageSize,
				this.formFilter.controls.person.value?._id || this.formFilter.controls.person.value,
				this.formFilter.controls.company.value,
				this.formFilter.controls.franchise.value,
				this.formFilter.controls.start_date.value,
				this.formFilter.controls.end_date.value,
				this.formFilter?.controls?.approved?.value
			);
		} else {
			delete this.filter.franchiseFilter;
		}
	}
	async onClickCompanyFilter(company) {
		if (company?._id) {
			this.getList(
				this.pageIndex,
				this.pageSize,
				this.formFilter.controls.person.value?._id || this.formFilter.controls.person.value,
				company,
				this.formFilter.controls.franchise.value,
				this.formFilter.controls.start_date.value,
				this.formFilter.controls.end_date.value,
				this.formFilter?.controls?.approved?.value
			);
		}
	}

	loadFranchises() {
		const userInfo = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;

		// no caso de admin, consultar todas as franquias
		if (this.isAdmin) {
			this.franchiseService.getfranchises().subscribe(
				(data: Franchise[]) => {
					const list = Object.keys(data).map((index) => {
						const franchise = data[index];
						return franchise;
					});
					this.franchises = list;
				},
				(error) => {}
			);
		} else {
			this.franchiseService.getByUser(userInfo._id).subscribe(
				(data: Franchise[]) => {
					const list = Object.keys(data).map((index) => {
						const franchise = data[index];
						return franchise;
					});
					this.franchises = list;
				},
				(error) => {}
			);
		}

		this.changeDetectorRefs.detectChanges();
	}

	displayFnFilterTwo(person: Person) {
		if (person) {
			return person.name;
		}
	}

	displayFnPerson(person: Person) {
		if (person) {
			return person.name;
		}
	}
	displayFnCompany(company) {
		if (company) {
			return company.name;
		}
	}

	displayFnFranchise(franchise) {
		if (franchise) {
			return franchise.name;
		}
	}

	displayFn(franchise) {
		if (franchise) {
			return franchise.name;
		}
	}

	displayFnPersonId(person: Person) {
		if (person) {
			return person.name;
		}
	}

	async confirmPaginator() {
		await this.getList(
			this.pageIndex,
			this.pageSize,
			this.formFilter.controls.person.value?._id || this.formFilter.controls.person.value,
			this.formFilter.controls.company.value,
			this.formFilter.controls.franchise.value,
			this.formFilter.controls.start_date.value,
			this.formFilter.controls.end_date.value,
			this.formFilter?.controls?.approved?.value
		);
	}

	changePage(event, templateId) {
		this.pageSize = event.pageSize;
		this.pageIndex = event.pageIndex;
		if (event.pageSize === 1000000) {
			this.showPaginator = true;
		} else {
			this.showPaginator = false;
		}

		this.getList(
			this.pageIndex,
			this.pageSize,
			this.formFilter.controls.person.value?._id || this.formFilter.controls.person.value,
			this.formFilter.controls.company.value,
			this.formFilter.controls.franchise.value,
			this.formFilter.controls.start_date.value,
			this.formFilter.controls.end_date.value,
			this.formFilter?.controls?.approved?.value
		);
	}

	async onClickPerson(person) {
		this.personImage = person.image;
		this.formData.patchValue({
			person: {
				_id: person._id,
				name: person.name,
				cpf: person.cpf,
				phone: this.formatPhone(person?.ddi, person.phone),
				email: person.email,
				image: person.image,
				// file: person.image,
				// image: person.file,
			},
		});
	}

	async onClickPersonFilter(person) {
		if (person && person._id) {
			this.filter.person = person._id;
			this.getList(
				this.pageIndex,
				this.pageSize,
				this.formFilter.controls.person.value?._id || this.formFilter.controls.person.value,
				this.formFilter.controls.company.value,
				this.formFilter.controls.franchise.value,
				this.formFilter.controls.start_date.value,
				this.formFilter.controls.end_date.value,
				this.formFilter?.controls?.approved?.value
			);
		}
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
			(error) => {}
		);
	}

	async filterDate(filter) {
		if (filter.start_date && moment(filter.start_date, "DDMMYYYY", true).isValid()) {
			filter.start_date = moment(filter.start_date, "DDMMYYYY").format("YYYY-MM-DD");
		}

		if (filter.end_date && moment(filter.end_date, "DDMMYYYY", true).isValid()) {
			filter.end_date = moment(filter.end_date, "DDMMYYYY").format("YYYY-MM-DD");
		}

		// limpa o resultado atual
		this.dataSource = new MatTableDataSource([]);
		// Faz a consulta
		await this.validatedFilterPaginator();
		this.changeDetectorRefs.detectChanges();

		// apos finalizar o processo
		this.formSubmitFilter = false;
	}

	async getList(pageIn, pageOut, personId, company, franchise, startDate, endDate, approved) {
		const self = this;
		const ELEMENT_DATA = [];

		this.passengerService
			.getPaginator(pageIn, pageOut, personId, company, franchise, startDate, endDate, approved)
			.subscribe((data: any) => {
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				if (data.list && Array.isArray(data.list)) {
					data.list.forEach((item, index) => {
						const createdAt = moment(item?.createdAt, "YYYY-MM-DD").isValid()
							? moment(item?.createdAt, "YYYY-MM-DD HH:mm:ii")
									.subtract(3, "hours")
									.format("DD/MM HH:mm")
							: "Data inválida";

						if (item?.person?.phone) {
							item.person.phone = this.formatPhone(item?.person?.ddi, item?.person?.phone);
						}

						ELEMENT_DATA.push({
							_id: item._id,
							position: index + 1,
							person: item.person ? item.person : {},
							company: item.company ? item.company : {},
							franchise: item.franchise ? item.franchise : null,
							status: item.status,
							createdAt,
							block: item.person && item.person.block ? item.person.block : false,
							approved: item?.approved === true || item?.approved === false ? item?.approved : true,
							appversion: item?.appversion ? item?.appversion : "",
							operationalSystem: item.operationalSystem ? item.operationalSystem : "",
							// file: item.person.image ? item.person.image : undefined,
							image: item.image ? item.image : undefined,
						});
					});
					self.dataSource = new MatTableDataSource(ELEMENT_DATA);
					self.totalLength = data.total;
					this.changeDetectorRefs.detectChanges();
				}
			});
	}

	async upsertModalShow(content, passenger: Passenger, type = "create") {
		await this.newFormData();
		this.formSubmit = false;
		this.selectedPerson = null;
		this.typeAction = type;
		this.formData.reset();

		if (passenger) {
			this.formData.patchValue({
				_id: passenger._id,
				file: "",
				person: passenger?.person,
				company: passenger?.company,
				franchise: passenger?.franchise,
				status: passenger?.status,
				block: passenger?.person?.block || false,
				approved: passenger?.approved || false,
			});
		}
		this.appversion = "";
		if (passenger?.appversion) {
			this.appversion = passenger?.appversion;
		}

		this.operationalSystem = "";
		if (passenger?.operationalSystem) {
			this.operationalSystem = passenger?.operationalSystem;
		}

		if (passenger?.person?.ddi) {
			this.setMaskPhone(passenger?.person?.ddi);
		}

		this.changeDetectorRefs.detectChanges();
		this.modalService
			.open(content, { ariaLabelledBy: "modal-edit-passenger", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async upsert(passenger: Passenger) {
		if (passenger.person) {
			passenger.person.block = passenger.block;
		}

		if (passenger.person?.phone) {
			passenger.person.phone = `${passenger.person.ddi}${passenger.person?.phone}`
				.replace(/\D/g, "")
				.trim();
			passenger.person.ddi = `${passenger.person?.ddi}`.trim();
		}

		if (this.typeAction === "create") {
			this.passengerService.create(passenger).subscribe(async (data: any) => {
				await this.getList(
					this.pageIndex,
					this.pageSize,
					this.formFilter.controls.person.value?._id || this.formFilter.controls.person.value,
					this.formFilter.controls.company.value,
					this.formFilter.controls.franchise.value,
					this.formFilter.controls.start_date.value,
					this.formFilter.controls.end_date.value,
					this.formFilter?.controls?.approved?.value
				);
				this.changeDetectorRefs.detectChanges();
				this.modalService.dismissAll();
				this.toastr.success("Registro cadastrado com sucesso!", "Sucesso!");
				this.changeDetectorRefs.detectChanges();
			});
		} else {
			this.passengerService.update(passenger).subscribe(
				async (data: any) => {
					await this.getList(
						this.pageIndex,
						this.pageSize,
						this.formFilter.controls.person.value?._id || this.formFilter.controls.person.value,
						this.formFilter.controls.company.value,
						this.formFilter.controls.franchise.value,
						this.formFilter.controls.start_date.value,
						this.formFilter.controls.end_date.value,
						this.formFilter?.controls?.approved?.value
					);
					this.toastr.success("Registro alterado com sucesso!", "Sucesso!");
					this.modalService.dismissAll();
					this.changeDetectorRefs.detectChanges();
				},
				async (error) => {
					let messageError = "Falha ao criar registro";
					if (error?.error?.message) {
						messageError = error?.error?.message;
					}
					this.toastr.error(messageError, "Falha!");
					this.modalService.dismissAll();
					this.changeDetectorRefs.detectChanges();
				}
			);
			if (this.isRoot && !passenger.franchise) {
				this.toastr.error(this.translate.instant("GLOBAL.LABEL.SELECTAFRANCHISE"));
				return;
			}
		}
	}

	async confirmDeleteModalShow(content, data) {
		this.idToDelete = data?._id || null;
		this.toDelete = data;

		this.modalService
			.open(content, { ariaLabelledBy: "modal-delete-data", size: "sm" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async delete() {
		if (!this.idToDelete) {
			this.toastr.error("Erro ao deletar Passageiro(a)!", "Falha!");
			return;
		}

		if (this.toDelete && this.toDelete.person && this.toDelete.person._id) {
			await this.personService.deletePerson(this.toDelete.person._id).toPromise();
		}

		await this.passengerService.delete(this.idToDelete).toPromise();
		this.toastr.success("Passageiro(a) excluido com sucesso!", "Sucesso!");
		this.idToDelete = undefined;

		await this.getList(
			this.pageIndex,
			this.pageSize,
			this.formFilter.controls.person.value?._id || this.formFilter.controls.person.value,
			this.formFilter.controls.company.value,
			this.formFilter.controls.franhise.value,
			this.formFilter.controls.start_date.value,
			this.formFilter.controls.end_date.value,
			this.formFilter?.controls?.approved?.value
		);
	}
	ngAfterViewInit() {}

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

	checkIsRoot() {
		return new Promise(async (resolve, reject) => {
			const user = localStorage.getItem("@user-info")
				? JSON.parse(localStorage.getItem("@user-info"))
				: undefined;

			this.userFranchise = user?.franchise;
			this.isRoot = user?.isRoot;

			return resolve(true);
		});
	}

	getNamePerson(person) {
		try {
			if (person && person.name) {
				return person.name;
			}

			if (person && person.email) {
				return `Nome não localizado - ${person.email}`;
			}

			if (person && person.phone) {
				return `Nome não localizado - ${person.phone}`;
			}

			if (person && person.image) {
				return `Não localizado - ${person.image}`;
			}

			return "Nome não localizado";
		} catch (err) {
			return " - ";
		}
	}

	async generateExcel() {
		try {
			const title = `report_race_page_${this.pageIndex + 1}`;
			this.exporting = true;

			const response: any = await this.passengerService
				.getPaginator(
					this.pageIndex,
					this.pageSize,
					this.formFilter.controls.person.value?._id || this.formFilter.controls.person.value,
					this.formFilter.controls.start_date.value,
					this.formFilter.controls.end_date.value,
					this.formFilter.controls.company.value,
					this.formFilter.controls.franchise.value,
					this.formFilter?.controls?.approved?.value
				)
				.toPromise();

			const respJson: any = [];
			if (response && response.list && Array.isArray(response.list) && response.list.length > 0) {
				response.list.forEach((item) => {
					const createdAt = moment(item?.createdAt, "YYYY-MM-DD").isValid()
						? moment(item?.createdAt, "YYYY-MM-DD HH:mm:ii")
								.subtract(3, "hours")
								.format("DD/MM/YYYY  HH:mm")
						: "Data inválida";

					let payload: any = {
						PESSOA: this.getNamePerson(item?.person),
						EMAIL: item?.person?.email,
						FRANQUIA: item?.franchise?.name || "-",
						"CRIADO EM": createdAt,
						STATUS: item.status ? "Ativo" : "Inativo",
						BLOQUEADO: item?.person?.block === true ? "SIM" : "NAO",
					};

					if (item?.person?.nif) {
						payload.NIF = item?.person?.nif;
					}

					if (item?.person?.cpf) {
						payload.NIF = item?.person?.cpf;
					}

					if (item?.person?.cpf) {
						payload.CPF = item?.person?.cpf;
					}

					payload[`${this.translate.instant("GLOBAL.LABEL.PHONE")}`] = `${
						item?.person?.ddi || ""
					} ${item?.person?.phone || ""}`;

					// payload[`${this.translate.instant("GLOBAL.LABEL.GENRE")}`] =
					// 	item?.person?.genre;

					payload.OS = item?.person?.operationalSystem || "";
					payload.AppVersion = item?.person?.appversion || "";

					respJson.push(payload);
				});
			} else {
				this.exporting = false;
				this.changeDetectorRefs.detectChanges();
				return;
			}

			if (!respJson || !Array.isArray(respJson) || respJson.length <= 0) {
				this.exporting = false;
				this.changeDetectorRefs.detectChanges();
				return;
			}

			await this.saveExcel(respJson, title);
			this.exporting = false;
			this.changeDetectorRefs.detectChanges();
		} catch (err) {
			this.load = false;
			this.changeDetectorRefs.detectChanges();
		}
	}

	async saveExcel(json: any, title: string) {
		try {
			this.excelService.exportAsExcelFile(json, title);
			return true;
		} catch (err) {
			return false;
		}
	}

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

	setMaskPhone(field) {
		if (field?.target?.value) {
			field = field?.target?.value;
		}

		if (field === "+55" || `${field}`.search("55") === 0) {
			this.maskPhone = "(00) 00000-0000";
		} else if (field === "+351" || `${field}`.search("351") === 0) {
			this.maskPhone = "999999999";
		} else if (field === "+244" || `${field}`.search("244") === 0) {
			this.maskPhone = "999999999";
		}

		this.changeDetectorRefs.detectChanges();
	}

	formatPhone(ddi, phone) {
		try {
			if (!ddi || ddi === "+55" || ddi === "55") {
				return `${phone}`.replace(/\D/g, "").slice(-11);
			}

			return `${phone}`.replace(/\D/g, "").slice(-9);
		} catch (err) {
			return "";
		}
	}
}
