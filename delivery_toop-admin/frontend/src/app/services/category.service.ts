import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';

import { Category } from './../../models/application/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

   }

  getCategory() {
    return this.http.get(`${this.apiUrl}/application/category`);
  }

  getPaginatorCategory(pageIn, pageOut) {
    return this.http.get(`${this.apiUrl}/application/category/paginator?pageIn=${pageIn}&pageOut=${pageOut}`);
  }

  createCategory(category: Category) {
    return this.http.post(`${this.apiUrl}/application/category`, category);
  }

  updateCategory(category: Category) {
    return this.http.put(`${this.apiUrl}/application/category/${category._id}`, category);
  }

  deleteCategory(id) {
    return this.http.delete(`${this.apiUrl}/application/category/${id}`);
  }
}
