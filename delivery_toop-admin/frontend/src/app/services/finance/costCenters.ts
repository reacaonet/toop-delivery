import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../environments/environment";

import { CostCenters } from "./../../../models/finance/CostCenters";

@Injectable({
	providedIn: "root",
})
export class CostCentersService {
	apiUrl = `${environment.apiURL}/finance/cost-centers`;

	constructor(private http: HttpClient) {}

	getAll() {
		return this.http.get(`${this.apiUrl}/`);
	}

	getPaginator(pageIn, pageOut, name) {
		let filter = "";

		filter += "&status=all";
		if (name) {
			filter += `&name=${name}`;
		}

		return this.http.get(
			`${this.apiUrl}/paginator?pageIn=${pageIn}&pageOut=${pageOut}${filter}`
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
		return this.http.get(`${this.apiUrl}/search?search=${name}${filter}`);
	}

	create(data: CostCenters) {
		return this.http.post(`${this.apiUrl}/`, data);
	}

	update(data: CostCenters) {
		return this.http.put(`${this.apiUrl}/${data._id}`, data);
	}

	delete(id) {
		return this.http.delete(`${this.apiUrl}/${id}`);
	}
}
