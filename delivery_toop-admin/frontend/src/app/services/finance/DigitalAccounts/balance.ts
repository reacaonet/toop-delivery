import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../../environments/environment";

@Injectable({
	providedIn: "root",
})
export class BalanceService {
	apiUrl = `${environment.apiURL}/finance/digital-accounts/balances`;

	constructor(private http: HttpClient) {}

	create(data: any) {
		return this.http.post(`${this.apiUrl}/`, data);
	}
}
