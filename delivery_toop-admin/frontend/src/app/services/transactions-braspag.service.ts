import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionsBraspagService {

  apiIntegratURL = environment.apiIntegratURL;

  constructor(private http: HttpClient) {

  }

  getTransactionsBraspag(initialDate, finalDate, page, limit) {
    return this.http.get(`${this.apiIntegratURL}/v1/transaction?initialDate=${initialDate}&finalDate=${finalDate}&page=${page}&limit=${limit}`);
  }

  getFlags(cardNumber) {
    return this.http.get(`${this.apiIntegratURL}/v1/payment/binCard/${cardNumber}`);
  }
}
