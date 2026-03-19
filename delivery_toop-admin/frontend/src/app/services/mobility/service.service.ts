import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../environments/environment";
import { queryString } from "../../util";

import { Service } from "./../../../models/mobility/service";

@Injectable({
	providedIn: "root",
})
export class ServiceService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	get(franchise = null) {
		let getQuery = "";

		if (franchise) {
			getQuery = `franchise=${franchise}`;
		}

		return this.http.get(`${this.apiUrl}/mobility/services/list?${getQuery}`);
	}

	getById(id: string) {
		return this.http.get(`${this.apiUrl}/mobility/services/${id}`);
	}

	getGraphic() {
		return this.http.get(`${this.apiUrl}/mobility/services/graphic`);
	}

	getPaginator(pageIn, pageOut, name, franchise = null) {
		let filter = "";

		filter += "&status=all";
		if (name) {
			filter += `&name=${name}`;
		}

		if (franchise) {
			const franchiseId = franchise._id || franchise;
			filter += `&franchiseId=${franchiseId}`;
		}

		return this.http.get(
			`${this.apiUrl}/v1/mobility/services/paginator?pageIn=${pageIn}&pageOut=${pageOut}${filter}`
		);
	}

	getNome(name) {
		if (name === "") {
			name = "null";
		} else if (name && typeof name === "string") {
			name = name.trim();
		}
		return this.http.get(
			`${this.apiUrl}/mobility/services/search?search=${name}`
		);
	}

	create(data: Service) {
		return this.http.post(`${this.apiUrl}/mobility/services`, data);
	}

	update(data: Service) {
		return this.http.put(`${this.apiUrl}/mobility/services/${data._id}`, data);
	}

	delete(id) {
		return this.http.delete(`${this.apiUrl}/mobility/services/${id}`);
	}

	// Listar Serviços das Franquias vinculado ao usuario
	listFranchisesServices(params = {}) {
		let getQuery = queryString(params);

		return this.http.get(
			`${this.apiUrl}/v1/mobility/services/list-front?${getQuery}`
		);
	}
}
