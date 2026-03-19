import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../environments/environment";
import { queryString } from "../util";

@Injectable({
	providedIn: "root",
})
export class DriversService {
	apiUrl = `${environment.apiURL}`;

	constructor(private http: HttpClient) {}

	getRegisters() {
		return this.http.get(`${this.apiUrl}/pre-register/list`);
	}

	getRegistersPaginator(page, limit, params = {}) {
		const getQuery = queryString(params);

		return this.http.get(
			`${this.apiUrl}/pre-register/paginator?pageIn=${page}&pageOut=${limit}&${getQuery}`
		);
	}

	updateStatus(payload: any, id: string) {
		return this.http.put(`${this.apiUrl}/pre-register/${id}`, payload);
	}

	getPaginator(pageIn, pageOut, name, cpf) {
		let filter = "";

		if (name) filter += `&name=${name}`;
		if (cpf) filter += `&cpf=${cpf}`;

		return this.http.get(
			`${this.apiUrl}/v1/mobility/driver/paginator?pageIn=${pageIn}&pageOut=${pageOut}${filter}`
		);
	}

	getNome(name) {
		if (name === "") {
			name = "null";
		} else if (name && typeof name === "string") {
			name = name.trim();
		}
		return this.http.get(`${this.apiUrl}/v1/mobility/driver/list-by-name?listPorNome=${name}`);
	}

	create(data) {
		return this.http.post(`${this.apiUrl}/mobility/driver`, data);
	}

	update(data) {
		return this.http.put(`${this.apiUrl}/mobility/driver/${data._id}`, data);
	}

	delete(id) {
		return this.http.delete(`${this.apiUrl}/mobility/driver/${id}`);
	}
}
