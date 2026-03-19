import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from './../../../environments/environment';

import { AccessFlow } from './../../../models/access/access';

@Injectable({
  providedIn: 'root'
})
export class AccessFlowService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) { }

  getAccessFlow() {
    return this.http.get(`${this.apiUrl}/report/access-flow`);
  }

  getAccessFlowPaginator(page, limit) {
    return this.http.get(`${this.apiUrl}/report/access-flow/paginator?page=${page}&limit=${limit}`);
  }

  createAccessFlow(accessFlow: AccessFlow) {
    return this.http.post(`${this.apiUrl}/report/access-flow`, accessFlow);
  }

  updateAccessFlow(accessFlow: AccessFlow) {
    return this.http.put(`${this.apiUrl}/report/access-flow/${accessFlow._id}`, accessFlow);
  }

  deleteAccessFlow(id) {
    return this.http.delete(`${this.apiUrl}/report/access-flow/${id}`);
  }
}
