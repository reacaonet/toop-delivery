import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../environments/environment";

import { PeakHour } from "./../../../models/mobility/peakHour";
import { queryString } from "./../../util";

@Injectable({
	providedIn: "root",
})
export class PeakHourService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	get(params) {
		params.status = "all";

		return this.http.get(
			`${this.apiUrl}/mobility/peakhours/list?${queryString(params)}`
		);
	}

	getGraphic() {
		return this.http.get(`${this.apiUrl}/mobility/peakhours/graphic`);
	}

	getPaginator(pageIn, pageOut) {
		let filter = "";

		filter += "&status=all";

		return this.http.get(
			`${this.apiUrl}/mobility/peakhours/paginator?pageIn=${pageIn}&pageOut=${pageOut}${filter}`
		);
	}

	create(data: PeakHour) {
		return this.http.post(`${this.apiUrl}/mobility/peakhours`, data);
	}

	update(data: PeakHour) {
		return this.http.put(`${this.apiUrl}/mobility/peakhours/${data._id}`, data);
	}

	delete(id) {
		return this.http.delete(`${this.apiUrl}/mobility/peakhours/${id}`);
	}
}
