import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "./../../../environments/environment";
import { queryString } from "../../util";

@Injectable({
	providedIn: "root",
})
export class EvaluationService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	get() {
		return this.http.get(`${this.apiUrl}/mobility/passengers`);
	}

	evaluationPassengerPaginator(pageIn, pageOut, filter = {}) {
		const getQuery = queryString(filter);

		return this.http.get(
			`${this.apiUrl}/mobility/evaluation?pageIn=${pageIn}&pageOut=${pageOut}&${getQuery}`
		);
	}

	evaluationDriverPaginator(pageIn, pageOut, filter = {}) {
		const getQuery = queryString(filter);

		return this.http.get(
			`${this.apiUrl}/mobility/evaluation/driver/paginator?pageIn=${pageIn}&pageOut=${pageOut}&${getQuery}`
		);
	}
}
