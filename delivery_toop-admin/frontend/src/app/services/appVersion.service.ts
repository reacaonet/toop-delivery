import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../environments/environment";

import { City } from "./../../models/city";

@Injectable({
	providedIn: "root",
})
export class AppVersionService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	getVersion() {
		return this.http.get(`${this.apiUrl}/setting/app-versions`);
	}

	createVersion(city: City) {
		return this.http.post(`${this.apiUrl}/setting/app-versions`, city);
	}
}
