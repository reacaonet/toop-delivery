import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../environments/environment";

import { queryString } from "../../util";

@Injectable({
	providedIn: "root",
})
export class FinanceService {
	apiUrl = `${environment.apiURL}`;

	constructor(private http: HttpClient) {}

	getPaginator(pageIn, pageOut, params = {}) {
		const getQuery = queryString(params);

		return this.http.get(
			`${this.apiUrl}/finance/balances/paginator?pageIn=${pageIn}&pageOut=${pageOut}&${getQuery}`
		);
	}

	getIndicators(params) {
		const getQuery = queryString(params);

		return this.http.get(`${this.apiUrl}/finance/balances/list?${getQuery}`);
	}

	getReportAdm(pageIn, pageOut, params = {}) {
		const getQuery = queryString(params);

		return this.http.get(
			`${this.apiUrl}/finance/balances/adm/paginator?pageIn=${pageIn}&pageOut=${pageOut}&${getQuery}`
		);
	}

	getBalanceAdm(params) {
		const getQuery = queryString(params);

		return this.http.get(
			`${this.apiUrl}/finance/balances/adm/balance?${getQuery}`
		);
	}

	getReportFranchise(pageIn, pageOut, params = {}) {
		const getQuery = queryString(params);

		return this.http.get(
			`${this.apiUrl}/finance/balances/franchise/paginator?pageIn=${pageIn}&pageOut=${pageOut}&${getQuery}`
		);
	}

	getBalanceFranchise(params) {
		const getQuery = queryString(params);

		return this.http.get(
			`${this.apiUrl}/finance/balances/franchise/balance?${getQuery}`
		);
	}

	getReportCompany(pageIn, pageOut, params = {}) {
		const getQuery = queryString(params);

		return this.http.get(
			`${this.apiUrl}/finance/balances/company/paginator?pageIn=${pageIn}&pageOut=${pageOut}&${getQuery}`
		);
	}

	getBalanceCompany(params) {
		const getQuery = queryString(params);

		return this.http.get(
			`${this.apiUrl}/finance/balances/company/balance?${getQuery}`
		);
	}

	deliveriesBalance(pageIn, pageOut, params) {
		const getQuery = queryString(params);
		return this.http.get(
			`${this.apiUrl}/finance/balances/deliveries/paginator?pageIn=${pageIn}&pageOut=${pageOut}&${getQuery}`
		);
	}

	setCheckPayment(params) {
		return this.http.post(
			`${this.apiUrl}/finance/balances/adm/balance/check-franchise`,
			params
		);
	}

	paymentChargeback(params) {
		return this.http.post(`${this.apiUrl}/finance/chargeback`, params);
	}
}
