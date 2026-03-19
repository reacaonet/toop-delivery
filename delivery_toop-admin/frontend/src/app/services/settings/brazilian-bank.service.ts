import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../environments/environment";

@Injectable({
	providedIn: "root",
})
export class BrazilianBankService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	get(name: string) {
		let filter = '';

		if (name) {
			filter +=  `&name=${name.trim()}`;
		}
		return this.http.get(`${this.apiUrl}/v2/setting/brazilian-bank?status=true${filter}`);
	}

}
