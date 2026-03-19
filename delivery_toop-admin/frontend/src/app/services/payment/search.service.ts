import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { queryString } from '../../util';

@Injectable({
  providedIn: 'root'
})
export class PaymentSearchService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  search(params: any) {
    const getQuery = queryString(params);
    return this.http.get(`${this.apiUrl}/payment/search?${getQuery}`);
  }

}
