import {
	Component,
	Input,
	OnInit,
	ChangeDetectorRef,
	AfterViewInit,
} from "@angular/core";
import { Observable } from "rxjs";
import { select, Store } from "@ngrx/store";
import { Router } from "@angular/router";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { AppState } from "../../../../../core/reducers";
import {
	currentUser,
	Logout,
	User,
	Company,
	currentCompanyMain,
	UserLoaded,
} from "../../../../../core/auth";
import { UserService } from "./../../../../../services/user.service";

@Component({
	selector: "kt-user-profile",
	templateUrl: "./user-profile.component.html",
})
export class UserProfileComponent implements OnInit, AfterViewInit {
	user$: Observable<User>;
	companyMain$: Observable<Company>;
	franchise$: string;
	franchises$ = [];
	company$: any;
	companies$ = [];
	isRoot$: Boolean = false;

	@Input() avatar = true;
	@Input() greeting = true;
	@Input() badge: boolean;
	@Input() icon: boolean;

	formData;
	formSubmit = false;
	myControl: FormControl = new FormControl();

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private router: Router,
		private store: Store<AppState>,
		private userService: UserService,
		private modalService: NgbModal,
		private toastr: ToastrService
	) {}

	ngOnInit(): void {}

	async addNewFormData() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),
				email: new FormControl("", [Validators.required]),
				name: new FormControl("", [Validators.required]),
				newPassword: new FormControl("", [Validators.required]),
				confirmPassword: new FormControl("", [Validators.required]),
				currentPassword: new FormControl("", [Validators.required]),
			});
			resolve(true);
		});
	}

	ngAfterViewInit(): void {
		setTimeout(async () => {
			this.user$ = this.store.pipe(select(currentUser));
			this.companyMain$ = this.store.pipe(select(currentCompanyMain));

			let user: User = JSON.parse(localStorage.getItem("@user-info"));

			this.isRoot$ = user.isRoot;
			this.franchise$ = user.franchise ? user.franchise : "";
			this.company$ = user.company ? user.company : "";

			this.getFranchises();
			this.getCompany();
		}, 1500);
	}

	async getFranchises() {
		const user = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;
		if (user.franchises) {
			if (user.franchises.length > 0) {
				this.franchises$ = user.franchises;
			} else {
				this.franchises$ = [];
			}
		} else {
			this.franchises$ = [];
		}

		this.changeDetectorRefs.detectChanges();
	}

	onChangeFranchise(_id) {
		let user: User = JSON.parse(localStorage.getItem("@user-info"));
		user.franchise = _id;

		localStorage.removeItem("@user-info");
		localStorage.setItem("@user-info", JSON.stringify(user));

		this.userService
			.updateSelectedFranchise({ ...user, franchise: user.franchise })
			.subscribe(
				(data: any) => {
					localStorage.removeItem("@user-info");
					localStorage.setItem("@user-info", JSON.stringify(user));
					location.href = "/dashboard";
				},
				(error) => console.error(error)
			);
	}

	async getCompany() {
		const user = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;
		if (user.companies) {
			if (user.companies.length > 0) {
				this.companies$ = user.companies;
			} else {
				this.companies$ = [];
			}
		} else {
			this.companies$ = [];
		}

		this.changeDetectorRefs.detectChanges();
	}

	onChangeCompany(_id) {
		let user: User = JSON.parse(localStorage.getItem("@user-info"));
		let companyStorage = JSON.parse(localStorage.getItem("@company-main"));
		user.company = _id;
		companyStorage._id = _id;

		localStorage.removeItem("@user-info");
		localStorage.setItem("@user-info", JSON.stringify(user));
		localStorage.setItem("@company-main", JSON.stringify(companyStorage));

		this.userService
			.updateSelectedCompany({ ...user, company: user.company })
			.subscribe(
				(data: any) => {
					console.log("data", data);

					localStorage.removeItem("@user-info");
					localStorage.setItem("@user-info", JSON.stringify(user));
					location.href = "/dashboard";
				},
				(error) => console.error(error)
			);
	}

	logout() {
		this.store.dispatch(new Logout());
	}

	async editUserModalShow(content) {
		this.formSubmit = false;
		await this.addNewFormData();

		let user: User = JSON.parse(localStorage.getItem("@user-info"));

		this.formData.patchValue({
			_id: user._id,
			email: user.email,
			newPassword: "",
			confirmPassword: "",
			currentPassword: "",
			name: user.name,
		});

		this.modalService
			.open(content, { ariaLabelledBy: "modal-edit-user", size: "md" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async updateUser(data: any) {
		data.username = data.email;

		if (data.newPassword === data.confirmPassword) {
			this.userService.changeUser(data).subscribe(
				(data: any) => {
					let user: User = JSON.parse(localStorage.getItem("@user-info"));
					user.email = data.email;
					user.username = data.email;
					user.name = data.name;

					localStorage.removeItem("@user-info");
					localStorage.setItem("@user-info", JSON.stringify(user));

					this.changeDetectorRefs.detectChanges();
					this.formData.reset();
					this.modalService.dismissAll();
					this.toastr.success("Usuário alterado com sucesso!", "Sucesso!");
				},
				(error) => {
					if (error.status === 400) {
						this.toastr.error(error.error.message, "Falha!");
					} else {
						this.toastr.error("Erro ao alterar Usuário!", "Falha!");
					}
				}
			);
		} else {
			this.toastr.error(
				"Confirmação de senha não é igual a nova senha!",
				"Falha!"
			);
		}
	}
}
