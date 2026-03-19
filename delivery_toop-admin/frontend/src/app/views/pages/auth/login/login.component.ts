import {
	ChangeDetectorRef,
	Component,
	OnDestroy,
	OnInit,
	ViewEncapsulation,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable, Subject } from "rxjs";
import { finalize, takeUntil, tap } from "rxjs/operators";
import { NgxPermissionsService } from "ngx-permissions";
import { environment } from "../../../../../environments/environment";

// Translate
import { TranslateService } from "@ngx-translate/core";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../core/reducers";
import { AuthNoticeService, AuthService, Login } from "../../../../core/auth";
// User
import { User } from "./../../../../../models/user";
import { UserService } from "../../../../services/user.service";

/**
 * ! Just example => Should be removed in development
 */
const DEMO_PARAMS = {
	// EMAIL: 'admin@demo.com',
	EMAIL: "",
	PASSWORD: "",
};

@Component({
	selector: "kt-login",
	templateUrl: "./login.component.html",
	encapsulation: ViewEncapsulation.None,
})
export class LoginComponent implements OnInit, OnDestroy {
	// Public params
	loginForm: FormGroup;
	loading = false;
	isLoggedIn$: Observable<boolean>;
	errors: any = [];

	private unsubscribe: Subject<any>;

	private returnUrl: any;

	constructor(
		private auth: AuthService,
		private authNoticeService: AuthNoticeService,
		private cdr: ChangeDetectorRef,
		private fb: FormBuilder,
		private permissionsService: NgxPermissionsService,
		private route: ActivatedRoute,
		private router: Router,
		private store: Store<AppState>,
		private translate: TranslateService,
		private userService: UserService
	) {
		this.unsubscribe = new Subject();
	}

	ngOnInit(): void {
		this.initLoginForm();

		// redirect back to the returnUrl before login
		this.route.queryParams.subscribe((params) => {
			// this.returnUrl = params.returnUrl || "/dashboard";
			this.returnUrl = "/dashboard";
		});
	}

	ngOnDestroy(): void {
		this.authNoticeService.setNotice(null);
		this.unsubscribe.next();
		this.unsubscribe.complete();
		this.loading = false;
	}

	initLoginForm() {
		// demo message to show
		// if (!this.authNoticeService.onNoticeChanged$.getValue()) {
		//   const initialNotice = `Use your account and password to continue.`;
		//   this.authNoticeService.setNotice(initialNotice, 'info');
		// }

		this.loginForm = this.fb.group({
			email: [
				DEMO_PARAMS.EMAIL,
				Validators.compose([
					Validators.required,
					Validators.email,
					Validators.minLength(3),
					Validators.maxLength(320), // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
				]),
			],
			password: [
				DEMO_PARAMS.PASSWORD,
				Validators.compose([
					Validators.required,
					Validators.minLength(3),
					Validators.maxLength(100),
				]),
			],
		});
	}

	/**
	 * Update permission
	 */
	refreshPermissionsUser(user) {
		let listPer = [];
		console.log("Refres permission");

		this.permissionsService.flushPermissions();
		if (user.permissions && Array.isArray(user.permissions)) {
			// user.forEach((pm) => this.permissionsService.addPermission(pm.name));
			user.forEach((pm) => listPer.push(pm.name));
			this.permissionsService.loadPermissions(listPer);
		}
	}

	/**
	 * Form Submit
	 */
	submit() {
		const controls = this.loginForm.controls;
		/** check form */
		if (this.loginForm.invalid) {
			Object.keys(controls).forEach((controlName) =>
				controls[controlName].markAsTouched()
			);
			return;
		}

		this.loading = true;
		localStorage.removeItem(environment.authTokenKey);
		localStorage.removeItem("@user-logged");
		localStorage.removeItem("@user-info");
		localStorage.removeItem("@company-main");

		const authData: User = {
			email: controls.email.value,
			password: controls.password.value,
			type: "admin",
		};

		this.userService
			.auth(authData)
			.pipe(
				tap(async (user: any) => {
					const userData: any = user;
					if (user && userData.code !== 401) {
						localStorage.setItem("@user-info", JSON.stringify(user.user));
						this.store.dispatch(new Login({ authToken: user.accessToken }));
						setTimeout(() => {
							this.loading = false;
							location.href = "/dashboard";
						}, 4000);
					} else if (
						userData &&
						userData.code &&
						Number(userData.code || 0) === 401
					) {
						let message = this.translate.instant(
							"AUTH.VALIDATION.INVALID_LOGIN"
						);

						if (userData && userData.message) {
							message = userData.message;
						}

						this.loading = false;
						this.authNoticeService.setNotice(message, "danger");
					} else {
						this.loading = false;
					}
				}),
				takeUntil(this.unsubscribe),
				finalize(() => {
					this.cdr.markForCheck();
				})
			)
			.subscribe();
	}

	/**
	 * Checking control validation
	 *
	 * @param controlName: string => Equals to formControlName
	 * @param validationType: string => Equals to valitors name
	 */
	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.loginForm.controls[controlName];
		if (!control) {
			return false;
		}

		const result =
			control.hasError(validationType) && (control.dirty || control.touched);
		return result;
	}
}
