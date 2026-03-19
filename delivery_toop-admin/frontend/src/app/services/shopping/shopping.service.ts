import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { CartItem } from "./../../../models/cartItem";
import { environment } from "./../../../environments/environment";
import { Schedule } from "./../../../models/schedule";

@Injectable({
	providedIn: "root",
})
export class ShoppingService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	getAllCarts() {
		return this.http.get(`${this.apiUrl}/shopping/cart/all`);
	}

	getCart(companyType) {
		return this.http.get(
			`${this.apiUrl}/shopping/cart/all/?companytype=${companyType}`
		);
	}

	/**
	 * GET
	 * url - /v1/front/order
	 * page - default(1)
	 * pageSize - default(20)
	 * status - default(null)
	 * customer - default(null)
	 * companyType - default(null)
	 * company - default(null)
	 * sort - default ({createdAt: -1})
	 * sortOrder - default(null) -> Exemple: &sortOrder=createdAt:-1
	 */
	getOrders(
		pageIn,
		pageOut,
		companyType,
		status = "",
		sortOrder = "",
		returnPayment = false
	) {
		let filter = "";
		if (
			companyType &&
			typeof companyType === "string" &&
			companyType.length > 0
		) {
			filter += `&companyType=${companyType}`;
		}
		if (status && typeof status === "string" && status.length > 0) {
			filter += `&status=${status}`;
		}

		// console.log(`${this.apiUrl}/v1/front/order/?page=${pageIn}&pageSize=${pageOut}${filter}`);
		return this.http.get(
			`${this.apiUrl}/v1/front/order/?page=${pageIn}&pageSize=${pageOut}${filter}&sortOrder=${sortOrder}&returnPayment=${returnPayment}`
		);
	}

	/**
	 * GET
	 * url - /v1/front/order/:orderId
	 */
	getOrderById(orderId) {
		// console.log(`${this.apiUrl}/v1/front/order/${orderId}`);
		return this.http.get(`${this.apiUrl}/v1/front/order/${orderId}`);
	}

	getCartPaginator(
		pageIn,
		pageOut,
		companyType,
		companyId,
		customerId,
		status
	) {
		let filter = "";
		filter += `&companyType=${companyType}`;
		if (companyId) {
			filter += `&company=${companyId}`;
		}
		if (customerId) {
			filter += `&customer=${customerId}`;
		}
		if (status) {
			filter += `&status=${status}`;
		}

		return this.http.get(
			`${this.apiUrl}/shopping/cart/paginator/?pageIn=${pageIn}&pageOut=${pageOut}${filter}`
		);
	}

	getCartItem(id, companyType) {
		return this.http.get(
			`${this.apiUrl}/shopping/cart-item/${id}/?type=${companyType}`
		);
	}

	updateCartItem(cartItem: CartItem) {
		return this.http.put(
			`${this.apiUrl}/shopping/cart-item/${cartItem._id}`,
			cartItem
		);
	}

	getScheduleAll() {
		return this.http.get(`${this.apiUrl}/shopping/schedule/all`);
	}

	getSchedule(id) {
		return this.http.get(`${this.apiUrl}/shopping/schedule/${id}`);
	}

	createSchedule(companyId, schedule: Schedule) {
		return this.http.post(
			`${this.apiUrl}/shopping/schedule/${companyId}`,
			schedule
		);
	}

	updateSchedule(schedule: Schedule) {
		return this.http.put(
			`${this.apiUrl}/shopping/schedule/${schedule._id}`,
			schedule
		);
	}

	deleteSchedule(id) {
		return this.http.delete(`${this.apiUrl}/shopping/schedule/${id}`);
	}

	getGraphicCartSales() {
		const company: any = JSON.parse(localStorage.getItem("@company-main"));
		let httpOptions = {};

		if (company) {
			httpOptions = {
				headers: new HttpHeaders({
					company: company._id,
				}),
			};
		}

		return this.http.get(
			`${this.apiUrl}/v2/report/shopping/carts-created-sales-made`,
			httpOptions
		);
	}
}
