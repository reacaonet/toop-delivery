// Angular
import { Injectable } from "@angular/core";
import {
	HttpEvent,
	HttpInterceptor,
	HttpHandler,
	HttpRequest,
	HttpResponse,
} from "@angular/common/http";

// RxJS
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

// NGRX
import { select, Store } from "@ngrx/store";

import { AppState } from "../../../../core/reducers";
import { User, Company, Logout } from "../../../../core/auth";

/**
 * More information there => https://medium.com/@MetonymyQT/angular-http-interceptors-what-are-they-and-how-to-use-them-52e060321088
 */
@Injectable()
export class InterceptService implements HttpInterceptor {
	userLogged: User;
	userCompany: Company;

	constructor() {}

	// intercept request and add token
	intercept(
		request: HttpRequest<any>,
		next: HttpHandler
	): Observable<HttpEvent<any>> {
		const headersOptions: any = {};

		this.userCompany = localStorage.getItem("@company-main")
			? JSON.parse(localStorage.getItem("@company-main"))
			: undefined;
		this.userLogged = localStorage.getItem("@user-logged")
			? JSON.parse(localStorage.getItem("@user-logged"))
			: undefined;

		if (this.userLogged && this.userLogged.accessToken) {
			headersOptions.Authorization = `Bearer ${this.userLogged.accessToken}`;
		}

		if (this.userCompany && this.userCompany._id) {
			headersOptions.Company = this.userCompany._id;
		}

		// tslint:disable-next-line:no-debugger
		// modify request
		request = request.clone({
			setHeaders: headersOptions,
		});

		return next.handle(request).pipe(
			tap(
				(event) => {
					if (event instanceof HttpResponse) {
					}
				},
				(error) => {
					if (error.status === 401) {
					}

					console.error(error.status);
					console.error(error.message);
				}
			)
		);
	}
}
