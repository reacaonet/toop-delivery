// Angular
import { Injectable } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
// RxJS
import { filter, mergeMap, tap, withLatestFrom } from "rxjs/operators";
import { defer, Observable, of } from "rxjs";
// NGRX
import { Actions, Effect, ofType } from "@ngrx/effects";
import { Action, select, Store } from "@ngrx/store";

import { NgxPermissionsService } from "ngx-permissions";
// Auth actions
import {
	AuthActionTypes,
	Login,
	Logout,
	Register,
	UserLoaded,
	UserRequested,
	CompanyMain,
} from "../_actions/auth.actions";
import { AuthService } from "../_services/index";
import { AppState } from "../../reducers";
import { environment } from "../../../../environments/environment";
import { isUserLoaded } from "../_selectors/auth.selectors";

@Injectable()
export class AuthEffects {
	@Effect({ dispatch: false })
	login$ = this.actions$.pipe(
		ofType<Login>(AuthActionTypes.Login),
		tap((action) => {
			localStorage.setItem(environment.authTokenKey, action.payload.authToken);
			this.store.dispatch(new UserRequested());
		})
	);

	@Effect({ dispatch: false })
	logout$ = this.actions$.pipe(
		ofType<Logout>(AuthActionTypes.Logout),
		tap(() => {
			localStorage.removeItem(environment.authTokenKey);
			localStorage.removeItem("@user-logged");
			localStorage.removeItem("@user-info");
			localStorage.removeItem("@company-main");
			this.router.navigate(["/auth/login"], {
				queryParams: { returnUrl: this.returnUrl },
			});
		})
	);

	@Effect({ dispatch: false })
	register$ = this.actions$.pipe(
		ofType<Register>(AuthActionTypes.Register),
		tap((action) => {
			localStorage.setItem(environment.authTokenKey, action.payload.authToken);
		})
	);

	@Effect({ dispatch: false })
	loadUser$ = this.actions$.pipe(
		ofType<UserRequested>(AuthActionTypes.UserRequested),
		withLatestFrom(this.store.pipe(select(isUserLoaded))),
		filter(([action, _isUserLoaded]) => !_isUserLoaded),
		mergeMap(([action, _isUserLoaded]) => this.auth.getUserByToken()),
		tap(
			(_user) => {
				let listPer = [];

				if (_user) {
					// Company Main
					localStorage.setItem("@user-logged", JSON.stringify(_user));
					if (_user.company) {
						localStorage.setItem(
							"@company-main",
							JSON.stringify(_user.company)
						);
						this.store.dispatch(
							new CompanyMain({ companyMain: _user.company })
						);
					}
					this.store.dispatch(new UserLoaded({ user: _user }));
					// this.permissionsService.flushPermissions();
					const data: any = _user;
					if (data.permissions && Array.isArray(data.permissions)) {
						// data.permissions.forEach((pm) => this.permissionsService.addPermission(pm.name));
						data.permissions.forEach((pm) => listPer.push(pm.name));
						this.permissionsService.loadPermissions(listPer);
					}
				} else {
					localStorage.removeItem(environment.authTokenKey);
					localStorage.removeItem("@user-logged");
					localStorage.removeItem("@user-info");
					localStorage.removeItem("@company-main");
					// this.permissionsService.flushPermissions();
					this.store.dispatch(new Logout());
				}
			},
			(error) => {
				localStorage.removeItem(environment.authTokenKey);
				localStorage.removeItem("@user-logged");
				localStorage.removeItem("@user-info");
				localStorage.removeItem("@company-main");
				this.router.navigate(["/auth/login"], {});
			}
		)
	);

	@Effect()
	init$: Observable<Action> = defer(() => {
		const userToken = localStorage.getItem(environment.authTokenKey);
		let observableResult = of({ type: "NO_ACTION" });
		if (userToken) {
			observableResult = of(new Login({ authToken: userToken }));
		}
		return observableResult;
	});

	private returnUrl: string;

	constructor(
		private actions$: Actions,
		private router: Router,
		private auth: AuthService,
		private permissionsService: NgxPermissionsService,
		private store: Store<AppState>
	) {
		this.router.events.subscribe((event) => {
			if (event instanceof NavigationEnd) {
				this.returnUrl = event.url;
			}
		});
	}
}
