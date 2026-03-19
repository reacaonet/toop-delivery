import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentswithoutOrdersService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) { }

  getPaymentswithoutOrders(pageIn, pageOut) {
    return this.http.get(`${this.apiUrl}/v2/payment/not-orderstatus?pageIn=${pageIn}&pageOut=${pageOut}`);
  }

}
