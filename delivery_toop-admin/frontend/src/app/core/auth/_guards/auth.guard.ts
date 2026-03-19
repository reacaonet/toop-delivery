// Angular
import { Injectable } from "@angular/core";
import {
	ActivatedRouteSnapshot,
	CanActivate,
	Router,
	RouterStateSnapshot,
} from "@angular/router";
// RxJS
import { Observable, Subscription } from "rxjs";
import { tap } from "rxjs/operators";
// NGRX
import { select, Store } from "@ngrx/store";
// Auth reducers and selectors
import { AppState } from "../../../core/reducers/";
import { isLoggedIn } from "../_selectors/auth.selectors";
import { NgxPermissionsService } from "ngx-permissions";

import { currentUserPermissions, Permission } from "../../auth";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private store: Store<AppState>,
		private router: Router,
		private permissionsService: NgxPermissionsService
	) {}

	private currentUserPermissions$: Observable<Permission[]>;
	private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean> {
		return this.store.pipe(
			select(isLoggedIn),
			tap((loggedIn) => {
				this.loadRolesWithPermissions();
				if (!loggedIn) {
					this.router.navigateByUrl("/auth/login");
				}
			})
		);
	}

	loadRolesWithPermissions() {
		this.currentUserPermissions$ = this.store.pipe(
			select(currentUserPermissions)
		);
		let listPer = [];

		const subscr = this.currentUserPermissions$.subscribe((res) => {
			try {
				if (!res || res.length === 0) {
					const companyStorage = localStorage.getItem("@company-main")
						? JSON.parse(localStorage.getItem("@company-main"))
						: undefined;

					const userStorage = localStorage.getItem("@user-info")
						? JSON.parse(localStorage.getItem("@user-info"))
						: undefined;

					// Redirect user to login
					if (!userStorage) {
						this.router.navigateByUrl("/auth/login");
					}

					//if (companyStorage && companyStorage.type) {
					if (userStorage?.isRoot) {
						listPer = ["accessToGlobal", "accessToRoot"];
					} else if (userStorage?.franchises?.length > 0) {
						listPer = ["accessToGlobal", "accessToFranchises"];
					} else {
						// Type permissions to User
						let typePermissions = companyStorage?.shoppingFlow || "MENU";

						if (!companyStorage?.shoppingFlow) {
							switch (companyStorage?.type) {
								case "restaurant":
									typePermissions = "MENU";
									break;
								case "supermarket":
									typePermissions = "PRODUCT";
									break;
								default:
									break;
							}
						}

						switch (typePermissions) {
							case "MENU":
								listPer = [
									"accessToCompanyDelivery",
									"accessToReportFinance",
									"accessToFoodMenu",
									"accessToFoodOrders",
									"accessToHoursCompany",
									"accessToTransactions",
									"accessToGraphicStudioSettings",
								];
								break;
							case "PRODUCT":
								listPer = [
									"accessToCompanyDelivery",
									"accessToReportFinance",
									"accessToRegisterProduct",
									"accessToMarketOrders",
									"accessToHoursCompany",
									"accessToTransactions",
									"accessToGraphicStudioSettings",
								];
								break;
							default:
								break;
						}
					}
					//}

					// this.permissionsService.flushPermissions();
					// listPer.forEach((pm: Permission) => this.permissionsService.addPermission(pm.name));

					this.permissionsService.loadPermissions(listPer);
					return;
				}

				// this.permissionsService.flushPermissions();
				// res.forEach((pm: Permission) => this.permissionsService.addPermission(pm.name));
				res.forEach((pm: Permission) => listPer.push(pm.name));
				this.permissionsService.loadPermissions(listPer);
			} catch (err) {
				console.log("Hey fail ... ", err);
				this.permissionsService.flushPermissions();
			}
		});
		this.unsubscribe.push(subscr);
	}
}
