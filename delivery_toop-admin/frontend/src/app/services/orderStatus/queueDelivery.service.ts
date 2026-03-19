import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable({
	providedIn: "root",
})
export class QueueDeliveryService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	update(params: any) {
		// console.log('params', params);
		return this.http.put(`${this.apiUrl}/delivery-man/back-to-queue`, params);
	}

	limitReached(orderId) {
		console.log(
			"limitReached",
			`${this.apiUrl}/delivery-man/queue/have-queue-active/${orderId}`
		);

		return this.http.get(
			`${this.apiUrl}/delivery-man/queue/have-queue-active/${orderId}`
		);
	}
}
