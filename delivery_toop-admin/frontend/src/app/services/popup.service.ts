import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { Popup } from '../../models/popup';

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  apiUrl = environment.apiURL;

  constructor(
    private http: HttpClient) {
  }

  getPopup() {
    return this.http.get(`${this.apiUrl}/tools/popup`);
  }

  getPopupPaginator(pageIn, pageOut, name) {
    let filter = '';

    if (name) {
      filter += `&name=${name}`;
    }
    return this.http.get(`${this.apiUrl}/tools/popup/paginator/?pageIn=${pageIn}&pageOut=${pageOut}${filter}`);
  }

  createPopup(popup: Popup) {
    return this.http.post(`${this.apiUrl}/tools/popup`, popup);
  }

  updatePopup(popup: Popup) {
    return this.http.put(`${this.apiUrl}/tools/popup/${popup._id}`, popup);
  }

  deletePopup(id) {
    return this.http.delete(`${this.apiUrl}/tools/popup/${id}`);
  }

}
