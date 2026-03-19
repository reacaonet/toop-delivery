import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { startWith, debounceTime, switchMap } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import moment from "moment";

import { City } from "./../../../../../models/city";
import { CityService } from "./../../../../services/city.service";
import { Company } from "./../../../../../models/company/company";
import { CompanyService } from "./../../../../services/company.service";
import { Franchise } from "./../../../../../models/franchise";
import { FranchiseService } from "./../../../../services/franchise.service";
import { Person } from "./../../../../../models/person";
import { PersonService } from "./../../../../services/person.service";
import { checkObjectIdisValid } from "../../../../util";

@Component({
	selector: "kt-person",
	templateUrl: "./person.component.html",
	styleUrls: ["./person.component.scss"],
})
export class PersonComponent implements OnInit, AfterViewInit {
	listCity: City[] = [];
	cityValue: string;
	dataSource;
	displayedColumns = [
		"name",
		"franchise",
		"company",
		"cpf",
		"city",
		"phone",
		"cellphone",
		"birthdate",
		"status",
		"editAction",
	];
	formData;
	formFilter: FormGroup;
	formSubmitPerson = false;
	name: Person[] = [];
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;

	franchises: Franchise[] = [];
	companies: Company[] = [];
	isRoot: boolean = false;
	createDigitalAccount = false;
	personIdDelete = null;
	maskPhone = "(00) 00000-0000";

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private personService: PersonService,
		private cityService: CityService,
		private companyService: CompanyService,
		private franchiseService: FranchiseService
	) {}

	ngOnInit() {
		this.checkIsRoot();
		this.getListFranchises();
		this.getListCompanies();
		this.newFormData();

		this.formFilter = new FormGroup({
			name: new FormControl(""),
			cpf: new FormControl(""),
		});

		this.formFilter
			.get("name")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) =>
					typeof value === "string" && value.length > 0
						? this.getListPerson(0, this.pageSize, value, undefined)
						: []
				)
			)
			.subscribe((results) => {
				this.changeDetectorRefs.detectChanges();
			});

		this.formFilter
			.get("cpf")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) => this.getListPerson(0, this.pageSize, undefined, value))
			)
			.subscribe((results) => {
				this.changeDetectorRefs.detectChanges();
			});

		this.formData
			.get("city")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) => {
					return this.cityService.getCityName(value);
				})
			)
			.subscribe((results) => {
				this.listCity = results;
				this.changeDetectorRefs.detectChanges();
			});

		this.formData
			.get("franchise")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) => {
					if (!value) {
						return [];
					}

					return this.franchiseService.getfranchises({
						limit: 20,
						name: value,
						sortName: 1,
					});
				})
			)
			.subscribe((data: any) => {
				this.franchises = data;
				this.changeDetectorRefs.detectChanges();
			});

		this.formData
			.get("company")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) => {
					if (!value || typeof value !== "string") {
						return [];
					}

					// return this.franchiseService.getfranchises({
					// 	limit: 20,
					// 	name: value,
					// 	sortName: 1,
					// });

					return this.companyService.getCompaniesNome(value);
				})
			)
			.subscribe((data: any) => {
				this.companies = data;
				this.changeDetectorRefs.detectChanges();
			});
	}

	newFormData() {
		this.formData = new FormGroup({
			_id: new FormControl(""),
			name: new FormControl("", [Validators.required]),
			cpf: new FormControl(""),
			city: new FormControl("", [checkObjectIdisValid]),
			ddi: new FormControl("+55"),
			phone: new FormControl(""),
			cellphone: new FormControl(""),
			birthdate: new FormControl(""),
			status: new FormControl(""),
			franchise: new FormControl("", [checkObjectIdisValid]),
			company: new FormControl("", [checkObjectIdisValid]),
		});

		this.getListPerson(0, this.pageSize, undefined, undefined);
	}

	ngAfterViewInit() {}

	displayFn(city: City) {
		return city && city.name ? city.name : undefined;
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getListPerson(event.pageIndex, event.pageSize, undefined, undefined);
	}

	async getListPerson(pageIn, pageOut, name, cpf) {
		const self = this;
		const ELEMENT_DATA = [];

		this.personService.getPersonPaginator(pageIn, pageOut, name, cpf).subscribe((data: any) => {
			// console.log('Person', data)

			self.dataSource = new MatTableDataSource();

			if (data.list && Array.isArray(data.list)) {
				data.list.forEach((person, index) => {
					const birthdateFormatted =
						person.birthdate && moment(person.birthdate).isValid()
							? moment(person.birthdate, "YYYY-MM-DD").format("DD/MM/YYYY")
							: "-";

					ELEMENT_DATA.push({
						_id: person._id,
						position: index + 1,
						name: person.name,
						cpf: person.cpf,
						city: person.city && person.city ? person.city : null,
						city_id: person.city && person.city._id ? person.city._id : undefined,
						ddi: person?.ddi ? person?.ddi : "+55",
						phone: person.phone,
						cellphone: person.cellphone,
						birthdate: birthdateFormatted,
						franchise: person.franchise,
						company: person.company,
						status: person.status,
					});
				});
				this.dataSource.data = ELEMENT_DATA;
				self.totalLength = data.total;
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	createPersonModalShow(content) {
		this.formSubmitPerson = false;
		this.formData.reset();

		this.modalService
			.open(content, { ariaLabelledBy: "modal-create-person", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async createPerson(person: Person, content, save = false) {
		if (!save) {
			this.modalService
				.open(content, {
					ariaLabelledBy: "modal-create-digital-accounts",
					size: "md",
					backdrop: "static",
				})
				.result.then(
					(result) => {},
					(reason) => {}
				);
		} else {
			if (person.city !== undefined && !person.city._id) {
				this.toastr.error("Por favor selecione uma cidade na lista", "Escolha uma Empresa!");
				return;
			}

			if (person.birthdate) {
				const isBirthValid = moment(person.birthdate, "DD/MM/YYYY").isValid();
				if (!isBirthValid) {
					return this.toastr.error(
						"Por favor informe uma Data de nascimento válida",
						"Data de Nascimento"
					);
				}
			}

			if (this.isRoot && !person.franchise) {
				this.toastr.error(
					"Por favor selecione uma franquia para criar a pessoa!",
					"Escolha uma Franquia!"
				);
				return;
			}

			// if (!this.isRoot && !person.company) {
			// 	this.toastr.error(
			// 		"Por favor selecione uma empresa para criar a pessoa!",
			// 		"Escolha uma Empresa!"
			// 	);
			// 	return;
			// }

			if (person.birthdate) {
				person.birthdate = moment(person.birthdate, "DD/MM/YYYY").format("YYYY-MM-DD");
			}

			person.createDigitalAccount = this.createDigitalAccount;

			if (person?.phone) {
				person.phone = `${person.ddi}${person?.phone}`.replace(/\D/g, "").trim();
				person.ddi = `${person?.ddi}`.trim();
			}

			this.personService.createPerson(person).subscribe(
				(data: any) => {
					const person = data.data;
					this.toastr.success("Person criado com sucesso!", "Sucesso!");
					const birthdateFormatted =
						person.birthdate && moment(person.birthdate).isValid()
							? moment(person.birthdate, "YYYY-MM-DD").format("DD/MM/YYYY")
							: "-";

					this.dataSource.data.push({
						_id: person._id,
						position: this.dataSource.data.length + 2,
						name: person.name,
						cpf: person.cpf,
						city: person.city && person.city.name ? person.city : undefined,
						phone: person.phone,
						cellphone: person.cellphone,
						birthdate: birthdateFormatted,
						status: person.status,
						franchise: person.franchise,
						company: person.company,
					});

					this.dataSource._updateChangeSubscription();
					this.changeDetectorRefs.detectChanges();
					this.modalService.dismissAll();
				},
				(error) => {
					person.birthdate = "";
					this.toastr.error("Erro ao criar Person!", "Falha!");
					// this.modalService.dismissAll();
				}
			);
		}
	}

	async editPersonModalShow(content, person: Person) {
		this.formSubmitPerson = false;

		if (person.birthdate && person.birthdate.length > 3) {
			person.birthdate = moment(person.birthdate, "YYYY-MM-DD").format("DD/MM/YYYY");
		} else {
			person.birthdate = "";
		}

		if (person.ddi) {
			this.setMaskPhone(person.ddi);
		}

		this.formData.reset();
		this.formData.patchValue({
			_id: person._id,
			name: person.name,
			cpf: person.cpf,
			city: person.city && person.city._id ? person.city : undefined,
			ddi: person.ddi,
			phone: person.phone,
			cellphone: person.cellphone,
			birthdate: person.birthdate,
			status: person.status,
			franchise: person.franchise,
			company: person.company,
		});

		this.modalService
			.open(content, { ariaLabelledBy: "modal-edit-person", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async updatePerson(person: Person) {
		const savePerson: any = { ...person };

		if (this.isRoot && !savePerson.franchise) {
			this.toastr.error(
				"Por favor selecione uma franquia para criar a pessoa!",
				"Escolha uma Franquia!"
			);
			return;
		}

		// if (!this.isRoot && !savePerson.company) {
		// 	this.toastr.error(
		// 		"Por favor selecione uma empresa para criar a pessoa!",
		// 		"Escolha uma Empresa!"
		// 	);
		// 	return;
		// }

		if (savePerson.birthdate) {
			savePerson.birthdate = moment(person.birthdate, "DD/MM/YYYY").format("YYYY-MM-DD");
		}

		if (savePerson.city !== undefined && !savePerson.city._id) {
			this.toastr.error("Por favor selecione uma cidade na lista", "Escolha uma Empresa!");
			return;
		}

		if (person?.phone) {
			person.phone = `${person.ddi}${person?.phone}`.replace(/\D/g, "").trim();
			person.ddi = `${person?.ddi}`.trim();
		}

		this.personService.updatePerson(savePerson).subscribe(
			(data: any) => {
				const index = this.dataSource.data.map((e: any) => e._id).indexOf(person._id);
				this.dataSource.data[index] = data.data;

				const birthdateFormatted =
					savePerson.birthdate && moment(savePerson.birthdate).isValid()
						? moment(savePerson.birthdate, "YYYY-MM-DD").format("DD/MM/YYYY")
						: "-";

				this.dataSource.data[index].birthdate = birthdateFormatted;

				this.dataSource.data[index].city = data.data.city ? data.data.city : undefined;
				this.dataSource._updateChangeSubscription();
				this.changeDetectorRefs.detectChanges();
				this.formData.reset();
				this.toastr.success("Person alterado com sucesso!", "Sucesso!");
				this.modalService.dismissAll();
			},
			(error) => {
				console.error(error);
				this.toastr.error("Erro ao alterar Person!", "Falha!");
				this.modalService.dismissAll();
			}
		);
	}

	async getFranchises(userId: string = "") {
		if (!userId) {
			await this.franchiseService
				.getfranchises({
					limit: 20,
					sortName: 1,
				})
				.subscribe((data: any) => {
					this.franchises = data;
					this.changeDetectorRefs.detectChanges();
				});
		} else {
			await this.franchiseService.getByUser(userId, undefined).subscribe((data: any) => {
				this.franchises = data;
				this.changeDetectorRefs.detectChanges();
			});
		}
	}

	async getListFranchises() {
		const user = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;

		if (user && user._id) {
			if (user.isRoot === "true" || user.isRoot === true) {
				this.getFranchises();
			} else {
				this.getFranchises(user._id);
			}
		}
	}

	getListCompanies() {
		this.companyService.getCompanies().subscribe(
			(data: Company[]) => {
				this.companies = data;
				this.changeDetectorRefs.detectChanges();
			},
			(error) => {}
		);
	}

	checkIsRoot() {
		const user = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;

		this.isRoot = user?.isRoot;
	}

	async confirmDeleteModalShow(content, person) {
		console.log("Person Delete");
		this.personIdDelete = person._id;
		this.modalService
			.open(content, { ariaLabelledBy: "modal-delete-person", size: "sm" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async deletePerson() {
		try {
			if (!this.personIdDelete) {
				this.toastr.error("Informe um Person para remover", "Remover");
				return;
			}

			await this.personService.deletePerson(this.personIdDelete).toPromise();
			this.toastr.success("Registro deletado com sucesso!", "Removido");
			this.personIdDelete = undefined;
			await this.getListPerson(0, this.pageSize, undefined, undefined);

			console.log("Registro Removido com sucesso!!");
		} catch (err) {
			let message = "Não foi possível remover informação";
			if (err.error && err.error.message) {
				message = err.error.message;
			} else {
				console.error(err);
			}

			this.toastr.error(message);
		}
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
}
