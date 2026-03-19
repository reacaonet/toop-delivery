import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable({
	providedIn: "root",
})
export class LooseDeliveryService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	createDelivery(params) {
		return this.http.post(`${this.apiUrl}/v2/loose-delivery`, params);
	}

	googleSearchAddres(latitude = null, longitude = null) {
		return this.http.get(
			`${this.apiUrl}/v2/loose-delivery/address?latitude=${latitude}&longitude=${longitude}`
		);
	}

	deliveryPrice(company, latitude, longitude) {
		return this.http.get(
			`${this.apiUrl}/company/price-delivery/${company}?latitude=${latitude}&longitude=${longitude}`
		);
	}
}
