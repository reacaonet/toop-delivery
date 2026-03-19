import { Shopper } from "./../../../models/shopper";
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../environments/environment";

import { Passenger } from "./../../../models/mobility/passenger";

import { queryString } from "../../views/util";

@Injectable({
	providedIn: "root",
})
export class PassengerService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) { }

	get() {
		return this.http.get(`${this.apiUrl}/v1/mobility/passengers`);
	}

	getSearch(person: string) {
		return this.http.get(`${this.apiUrl}/v1/mobility/passengers/search?person=${person}`);
	}

	getFilter(params = {}) {
		const filter = queryString(params);
		return this.http.get(`${this.apiUrl}/v1/mobility/passengers/filter?${filter}`);
	}

	getPaginator(pageIn, pageOut, personId, company, franchise, startDate, endDate, approved = null) {
		let filter = "";

		if (personId) {
			filter += `&person=${personId}`;
		}
		// if (franchiseId) {
		// 	filter += `&franchise=${franchiseId}`;
		// }
		if (company) {
			const companyId = company._id || company;
			filter += `&companyId=${companyId}`;
		}
		if (franchise) {
			const franchiseId = franchise._id || franchise;
			filter += `&franchiseId=${franchiseId}`;
		}

		if (startDate) {
			filter += `&startDate=${startDate}`;
		}

		if (endDate) {
			filter += `&endDate=${endDate}`;
		}

		if (approved) {
			filter += `&approved=${approved}`;
		}

		return this.http.get(`${this.apiUrl}/v1/mobility/passengers/paginator?pageIn=${pageIn}&pageOut=${pageOut}${filter}`);
	}

	create(data: Passenger) {
		return this.http.post(`${this.apiUrl}/v1/mobility/passengers`, data);
	}

	update(data: Passenger) {
		return this.http.put(`${this.apiUrl}/v1/mobility/passengers/${data._id}`, data);
	}

	delete(id) {
		return this.http.delete(`${this.apiUrl}/v1/mobility/passengers/${id}`);
	}
}
