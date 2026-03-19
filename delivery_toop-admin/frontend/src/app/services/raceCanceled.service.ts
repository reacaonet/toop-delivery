import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RaceCanceledService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  getAllRaces(OrderId: string) {
    return this.http.get(`${this.apiUrl}/deliveryMan/race/list?order=${OrderId}&all=true`);
  }

}
