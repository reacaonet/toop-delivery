import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../environments/environment";

import { CashbackCampaign } from "./../../../models/cashback/cashbackCampaign";

@Injectable({
	providedIn: "root",
})
export class CashbackCampaignService {
	apiUrl = `${environment.apiURL}/cashback`;

	constructor(private http: HttpClient) {}

	getAll() {
		return this.http.get(`${this.apiUrl}/campaigns`);
	}

	getPaginator(pageIn, pageOut, name) {
		let filter = "";

		filter += "&status=all";
		if (name) {
			filter += `&name=${name}`;
		}

		return this.http.get(
			`${this.apiUrl}/campaigns/paginator?pageIn=${pageIn}&pageOut=${pageOut}${filter}`
		);
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
		return this.http.get(
			`${this.apiUrl}/campaigns/search?search=${name}${filter}`
		);
	}

	create(data: any) {
		return this.http.post(`${this.apiUrl}/campaigns`, data);
	}

	update(data: any) {
		return this.http.put(`${this.apiUrl}/campaigns/${data._id}`, data);
	}

	delete(id) {
		return this.http.delete(`${this.apiUrl}/campaigns/${id}`);
	}

	historicCashRegister(pageIn, pageOut, campaign = "") {
		return this.http.get(
			`${this.apiUrl}/used/paginator?pageIn=${pageIn}&pageOut=${pageOut}&campaign=${campaign}`
		);
	}
}
