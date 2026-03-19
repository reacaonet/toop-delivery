import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { environment } from "../../environments/environment";

@Injectable({
	providedIn: "root",
})
export class AccessFlowService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	getAccessFlow() {
		return this.http.get(`${this.apiUrl}/acess-flow/list`);
	}

	getUniqueAccessFlow(days: number) {
		return this.http.get(`${this.apiUrl}/acess-flow/statistic?timeInterval=${days}`);
	}
}
