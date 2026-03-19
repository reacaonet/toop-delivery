import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../../../environments/environment';

import { AccessoriesCategory } from '../../../../models/Accessories/acessoriesCategory';
import { AccessoriesProduct } from '../../../../models/Accessories/accessoriesProduct';
import { AccessoriesProductComplement } from '../../../../models/Accessories/accessoriesProductComplement';
import { AccessoriesProductComplementItem } from '../../../../models/Accessories/accessoriesProductComplementItem';

@Injectable({
  providedIn: 'root'
})
export class AccessoriesService {
	apiUrl = environment.apiURL;
	constructor(private http: HttpClient) {}

	getFoodCategory() {
    return this.http.get(`${this.apiUrl}/v2/accessories/category/by-company`);
  }

  getFoodCategoryByCompany() {
    return this.http.get(`${this.apiUrl}/v2/accessories/category/by-company`);
  }

  getCategoryNome(name) {
    if (name === '') {
      name = 'null';
    } else if (name && (typeof name === 'string')) {
      name = name.trim();
    }
    return this.http.get(`${this.apiUrl}/v2/accessories/category/list-by-name?listByName=${name}`);
  }

  createFoodCategory(foodCategory: AccessoriesCategory) {
    return this.http.post(`${this.apiUrl}/v2/accessories/category`, foodCategory);
  }

  updateCategory(foodCategory: AccessoriesCategory) {
    return this.http.put(`${this.apiUrl}/v2/accessories/category/${foodCategory._id}`, foodCategory);
  }

  deleteFoodCategory(id) {
    return this.http.delete(`${this.apiUrl}/v2/accessories/category/${id}`);
  }

  getFoodProduct() {
    return this.http.get(`${this.apiUrl}/v2/accessories/product`);
  }

  getFilter(isPaused) {
    let filter = '';

    if (isPaused) {
      filter += `&isPaused=${isPaused}`;
    }

    return this.http.get(`${this.apiUrl}/v2/accessories/product/filter/?${filter}`);
  }

  createFoodProduct(foodProduct: AccessoriesProduct) {
    return this.http.post(`${this.apiUrl}/v2/accessories/product`, foodProduct);
  }

  updateFoodProduct(foodProduct: AccessoriesProduct) {
    return this.http.put(`${this.apiUrl}/v2/accessories/product/${foodProduct._id}`, foodProduct );
  }

  updateFoodStatus(foodProduct: AccessoriesProduct) {
    return this.http.put(`${this.apiUrl}/v2/accessories/product/${foodProduct._id}/status`, foodProduct );
  }

  updateFoodProductsPosition(foodProducts: AccessoriesProduct[]) {
    return this.http.put(`${this.apiUrl}/v2/accessories/product/sort`, foodProducts );
  }

  deleteItem(id) {
    return this.http.delete(`${this.apiUrl}/v2/accessories/product/${id}`);
  }

  getFoodProductComplement(productId) {
    return this.http.get(`${this.apiUrl}/v2/accessories/product-complement/${productId}`);
  }

  createFoodProductComplement(foodProductComplement: AccessoriesProductComplement) {
    return this.http.post(`${this.apiUrl}/v2/accessories/product-complement`, foodProductComplement);
  }

  updateFoodProductComplement(foodProductComplement: AccessoriesProductComplement) {
    return this.http.put(`${this.apiUrl}/v2/accessories/product-complement/${foodProductComplement._id}`, foodProductComplement);
  }

  getFoodProductItem() {
    return this.http.get(`${this.apiUrl}/v2/accessories/product-complement-item`);
  }

  createFoodProductComplementItem(foodProductComplementItem: AccessoriesProductComplementItem) {
    return this.http.post(`${this.apiUrl}/v2/accessories/product-complement-item`, foodProductComplementItem);
  }

  updateFoodProductComplementItem(productComplementItem: AccessoriesProductComplementItem) {
    return this.http.put(`${this.apiUrl}/v2/accessories/product-complement-item/${productComplementItem._id}`, productComplementItem);
  }
}
