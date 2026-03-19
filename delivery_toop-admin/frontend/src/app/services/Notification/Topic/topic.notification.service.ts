import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})


export class TopicNotificationService {
	apiUrl = environment.apiURL;
	apiNotification = environment.notificationURL;
	constructor(private http: HttpClient) {}

	getTopicTotal() {
		return this.http.get(`${this.apiUrl}/v2/notification-topic/customer/total`);
	}

	sendMessage(topic, title, message) {
		return this.http.post(`${this.apiNotification}/v1/topic/notification`, {
			topic,
			title,
			message
		});
	}

	newTopic(topic) {
		return this.http.post(`${this.apiUrl}/v2/notification-topic`, {
			topic,
		});
	}

	newCustomerTopic(customer, topic) {
		return this.http.post(`${this.apiUrl}/v2/notification-topic/customer`, {
			customer,
			topic
		});
	}
}
