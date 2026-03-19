import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportsCustomerService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  getReportsCustomer(page, limit) {
    return this.http.get(`${this.apiUrl}/customer/paginator/?page=${page}&limit=${limit}`);
  }

}
