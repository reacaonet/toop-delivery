import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NocService {

  apiUrl = environment.apiURL;


  constructor(private http: HttpClient) {

   }

   getActived(param) {
    return this.http.get(`${this.apiUrl}/monitor/order`);
   }

   getListOrdersToSee(id) {
     return this.http.get(`${this.apiUrl}/monitor/order/${id}`);
   }

   getListChartNoc() {
     return this.http.get(`${this.apiUrl}/monitor/sales`);
   }
}
