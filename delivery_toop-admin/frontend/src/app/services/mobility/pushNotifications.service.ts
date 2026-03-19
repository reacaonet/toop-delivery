import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../environments/environment";

@Injectable({
	providedIn: "root",
})
export class PushNotificationService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	getPaginator(pageIn, pageOut, franchise, topic) {
		let filter = "";

		filter += "&status=all";
		if (franchise) {
			filter += `&franchise=${franchise}`;
		}
		if (topic) {
			filter += `&topic=${topic}`;
		}

		return this.http.get(
			`${this.apiUrl}/mobility/push-notification/paginator?pageIn=${pageIn}&pageOut=${pageOut}${filter}`
		);
	}

	create(data: any) {
		return this.http.post(`${this.apiUrl}/mobility/push-notification`, data);
	}

	syncTopics() {
		return this.http.get(`${this.apiUrl}/mobility/topic/link-user-topics`);
	}
}
