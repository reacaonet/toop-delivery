import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { queryString } from '../../util';

@Injectable({
  providedIn: 'root'
})


export class CartItemService {
	apiUrl = environment.apiURL;
	constructor(private http: HttpClient) {}


	showAll(cartId, params = {}) {
		const getQuery = queryString(params);
		return this.http.get(
			`${this.apiUrl}/shopping/cart-item/show-all/${cartId}?${getQuery}`
		);
	}

}
