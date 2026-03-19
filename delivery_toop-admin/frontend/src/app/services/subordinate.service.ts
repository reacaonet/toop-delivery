import { Subordinate } from './../../models/finance/subordinate';
import { environment } from './../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SubordinateService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  getSubordinate() {
    return this.http.get(`${this.apiUrl}/finance/subordinates`);
  }

  createSubordinate(subordinate: Subordinate) {
    return this.http.post(`${this.apiUrl}/finance/subordinates`, subordinate);
  }

  updateSubordinate(subordinate: Subordinate) {
    return this.http.put(`${this.apiUrl}/finance/subordinates/${subordinate._id}`, subordinate);
  }

  deleteSubordinate(id) {
    return this.http.delete(`${this.apiUrl}/finance/subordinates/${id}`);
  }

}
