import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../environments/environment";

import { SupportSubjects } from "./../../../models/mobility/supportSubjects";

import { queryString } from "../../views/util";

@Injectable({
	providedIn: "root",
})
export class SubjectService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	get() {
		return this.http.get(
			`${this.apiUrl}/mobility/supportsubjects/list?status=all`
		);
	}

	getGraphic() {
		return this.http.get(`${this.apiUrl}/mobility/supportsubjects/graphic`);
	}

	getPaginator(params = {}) {
		let filter = queryString(params);

		// filter += '&status=all';
		// if (subject) {
		// 	filter += `&subject=${subject}`;
		// }

		console.log("filter", filter);

		return this.http.get(
			`${this.apiUrl}/mobility/supportsubjects/paginator?${filter}`
		);
	}

	getNome(subject) {
		if (subject === "") {
			subject = "null";
		} else if (subject && typeof subject === "string") {
			subject = subject.trim();
		}
		return this.http.get(
			`${this.apiUrl}/mobility/supportsubjects/search?search=${subject}`
		);
	}

	create(data: SupportSubjects) {
		return this.http.post(`${this.apiUrl}/mobility/supportsubjects`, data);
	}

	update(data: SupportSubjects) {
		return this.http.put(
			`${this.apiUrl}/mobility/supportsubjects/${data._id}`,
			data
		);
	}

	delete(id) {
		return this.http.delete(`${this.apiUrl}/mobility/supportsubjects/${id}`);
	}
}
