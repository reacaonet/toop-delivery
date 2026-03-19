import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../environments/environment";

import { queryString } from "../../util";

@Injectable({
	providedIn: "root",
})
export class TimeZoneService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	get(params = {}) {
		let filter = queryString(params);
		return this.http.get(`${this.apiUrl}/setting/timezone${filter}`);
	}
}
