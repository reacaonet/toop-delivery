import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../../environments/environment";
import moment from "moment-timezone";

import { queryString } from "../../../util";

@Injectable({
	providedIn: "root",
})
export class AdmReportService {
	apiUrl = environment.apiURL;

	httpOptions = {
		headers: new HttpHeaders({
			timezone: moment.tz.guess(true),
		}),
	};

	constructor(private http: HttpClient) {}

	racesPaginator(params: any) {
		const getQuery = queryString(params);
		return this.http.get(`${this.apiUrl}/mobility/report/adm/driver?${getQuery}`);
	}

	racesBalance(params: any) {
		const getQuery = queryString(params);
		return this.http.get(`${this.apiUrl}/mobility/report/adm/driver/balance?${getQuery}`);
	}

	passengerPaginator(params: any) {
		const getQuery = queryString(params);
		return this.http.get(`${this.apiUrl}/mobility/report/adm/passenger?${getQuery}`);
	}

	passengerBalance(params: any) {
		const getQuery = queryString(params);
		return this.http.get(`${this.apiUrl}/mobility/report/adm/passenger/balance?${getQuery}`);
	}

	runningPaginator(params: any) {
		const getQuery = queryString(params);
		return this.http.get(`${this.apiUrl}/mobility/report/adm/races?${getQuery}`);
	}

	runningBalance(params: any) {
		const getQuery = queryString(params);
		return this.http.get(`${this.apiUrl}/mobility/report/adm/races/balance?${getQuery}`);
	}

	monitoringBookings(params: any = {}) {
		const getQuery = queryString(params);
		return this.http.get(
			`${this.apiUrl}/v1/mobility/report/map/monitoring?${getQuery}`,
			this.httpOptions
		);
	}

	activeMonitoring(params = {}) {
		const getQuery = queryString(params);
		return this.http.get(
			`${this.apiUrl}/v1/mobility/report/active/monitoring?${getQuery}`,
			this.httpOptions
		);
	}
}
