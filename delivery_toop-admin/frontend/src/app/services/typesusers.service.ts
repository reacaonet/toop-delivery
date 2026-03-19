import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';

import { TypesUsers } from './../../models/typesUsers';

@Injectable({
  providedIn: 'root'
})
export class TypesUsersService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  getTypesUsers() {
    return this.http.get(`${this.apiUrl}/setting/types-users`);
  }

  getTypesUsersPaginator(pageIn, pageOut) {
    return this.http.get(`${this.apiUrl}/setting/types-users/paginator/?pageIn=${pageIn}&pageOut=${pageOut}`);
  }

  createTypesUsers(typesusers: TypesUsers) {
    return this.http.post(`${this.apiUrl}/setting/types-users/`, typesusers);
  }

  updateTypesUsers(typesusers: TypesUsers) {
    return this.http.put(`${this.apiUrl}/setting/types-users/${typesusers._id}`, typesusers);
  }

  deleteTypesUsers(id) {
    return this.http.delete(`${this.apiUrl}/setting/types-users/${id}`);
  }

}
