import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { Controller } from '../../models/controller';

@Injectable({
  providedIn: 'root'
})
export class ControllerService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  getController() {
    return this.http.get(`${this.apiUrl}/setting/controller/`);
  }

  getControllerPaginator(pageIn, pageOut) {
    return this.http.get(`${this.apiUrl}/setting/controller/paginator/?pageIn=${pageIn}&pageOut=${pageOut}`);
  }

  createController(controller: Controller) {
    return this.http.post(`${this.apiUrl}/setting/controller`, controller);
  }

  updateController(controller: Controller) {
    return this.http.put(`${this.apiUrl}/setting/controller/${controller._id}`, controller);
  }

  deleteController(id) {
    return this.http.delete(`${this.apiUrl}/setting/controller/${id}`);
  }
}
