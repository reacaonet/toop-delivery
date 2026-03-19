import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class InvoiceService {
	apiUrl = environment.apiURL;
	constructor(private http: HttpClient) {}

	getInvoices() {
		return this.http.get(`${this.apiUrl}/listInvoice`);
	}

	detailInvoice(id) {
		// console.log('Url para teste', `${this.apiUrl}/shopping/invoice/${id}`);
		return this.http.get(`${this.apiUrl}/shopping/invoice/${id}`);
	}

}
