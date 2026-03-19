import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QueueDeliveryManService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  getQueueDeliveryManWithOrder(orderId: string) {
    return this.http.get(`${this.apiUrl}/deliveryMan/queue?order=${orderId}`);
  }

}
