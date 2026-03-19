import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { TypePayments } from './../../models/typePayments';

@Injectable({
  providedIn: 'root'
})
export class TypePaymentsService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  getTypePayments() {
    return this.http.get(`${this.apiUrl}/finance/type-payments`);
  }

  getPaginatorTypePayments(pageIn, pageOut) {
    return this.http.get(`${this.apiUrl}/finance/type-payments/paginator?pageIn=${pageIn}&pageOut=${pageOut}`);
  }


  createTypePayments(typePayments: TypePayments) {
    return this.http.post(`${this.apiUrl}/finance/type-payments`, typePayments);
  }

  updateTypePayments(typePayments: TypePayments) {
    return this.http.put(`${this.apiUrl}/finance/type-payments/${typePayments._id}`, typePayments);
  }

  deleteTypePayments(id) {
    return this.http.delete(`${this.apiUrl}/finance/type-payments/${id}`);
  }
}
