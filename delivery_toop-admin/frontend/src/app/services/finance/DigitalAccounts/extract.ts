import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../../environments/environment";

import { queryString } from "../../../util";

@Injectable({
	providedIn: "root",
})
export class ExtractService {
	apiUrl = `${environment.apiURL}/finance/digital-accounts/extract`;

	constructor(private http: HttpClient) {}

	getPaginator(pageIn, pageOut, params = {}) {
		const getQuery = queryString(params);

		return this.http.get(
			`${this.apiUrl}/paginator?pageIn=${pageIn}&pageOut=${pageOut}&${getQuery}`
		);
	}

	getBalance(params = {}) {
		const getQuery = queryString(params);

		return this.http.get(`${this.apiUrl}/balance?${getQuery}`);
	}

	getBalancePaginate(pageIn, pageOut, params = {}) {
		const getQuery = queryString(params);

		return this.http.get(
			`${environment.apiURL}/finance/balances/paginator?pageIn=${pageIn}&pageOut=${pageOut}&${getQuery}`
		);
	}
}
