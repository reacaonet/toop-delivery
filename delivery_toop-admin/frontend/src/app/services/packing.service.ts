import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';

import { Packing } from './../../models/packing';

@Injectable({
  providedIn: 'root'
})
export class PackingService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  getPacking() {
    return this.http.get(`${this.apiUrl}/packing`);
  }

  getPackingPaginator(pageIn, pageOut) {
    return this.http.get(`${this.apiUrl}/packing/paginator/?pageIn=${pageIn}&pageOut=${pageOut}`);
  }

  getPackingsNome(name) {
    if (name === '') {
      name = 'null';
    } else if (name && (typeof name === 'string')) {
      name = name.trim();
    }
    return this.http.get(`${this.apiUrl}/packing/listPorNome?listPorNome=${name}`);
  }

  createPacking(packing: Packing) {
    return this.http.post(`${this.apiUrl}/packing`, packing);
  }

  updatePacking(packing: Packing) {
    return this.http.put(`${this.apiUrl}/packing/${packing._id}`, packing);
  }

  deletePacking(id) {
    return this.http.delete(`${this.apiUrl}/packing/${id}`);
  }


}
