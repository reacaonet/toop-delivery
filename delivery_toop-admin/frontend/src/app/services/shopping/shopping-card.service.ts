import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCardService {

	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}


	changeItem(shopper, cardItemId, params) {
		return this.http.put(`${this.apiUrl}/shopping/cart-item/shopper/${shopper}/item/${cardItemId}`, params);
	}

	addItem(shopper, cardId, params) {
		return this.http.post(`${this.apiUrl}/shopping/cart-item/shopper/${shopper}/card/${cardId}`, params);
	}

	deleteItem(shopper, cardItemId) {
		return this.http.delete(`${this.apiUrl}/shopping/cart-item/shopper/${shopper}/item/${cardItemId}`);
	}

}
