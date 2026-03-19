import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../environments/environment";

import { queryString } from "../../util";

@Injectable({
	providedIn: "root",
})
export class VehicleDocumentsService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	getPaginator(params = {}) {
		const filter = queryString(params);

		return this.http.get(
			`${this.apiUrl}/mobility/vehicle-documents/paginator?${filter}`
		);
	}

	updateVehicle(id, params) {
		return this.http.put(
			`${this.apiUrl}/mobility/vehicle-documents/${id}`,
			params
		);
	}
}
