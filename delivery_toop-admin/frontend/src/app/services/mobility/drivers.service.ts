import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../environments/environment";

import { Drivers } from "./../../../models/mobility/drivers";

@Injectable({
	providedIn: "root",
})
export class DriversService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	get() {
		return this.http.get(`${this.apiUrl}/mobility/drivers`);
	}

	getPaginator(
		pageIn,
		pageOut,
		franchiseId,
		name = null,
		online = null,
		approved = null
	) {
		let filter = "";

		if (franchiseId) {
			filter += `&franchise=${franchiseId}`;
		}

		if (name) {
			filter += `&name=${name}`;
		}
		if (online == "true" || online == "false") {
			filter += `&online=${online}`;
		}
		if (approved == "true" || approved == "false") {
			filter += `&approved=${approved}`;
		}

		return this.http.get(
			`${this.apiUrl}/mobility/drivers/paginator?pageIn=${pageIn}&pageOut=${pageOut}${filter}`
		);
	}

	create(data: Drivers) {
		return this.http.post(`${this.apiUrl}/mobility/drivers`, data);
	}

	update(data: Drivers) {
		return this.http.put(`${this.apiUrl}/mobility/drivers/${data._id}`, data);
	}

	delete(id) {
		return this.http.delete(`${this.apiUrl}/mobility/drivers/${id}`);
	}
}
