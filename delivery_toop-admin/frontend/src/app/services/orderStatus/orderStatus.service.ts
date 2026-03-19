import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { orderStatusUpdate } from "../../../models/order/orderStatus.type";

import { queryString } from "../../util";

@Injectable({
	providedIn: "root",
})
export class OrderStatusService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	search(params: orderStatusUpdate) {
		const getQuery = queryString(params);
		return this.http.get(
			`${this.apiUrl}/v1/front/order/search/params?${getQuery}`
		);
	}

	update(orderId: string, params: orderStatusUpdate) {
		return this.http.put(`${this.apiUrl}/order/status/${orderId}`, params);
	}

	cancelOrder(orderId: string) {
		return this.http.put(`${this.apiUrl}/payment/cancel/order/${orderId}`, {});
	}

	// utiliza entregadores proprios ?
	ownDelivery(orderId: string) {
		return this.http.get(`${this.apiUrl}/order/own-delivery/${orderId}`);
	}

	// utiliza entregadores onlien ?
	onlineDelivery(orderId: string) {
		return this.http.get(`${this.apiUrl}/order/online-delivery/${orderId}`);
	}

	// valor do frete
	costFreight(orderId: string) {
		return this.http.get(`${this.apiUrl}/order/cost-freight/${orderId}`);
	}

	costFreightService(orderId: string, params) {
		return this.http.put(
			`${this.apiUrl}/order/cost-freight/${orderId}`,
			params
		);
	}
}
