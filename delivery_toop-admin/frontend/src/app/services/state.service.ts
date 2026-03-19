import { environment } from "./../../environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
	providedIn: "root",
})
export class StateService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	getState() {
		return this.http.get(`${this.apiUrl}/setting/state`);
	}

	getStatesNome(name) {
		if (name === "") {
			name = "null";
		} else if (name && typeof name === "string") {
			name = name.trim();
		}
		return this.http.get(
			`${this.apiUrl}/setting/state/listPorNome?listPorNome=${name}`
		);
	}
}
