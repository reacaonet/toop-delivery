import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../environments/environment";

import { queryString } from "../../views/util";

@Injectable({
	providedIn: "root",
})
export class DiscountService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	paginator(params = {}) {
		const query = queryString(params);

		return this.http.get(`${this.apiUrl}/v1/mobility/discount/paginator?${query}`, params);
	}

	create(params) {
		return this.http.post(`${this.apiUrl}/v1/mobility/discount`, params);
	}

	update(id, params) {
		return this.http.put(`${this.apiUrl}/v1/mobility/discount/${id}`, params);
	}
}
