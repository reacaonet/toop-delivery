import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';

import { Product } from './../../models/product';

@Injectable({
	providedIn: 'root',
})
export class ProductService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	getProduct() {
		return this.http.get(`${this.apiUrl}/product/list`);
	}

	getPaginatorProduct(pageIn, pageOut, name, images, link, startPrice, endPrice) {
		let filter = '';

		if (name) {
			filter += `&name=${name}`;
		}
		if (images) {
			filter += `&images=${images}`;
		}

		if (link) {
			filter += `&link=${link}`;
		}
		if (startPrice) {
			filter += `&startPrice=${startPrice}`;
		}
		if (endPrice) {
			filter += `&endPrice=${endPrice}`;
		}

		// console.log('url', `${this.apiUrl}/product/paginator?pageIn=${pageIn}&pageOut=${pageOut}${filter}`);
		return this.http.get(`${this.apiUrl}/product/paginator?pageIn=${pageIn}&pageOut=${pageOut}${filter}`);
	}

	getProductNome(name, company) {
		let filter = '';

		if (name === '') {
			name = 'null';
		} else if (name && typeof name === 'string') {
			name = name.trim();
		}

		if (company?._id) {
			filter += `&company=${company._id}`;
		}

		return this.http.get(`${this.apiUrl}/product/list-by-name?listByName=${name}${filter}`);
	}

	createProduct(product: Product) {
		return this.http.post(`${this.apiUrl}/product/create`, product);
	}

	updateProduct(product: Product) {
		return this.http.put(`${this.apiUrl}/product/update/${product._id}`, product);
	}

	deleteProduct(id) {
		return this.http.delete(`${this.apiUrl}/product/delete/${id}`);
	}

	linkProduct(payload: any) {
		return this.http.post(`${this.apiUrl}/product/link`, payload);
	}
}
