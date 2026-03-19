import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { Offer } from '../../models/offer';

@Injectable({
  providedIn: 'root'
})
export class OfferService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  getOffers() {
    return this.http.get(`${this.apiUrl}/offer/list`);
  }

  createOffer(offer: Offer) {
    return this.http.post(`${this.apiUrl}/offer/create`, offer);
  }

  updateOffer(offer: Offer) {
    return this.http.put(`${this.apiUrl}/offer/update/${offer._id}`, offer );
  }

  deleteOffer(id) {
    return this.http.delete(`${this.apiUrl}/offer/delete/${id}`);
  }

}
