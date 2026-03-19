import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../environments/environment";

import { Type } from "./../../../models/email/type";

@Injectable({
	providedIn: "root",
})
export class TemplateService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	get() {
		return this.http.get(`${this.apiUrl}/emails/templates`);
	}

	getVariables() {
		return this.http.get(`${this.apiUrl}/emails/variables`);
	}

	create(term: Type) {
		return this.http.post(`${this.apiUrl}/emails/templates`, term);
	}

	update(term: Type) {
		return this.http.put(`${this.apiUrl}/emails/templates/${term._id}`, term);
	}

	delete(id) {
		return this.http.delete(`${this.apiUrl}/emails/templates/${id}`);
	}
}
