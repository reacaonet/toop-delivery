import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../../environments/environment";

import { Account } from "./../../../../models/finance/DigitalAccounts/account";

@Injectable({
	providedIn: "root",
})
export class AccountService {
	apiUrl = `${environment.apiURL}/finance/digital-accounts/accounts`;

	constructor(private http: HttpClient) {}

	getAll() {
		return this.http.get(`${this.apiUrl}/list?status=all`);
	}

	getPaginator(pageIn, pageOut, name?: string) {
		let filter = "";

		filter += "&status=all";
		if (name) {
			filter += `&name=${name}`;
		}

		return this.http.get(
			`${this.apiUrl}/paginator?pageIn=${pageIn}&pageOut=${pageOut}${filter}`
		);
	}

	getByAgency(agency) {
		return this.http.get(`${this.apiUrl}/search?agency=${agency}`);
	}

	getByNome(name, user = undefined) {
		let filter = "";
		if (name === "") {
			name = "null";
		} else if (name && typeof name === "string") {
			name = name.trim();
		}

		if (user) {
			filter += `&user=${user}`;
		}
		return this.http.get(`${this.apiUrl}/search?search=${name}${filter}`);
	}

	create(data: any) {
		return this.http.post(`${this.apiUrl}/`, data);
	}

	update(data: any) {
		return this.http.put(`${this.apiUrl}/${data._id}`, data);
	}

	delete(id) {
		return this.http.delete(`${this.apiUrl}/${id}`);
	}
}
