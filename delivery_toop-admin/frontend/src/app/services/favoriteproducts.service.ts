import { Injectable, SimpleChange } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FavoriteproductsService {

  apiURL = environment.apiURL;

  constructor(private http: HttpClient) { }

  showFavoriteProducts(page, limit) {
    return this.http.get(`${this.apiURL}/v2/customer-alert-product/alert-product/report?page=${page}&limit=${limit}`);
  }
}
