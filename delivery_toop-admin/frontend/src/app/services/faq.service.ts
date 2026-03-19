import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';

import { Faq } from './../../models/support/faq';

@Injectable({
  providedIn: 'root'
})
export class FaqService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

   }

   getFaq() {
    return this.http.get(`${this.apiUrl}/faq`);
  }

  getPaginatorFaq(pageIn, pageOut) {
    return this.http.get(`${this.apiUrl}/faq/paginator?pageIn=${pageIn}&pageOut=${pageOut}`);
  }

  createFaq(faq: Faq) {
    return this.http.post(`${this.apiUrl}/faq`, faq);
  }

  updateFaq(faq: Faq) {
    return this.http.put(`${this.apiUrl}/faq/${faq._id}`, faq);
  }

  deleteFaq(id) {
    return this.http.delete(`${this.apiUrl}/faq/${id}`);
  }
}

