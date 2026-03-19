import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})


export class FinanceSplitService {
	apiUrl = environment.apiURL;
	apiNotification = environment.notificationURL;
	constructor(private http: HttpClient) {}


	sendSplit(paymentId, params) {
		return this.http.post(
			`${this.apiUrl}/v2/finance/split/after/braspag/${paymentId}`, params
		);
	}

}
