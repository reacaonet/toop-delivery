import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { AccessGroup } from '../../models/accessGroup';


@Injectable({
  providedIn: 'root'
})
export class AccessGroupService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  getAccessGroup() {
    return this.http.get(`${this.apiUrl}/accessGroup`);
  }

  createAccessGroup(accessGroup: AccessGroup) {
    return this.http.post(`${this.apiUrl}/accessGroup`, accessGroup);
  }

  updateAccessGroup(accessGroup: AccessGroup) {
    return this.http.put(`${this.apiUrl}/accessGroup/${accessGroup._id}`, accessGroup);
  }

  deleteAccessGroup(id) {
    return this.http.delete(`${this.apiUrl}/accessGroup/${id}`);
  }

}
