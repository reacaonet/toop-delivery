import { Shopper } from './../../models/shopper';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShopperService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  getShopper() {
    return this.http.get(`${this.apiUrl}/shopper`);
  }

  getShopperSearch(company: string) {
    return this.http.get(`${this.apiUrl}/shopper/search?company=${company}`);
  }

  getShopperPaginator(pageIn, pageOut, companyId, personId, insOnline) {
    let filter = '';

    if (companyId) {
      filter += `&company=${companyId}`;
    }
    if (personId) {
      filter += `&person=${personId}`;
    }

    if (insOnline) {
      filter += `&isOnline=${insOnline}`;
    }

    return this.http.get(`${this.apiUrl}/shopper/paginator/?pageIn=${pageIn}&pageOut=${pageOut}${filter}`);
  }

  createShopper(shopper: Shopper) {
    return this.http.post(`${this.apiUrl}/shopper`, shopper);
  }

  updateShopper(shopper: Shopper) {
    return this.http.put(`${this.apiUrl}/shopper/${shopper._id}`, shopper);
  }

  deleteShopper(id) {
    return this.http.delete(`${this.apiUrl}/shopper/${id}`);
  }

}
