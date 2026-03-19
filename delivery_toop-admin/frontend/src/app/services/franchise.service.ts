import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../environments/environment";

import { Franchise } from "./../../models/franchise";

import { queryString } from "../util";

@Injectable({
	providedIn: "root",
})
export class FranchiseService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) { }

	getfranchises(params: any = {}) {
		if (!params.status) {
			params.status = "all";
		}

		const query = queryString(params);

		// console.log('listar franquia', `${this.apiUrl}/franchises/list?${query}`)
		return this.http.get(`${this.apiUrl}/franchises/list?${query}`);
	}

	getOneFranchises(id: string) {
		return this.http.get(`${this.apiUrl}/franchises/${id}`);
	}

	getByUser(p, name = "") {
		let filter = "";

		if (name) {
			filter += `&name=${name}`;
		}

		return this.http.get(
			`${this.apiUrl}/franchises/list?status=true&user=${p}${filter}`
		);
	}

	getGraphicFranchises() {
		return this.http.get(`${this.apiUrl}/franchises/graphic`);
	}

	getFranchisesPaginator(pageIn, pageOut, name) {
		let filter = "";

		filter += "&status=all";
		if (name) {
			filter += `&name=${name}`;
		}

		return this.http.get(
			`${this.apiUrl}/franchises/paginator?pageIn=${pageIn}&pageOut=${pageOut}${filter}`
		);
	}

	getFranchisesNome(name, user = undefined) {
		let filter = "";
		if (name === "") {
			name = "null";
		} else if (name && typeof name === "string") {
			name = name.trim();
		}

		if (user) {
			filter += `&user=${user}`;
		}
		return this.http.get(
			`${this.apiUrl}/franchises/search?search=${name}${filter}`
		);
	}

	getLocFranchise(latitude, longitude) {
		return this.http.get(
			`${this.apiUrl}/franchises/lat/${latitude}/lng/${longitude}`
		);
	}

	createFranchise(franchise: Franchise) {
		return this.http.post(`${this.apiUrl}/franchises`, franchise);
	}

	updateFranchise(franchise: Partial<Franchise> & { [P in keyof Pick<Franchise, '_id'>]-?: Franchise[P] }) {
		return this.http.put(
			`${this.apiUrl}/franchises/${franchise._id}`,
			franchise
		);
	}

	deleteFranchise(id) {
		return this.http.delete(`${this.apiUrl}/franchises/${id}`);
	}
}
