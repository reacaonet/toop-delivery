import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';

import { Tabloid } from './../../models/tabloid';

@Injectable({
  providedIn: 'root'
})
export class TabloidService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  getTabloids() {
    return this.http.get(`${this.apiUrl}/tabloid/list`);
  }

  createTabloid(tabloid: Tabloid) {
    return this.http.post(`${this.apiUrl}/tabloid/create`, tabloid);
  }

  updateTabloid(tabloid: Tabloid) {
    return this.http.put(`${this.apiUrl}/tabloid/update/${tabloid._id}`, tabloid);
  }

  deleteTabloid(id) {
    return this.http.delete(`${this.apiUrl}/tabloid/delete/${id}`);
  }

}
