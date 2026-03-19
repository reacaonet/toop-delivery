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

import { Company } from "./../../../../../models/company/company";
import { CompanyService } from "./../../../../services/company.service";
import { Franchise } from "./../../../../../models/franchise";
import { FranchiseService } from "./../../../../services/franchise.service";
import { Person } from "./../../../../../models/person";
import { PersonService } from "./../../../../services/person.service";
import { User } from "./../../../../../models/user";
import { UserService } from "./../../../../services/user.service";
import { checkObjectIdisValid } from "../../../../util";

@Component({
	selector: "kt-user",
	templateUrl: "./user.component.html",
	styleUrls: ["./user.component.scss"],
})
export class UserComponent implements OnInit, AfterViewInit {
	companies: Company[] = [];
	companiesList: Company[][] = [];
	franchises: Company[] = [];
	franchisesList: Company[][] = [];
	person: Person[] = [];
	companyValue: string;
	personValue: string;
	dataSource;
	displayedColumns = ["person", "name", "email", "status", "delete"];
	formData;
	formFilter;
	formSubmitUser = false;
	myControl: FormControl = new FormControl();
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	userIdToDelete;
	totalLength;
	typeAction = "create";
	formDataCompanies = [];
	formDataFranchises = [];
	userIsAdmin = false;

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private companyService: CompanyService,
		private franchiseService: FranchiseService,
		private personService: PersonService,
		private userService: UserService
	) {}

	async ngOnInit() {
		await this.newFormFilter();
		await this.checkIsAdmin();
		this.getListUser(0, this.pageSize, undefined, undefined);
	}

	async checkIsAdmin() {
		return new Promise(async (resolve, reject) => {
			const user = localStorage.getItem("@user-info")
				? JSON.parse(localStorage.getItem("@user-info"))
				: undefined;
			if (user && user.isRoot) {
				this.userIsAdmin = true;
			} else {
				this.userIsAdmin = false;
			}
			return resolve(true);
		});
	}

	newFormFilter() {
		return new Promise(async (resolve, reject) => {
			this.formFilter = new FormGroup({
				person: new FormControl(undefined, [checkObjectIdisValid]),
				company: new FormControl(undefined, [checkObjectIdisValid]),
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
					this.companies = results;
					this.changeDetectorRefs.detectChanges();
				});
			return resolve(true);
		});
	}

	createNewForm() {
		this.companies = [];
		this.person = [];
		this.formData = new FormGroup({
			_id: new FormControl(""),
			person: new FormControl(undefined, [Validators.required, checkObjectIdisValid]),
			name: new FormControl(undefined, [Validators.required]),
			status: new FormControl(true),
			companies: new FormArray([]),
			franchises: new FormArray([]),
			email: new FormControl(undefined, [Validators.required]),
			password: new FormControl(undefined, [Validators.required]),
			confirmPassword: new FormControl(undefined, [Validators.required]),
		});

		this.formData
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
			.subscribe((results) => {
				if (Array.isArray(results)) {
					this.person = results;
				}
				this.changeDetectorRefs.detectChanges();
			});
	}

	async upsertUserModalShow(content, user: User, type = "create") {
		this.typeAction = type;
		this.formSubmitUser = false;
		await this.createNewForm();
		this.formData.reset();

		if (this.typeAction !== "create") {
			this.formData.get("password").clearValidators();
			this.formData.get("password").updateValueAndValidity();
			this.formData.get("confirmPassword").clearValidators();
			this.formData.get("confirmPassword").updateValueAndValidity();
		}

		if (user) {
			this.formData.patchValue({
				_id: user._id,
				person: user.person,
				name: user.name,
				status: user.status,
				email: user.email,
				companies: user.companies,
				franchises: user.franchises,
			});

			this.formDataCompanies = [];
			if (user.companies && Array.isArray(user.companies)) {
				for await (const comp of user.companies) {
					const indexCompany = this.formDataCompanies.length;
					this.formDataCompanies[indexCompany] = new FormGroup({
						companies: new FormControl(comp, [Validators.required]),
					});
					this.formData
						.get("companies")
						.push(this.formDataCompanies[indexCompany]);
				}
			}

			this.formDataFranchises = [];
			if (user.franchises && Array.isArray(user.franchises)) {
				for await (const comp of user.franchises) {
					const indexFranchise = this.formDataFranchises.length;
					this.formDataFranchises[indexFranchise] = new FormGroup({
						franchises: new FormControl(comp, [Validators.required]),
					});
					this.formData
						.get("franchises")
						.push(this.formDataFranchises[indexFranchise]);
				}
			}
		}

		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-edit-user",
				size: "lg",
				backdrop: "static",
			})
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async upsertUser(user: User) {
		if (this.typeAction === "create") {
			// if (
			// 	this.userIsAdmin === false &&
			// 	(!user.companies ||
			// 		!Array.isArray(user.companies) ||
			// 		user.companies.length <= 0)
			// ) {
			// 	// se cadastrar sem vínculo com empresa uma franquia o usuário ficara sem víncul
			// 	this.toastr.warning(
			// 		"Vincule pelo menos uma empresa",
			// 		"Campo obrigatório!"
			// 	);
			// 	return;
			// }

			this.userService.createUser(user).subscribe(
				(data: any) => {
					this.getListUser(0, this.pageSize, undefined, undefined);
					this.modalService.dismissAll();
					this.toastr.success("Usuário criado com sucesso!", "Sucesso!");
					this.changeDetectorRefs.detectChanges();
				},
				(err) => {
					let message = "Erro ao criar User!";
					if (err.error && err.error.message) {
						message = err.error.message;
					}

					console.log("Falha ao cadastrar", err);
					this.toastr.error(message, "Falha!");
				}
			);
		} else {
			if (
				user.companies &&
				Array.isArray(user.companies) &&
				user.companies.length <= 0
			) {
				delete user.companies;
			}

			if (
				user.franchises &&
				Array.isArray(user.franchises) &&
				user.franchises.length <= 0
			) {
				delete user.franchises;
			}

			this.userService.updateUser(user).subscribe(
				(data: any) => {
					this.getListUser(0, this.pageSize, undefined, undefined);
					this.modalService.dismissAll();
					this.toastr.success("Usuário alterado com sucesso!", "Sucesso!");
					this.changeDetectorRefs.detectChanges();
				},
				(err) => {
					let message = "Erro ao alterar User!";
					if (err.error && err.error.message) {
						message = err.error.message;
					}

					console.error("Falha ao atualizar", err);
					this.toastr.error(message, "Falha!");
				}
			);
		}
	}

	async getListUser(pageIn, pageOut, personId, companyId) {
		const self = this;
		const ELEMENT_DATA = [];

		this.userService
			.getUserPaginator(pageIn, pageOut, personId, companyId)
			.subscribe((data: any) => {
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				if (data.list && Array.isArray(data.list)) {
					data.list.forEach((user, index) => {
						ELEMENT_DATA.push({
							_id: user._id,
							position: index + 1,
							person: user.person ? user.person : "-",
							name: user.name,
							status: user.status,
							email: user.email,
							password: user.password,
							confirmPassword: user.confirmPassword,
							companies: user.companies,
							franchises: user.franchises,
						});
					});
					self.dataSource = new MatTableDataSource(ELEMENT_DATA);
					self.totalLength = data.total;
					this.changeDetectorRefs.detectChanges();
				}
			});
	}

	ngAfterViewInit() {}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getListUser(event.pageIndex, event.pageSize, undefined, undefined);
	}

	async addNewCompany() {
		return new Promise(async (resolve, reject) => {
			const indexCompany = this.formDataCompanies.length;
			console.log(indexCompany);
			this.formDataCompanies[indexCompany] = new FormGroup({
				companies: new FormControl(undefined, [Validators.required]),
			});

			this.formDataCompanies[indexCompany]
				.get("companies")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					distinctUntilChanged(),
					switchMap((value) =>
						typeof value === "string" && value.length
							? this.companyService.getCompaniesNome(value)
							: []
					)
				)
				.subscribe((results) => {
					if (Array.isArray(results) && results.length > 0) {
						this.companiesList[indexCompany] = results;
					} else {
						this.companiesList[indexCompany] = [];
					}

					this.changeDetectorRefs.detectChanges();
				});

			this.formData.get("companies").push(this.formDataCompanies[indexCompany]);
			resolve(true);
		});
	}

	async addNewFranchise() {
		return new Promise(async (resolve, reject) => {
			const indexFranchise = this.formDataFranchises.length;

			this.formDataFranchises[indexFranchise] = new FormGroup({
				franchises: new FormControl(undefined, [Validators.required]),
			});

			this.formDataFranchises[indexFranchise]
				.get("franchises")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					distinctUntilChanged(),
					switchMap((value) =>
						typeof value === "string" && value.length
							? this.franchiseService.getFranchisesNome(value)
							: []
					)
				)
				.subscribe((results) => {
					if (Array.isArray(results)) {
						this.franchisesList[indexFranchise] = results;
					}
					this.changeDetectorRefs.detectChanges();
				});

			this.formData
				.get("franchises")
				.push(this.formDataFranchises[indexFranchise]);
			resolve(true);
		});
	}

	async removeCompany(index) {
		return new Promise(async (resolve, reject) => {
			await this.formData.get("companies").removeAt(index);

			resolve(true);
		});
	}

	async removeFranchise(index) {
		return new Promise(async (resolve, reject) => {
			await this.formData.get("franchises").removeAt(index);

			resolve(true);
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

	async onClickCompanyFilter(company) {
		await this.getListUser(0, this.pageSize, undefined, company._id);
	}

	async onClickPersonFilter(person) {
		await this.getListUser(0, this.pageSize, person._id, undefined);
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

	async confirmDeleteModalShow(content, user) {
		this.userIdToDelete = user._id;
		this.modalService
			.open(content, { ariaLabelledBy: "modal-delete-user", size: "sm" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async deleteUser() {
		if (!this.userIdToDelete) {
			this.toastr.error("Erro ao deletar User!", "Falha!");
			return;
		}
		await this.userService.deleteUser(this.userIdToDelete).toPromise();
		this.toastr.success("User deletado com sucesso!", "Sucesso!");
		this.userIdToDelete = undefined;
		await this.getListUser(0, this.pageSize, undefined, undefined);
	}
}
