import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';

import { FoodCategory } from './../../models/foodCategory';
import { FoodProduct } from './../../models/foodProduct';
import { FoodProductComplement } from './../../models/foodProductComplement';
import { FoodProductComplementItem } from './../../models/foodProductComplementItem';

@Injectable({
  providedIn: 'root'
})
export class FoodService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  getFoodCategory() {
    return this.http.get(`${this.apiUrl}/food/category/by-company`);
  }

  getFoodCategoryByCompany() {
    return this.http.get(`${this.apiUrl}/food/category/by-company`);
  }

  getCategoryNome(name) {
    if (name === '') {
      name = 'null';
    } else if (name && (typeof name === 'string')) {
      name = name.trim();
    }
    return this.http.get(`${this.apiUrl}/food/category/list-by-name?listByName=${name}`);
  }

  createFoodCategory(foodCategory: FoodCategory) {
    return this.http.post(`${this.apiUrl}/food/category`, foodCategory);
  }

  updateCategory(foodCategory: FoodCategory) {
    return this.http.put(`${this.apiUrl}/food/category/${foodCategory._id}`, foodCategory);
  }

  deleteFoodCategory(id) {
    return this.http.delete(`${this.apiUrl}/food/category/${id}`);
  }

  getFoodProduct() {
    return this.http.get(`${this.apiUrl}/food/product`);
  }

  getFilter(isPaused) {
    let filter = '';

    if (isPaused) {
      filter += `&isPaused=${isPaused}`;
    }

    return this.http.get(`${this.apiUrl}/food/product/filter/?${filter}`);
  }

  getFoodProductNome(name, company) {

    let filter = '';

    if (name === '') {
      name = 'null';
    } else if (name && (typeof name === 'string')) {
      name = name.trim();
    }

    if (company?._id) {
      filter += `&company=${company._id}`;
    }

    return this.http.get(`${this.apiUrl}/food/product/list-by-name?listByName=${name}${filter}`);
  }

  createFoodProduct(foodProduct: FoodProduct) {
    return this.http.post(`${this.apiUrl}/food/product`, foodProduct);
  }

  updateFoodProduct(foodProduct: FoodProduct) {
    return this.http.put(`${this.apiUrl}/food/product/${foodProduct._id}`, foodProduct);
  }

  updateFoodStatus(foodProduct: FoodProduct) {
    return this.http.put(`${this.apiUrl}/food/product/${foodProduct._id}/status`, foodProduct);
  }

  updateFoodProductsPosition(foodProducts: FoodProduct[]) {
    return this.http.put(`${this.apiUrl}/food/product/sort`, foodProducts);
  }

  deleteItem(id) {
    return this.http.delete(`${this.apiUrl}/food/product/${id}`);
  }

  getFoodProductComplement(productId) {
    return this.http.get(`${this.apiUrl}/v1/food/product-complement/${productId}`);
  }

  createFoodProductComplement(foodProductComplement: FoodProductComplement) {
    return this.http.post(`${this.apiUrl}/food/product-complement`, foodProductComplement);
  }

  updateFoodProductComplement(foodProductComplement: FoodProductComplement) {
    return this.http.put(`${this.apiUrl}/food/product-complement/${foodProductComplement._id}`, foodProductComplement);
  }

  getFoodProductItem() {
    return this.http.get(`${this.apiUrl}/food/product-complement-item`);
  }

  createFoodProductComplementItem(foodProductComplementItem: FoodProductComplementItem) {
    return this.http.post(`${this.apiUrl}/food/product-complement-item`, foodProductComplementItem);
  }

  updateFoodProductComplementItem(foodProductComplementItem: FoodProductComplementItem) {
    return this.http.put(`${this.apiUrl}/food/product-complement-item/${foodProductComplementItem._id}`, foodProductComplementItem);
  }

}
