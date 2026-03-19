import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";

import { queryString } from "../util";

@Injectable({
	providedIn: "root",
})
export class CustomerService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	getCustomer() {
		return this.http.get(`${this.apiUrl}/customer/list`);
	}

	getCustomerAddress(id: string) {
		return this.http.get(`${this.apiUrl}/customer/delivery-address/${id}`);
	}

	getCustomerSearchWithPerson(PersonId: string) {
		return this.http.get(`${this.apiUrl}/customer/search?person=${PersonId}`);
	}

	getCustomerSearch(params: any) {
		const getQuery = queryString(params);
		return this.http.get(`${this.apiUrl}/customer/search-customer?${getQuery}`);
	}

	getCustomerNome(name) {
		if (name === "") {
			name = "null";
		} else if (name && typeof name === "string") {
			name = name.trim();
		}
		return this.http.get(
			`${this.apiUrl}/customer/listPorNome?listPorNome=${name}`
		);
	}

	getGraphicCreated() {
		return this.http.get(`${this.apiUrl}/v2/report/customer/new-registration`);
	}

	getSearchPersonCustomer(value) {
		return this.http.get(
			`${this.apiUrl}/customer/search-person-customer?name=${value}`
		);
	}
}
