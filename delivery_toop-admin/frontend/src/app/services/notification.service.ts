import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../environments/environment";

import { NotificationTools } from "./../../models/notificationTools";

@Injectable({
	providedIn: "root",
})
export class NotificationService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	getNotificationTools() {
		return this.http.get(`${this.apiUrl}/notification/list`);
	}

	getNotificationPaginator(pageIn, pageOut, name) {
		let filter = "";

		if (name) {
			filter += `&name=${name}`;
		}
		return this.http.get(
			`${this.apiUrl}/notification/paginator/?pageIn=${pageIn}&pageOut=${pageOut}${filter}`
		);
	}

	createNotificationTools(notificationTools: NotificationTools) {
		const params = JSON.stringify(notificationTools);

		const header = new HttpHeaders({
			"Content-Type": "application/json; charset=UTF-8",
		});

		return this.http.post(`${this.apiUrl}/notification/create`, params, {
			headers: header,
		});
	}

	createNotification(params = {}) {
		return this.http.post(`${this.apiUrl}/notification/create`, params);
	}

	updateNotificationTools(notificationTools: NotificationTools) {
		const params = JSON.stringify(notificationTools);

		const header = new HttpHeaders({
			"Content-Type": "application/json; charset=UTF-8",
		});

		return this.http.put(
			`${this.apiUrl}/notification/update/${notificationTools._id}`,
			params,
			{ headers: header }
		);
	}

	deleteNotificationTools(id) {
		return this.http.delete(`${this.apiUrl}/notification/delete/${id}`);
	}

	getNotificationCustomer(pageIn, pageOut) {
		return this.http.get(
			`${this.apiUrl}/notification/customer?pageIn=${pageIn}&pageOut=${pageOut}`
		);
	}

	sendNotificationCustomer(params) {
		return this.http.post(`${this.apiUrl}/notification/customer`, params);
	}
}
