import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PartnersService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

   }

   getPartners() {
    return this.http.get(`${this.apiUrl}/register-deliveryman/list`);
  }

  getPartnersPartners(page, limit) {
    return this.http.get(`${this.apiUrl}/register-deliveryman/paginator/?page=${page}&limit=${limit}`);
  }

	updateStatus(payload: any, id: string) {
		return this.http.put(`${this.apiUrl}/register-deliveryman/status/${id}`, payload);
	}
}
