import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../environments/environment";

import { queryString } from "../../views/util";

@Injectable({
	providedIn: "root",
})
export class DriverService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	getDriverStatus(isOnline, onRoute = null) {
		let filter = "";

		if (isOnline === "true" || isOnline === "false") {
			filter += `online=${isOnline}`;
		}

		if (onRoute === "true") {
			filter += `onRoute=${onRoute}`;
		}

		return this.http.get(`${this.apiUrl}/mobility/driver/status?${filter}`);
	}

	getDriverStatusFilter(params = {}) {
		let filter = queryString(params);

		return this.http.get(`${this.apiUrl}/v1/mobility/driver/status?${filter}`);
	}

	getName(name) {
		return this.http.get(`${this.apiUrl}/mobility/driver/list-by-name?listPorNome=${name}`);
	}

	driverPaginator(
		pageIn,
		pageOut,
		driverId,
		status,
		email,
		isOnline,
		dateInit,
		dateFinal,
		order = ""
	) {
		let filter = "";

		if (driverId) {
			filter += `&driverId=${driverId}`;
		}

		if (email) {
			filter += `&email=${email}`;
		}

		if (status) {
			filter += `&status=${status}`;
		}

		if (isOnline === "true" || isOnline === "false") {
			filter += `online=${isOnline}`;
		}

		if (dateInit) {
			filter += `&dateInit=${dateInit}`;
		}

		if (dateFinal) {
			filter += `&dateFinal=${dateFinal}`;
		}

		if (order) {
			filter += `&order=${order.split(" ")[0]}`;
			filter += `&direction=${order.split(" ")[1] === "asc" ? 1 : -1}`;
		}
		return this.http.get(
			`${this.apiUrl}/v1/mobility/report/driver?pageIn=${pageIn}&pageOut=${pageOut}${filter}`
		);
	}
}
