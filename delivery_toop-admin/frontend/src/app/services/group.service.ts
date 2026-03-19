import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';

import { Group } from './../../models/group';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  getGroups() {
    return this.http.get(`${this.apiUrl}/group/list`);
  }

  getGroupsPaginator(pageIn, pageOut, name) {
    let filter = '';

    if (name) {
      filter += `&name=${name}`;
    }
    return this.http.get(`${this.apiUrl}/group/paginator/?pageIn=${pageIn}&pageOut=${pageOut}${filter}`);
  }

  getGroupsNome(name) {
    if (name === '') {
      name = 'null';
    } else if (name && (typeof name === 'string')) {
      name = name.trim();
    }
    return this.http.get(`${this.apiUrl}/group/list/${name}`);
  }

  createGroup(group: Group) {
    return this.http.post(`${this.apiUrl}/group/create`, group);
  }

  updateGroup(group: Group) {
    return this.http.put(`${this.apiUrl}/group/update/${group._id}`, group);
  }

  deleteGroup(id) {
    return this.http.delete(`${this.apiUrl}/group/delete/${id}`);
  }

}
