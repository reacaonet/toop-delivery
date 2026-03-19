import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { Roles } from '../../models/acl/roles';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

   }

   getRoles() {
    return this.http.get(`${this.apiUrl}/acl/roles`);
   }

   getRolesPaginator(pageIn, pageOut) {
    return this.http.get(`${this.apiUrl}/acl/roles/paginator/?pageIn=${pageIn}&pageOut=${pageOut}`);
   }

   getRolesNome(name) {
    if (name === '') {
      name = 'null';
    } else if (name && (typeof name === 'string')) {
      name = name.trim();
    }
    return this.http.get(`${this.apiUrl}/acl/roles/listPorNome?listPorNome=${name}`);
  }

   createRoles(roles: Roles) {
    return this.http.post(`${this.apiUrl}/acl/roles`, roles);
   }

   updateRoles(roles: Roles) {
    return this.http.put(`${this.apiUrl}/acl/roles/${roles._id}`, roles);
   }

   deleteRoles(id) {
    return this.http.delete(`${this.apiUrl}/acl/roles/${id}`);
   }
}
