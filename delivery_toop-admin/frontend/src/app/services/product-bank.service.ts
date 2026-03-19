import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import {queryString} from '../util';

@Injectable({
  providedIn: 'root'
})
export class ProductBankService {

  private apiUrl = environment.apiURL;

  constructor(private http: HttpClient) { }

  getPaginatorProductBank(page, limit, filter = {}) {
		const getQuery = queryString(filter);
    return this.http.get(`${this.apiUrl}/v2/ecbr-image-bank?page=${page}&limit=${limit}&${getQuery}`);
	}

	createImageProduct(product: any) {
		return this.http.post(`${this.apiUrl}/v2/ecbr-image-bank`, product);
	}

	updateProduct(product: any) {
		return this.http.put(`${this.apiUrl}/v2/ecbr-image-bank/update/${product._id}`, product);
	}

	generateCode(){
		return this.http.get(`${this.apiUrl}/v2/ecbr-image-bank/generate/code/ecbr`);
	}

	syncProducts() {
		return this.http.get(`${this.apiUrl}/v2/ecbr-image-bank/sync`)
	}

	listByBarcode(barcode) {
		return this.http.get(`${this.apiUrl}/v2/ecbr-image-bank/barcode/${barcode}`)
	}

}
