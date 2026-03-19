import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../environments/environment";

import { queryString } from "../../util";

@Injectable({
	providedIn: "root",
})
export class BookingService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	getHeatMap(params = {}) {
		const getQuery = queryString(params);

		return this.http.get(`${this.apiUrl}/mobility/booking/heatmap?${getQuery}`);
	}

	// Get booking chat
	getChatBooking(bookingId) {
		return this.http.get(`${this.apiUrl}/mobility/message?booking=${bookingId}`);
	}

	getNotifiedBooking(bookingId) {
		return this.http.get(`${this.apiUrl}/mobility/booking/notified-booking/${bookingId}`);
	}

	cancelRace(bookingId, reason, canceledBy) {
		return this.http.put(`${this.apiUrl}/v1/mobility/booking/driver-cancel/${bookingId}`, {
			reason,
			canceledBy,
		});
	}

	getTravelBookingInfo(bookingId) {
		return this.http.get(`${this.apiUrl}/v1/mobility/booking/travel-info/${bookingId}`);
	}

	finalizeRace(params) {
		return this.http.put(`${this.apiUrl}/v1/mobility/booking/complete`, params);
	}

	schedule(params) {
		return this.http.post(`${this.apiUrl}/v1/mobility/booking/schedule`, params);
	}

	updateSchedule(params) {
		return this.http.put(`${this.apiUrl}/v1/mobility/booking/schedule`, params);
	}
}
