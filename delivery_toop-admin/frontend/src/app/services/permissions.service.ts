import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';

import { Permissions } from './../../models/acl/permissions';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

   }

   getPermissions() {
    return this.http.get(`${this.apiUrl}/acl/permissions`);
   }

   getPaginatorPermissions(pageIn, pageOut) {
    return this.http.get(`${this.apiUrl}/acl/permissions/paginator/?pageIn=${pageIn}&pageOut=${pageOut}`);
   }

   createPermissions(permissions: Permissions) {
    return this.http.post(`${this.apiUrl}/acl/permissions`, permissions);
   }

   updatePermissions(permissions: Permissions) {
    return this.http.put(`${this.apiUrl}/acl/permissions/${permissions._id}`, permissions);
   }

   deletePermissions(id) {
    return this.http.delete(`${this.apiUrl}/acl/permissions/${id}`);
   }
}
