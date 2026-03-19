import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../../environments/environment';

import { Notification } from './../../../models/mobility/notification';

@Injectable({
	providedIn: 'root',
})
export class NotificationsService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	get() {
		return this.http.get(`${this.apiUrl}/mobility/notifications/list?status=all`);
	}

	getGraphic() {
		return this.http.get(`${this.apiUrl}/mobility/notifications/graphic`);
	}

	getPaginator(pageIn, pageOut, franchise, type) {
		let filter = '';

		filter += '&status=all';
		if (franchise) {
			filter += `&franchise=${franchise}`;
		}
		if (type) {
			filter += `&type=${type}`;
		}

		return this.http.get(`${this.apiUrl}/mobility/notifications/paginator?pageIn=${pageIn}&pageOut=${pageOut}${filter}`);
	}

	getNome(name) {
		if (name === '') {
			name = 'null';
		} else if (name && typeof name === 'string') {
			name = name.trim();
		}
		return this.http.get(`${this.apiUrl}/mobility/notifications/search?search=${name}`);
	}

	create(data: Notification) {
		return this.http.post(`${this.apiUrl}/mobility/notifications`, data);
	}

	update(data: Notification) {
		return this.http.put(`${this.apiUrl}/mobility/notifications/${data._id}`, data);
	}

	delete(id) {
		return this.http.delete(`${this.apiUrl}/mobility/notifications/${id}`);
	}
}
