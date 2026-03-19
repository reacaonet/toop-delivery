import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';

import { Hours } from './../../models/hours';

@Injectable({
  providedIn: 'root'
})
export class HoursService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  createHours(hours: any) {
    return this.http.post(`${this.apiUrl}/company/hours`, hours);
  }

  showHours(idCompany: string) {
    return this.http.get(`${this.apiUrl}/company/hours/${idCompany}`);
  }

  deleteHours(id: string) {
    return this.http.delete(`${this.apiUrl}/company/hours/${id}`);
  }
}
