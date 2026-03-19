import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  getLog() {
    return this.http.get(`${this.apiUrl}/log`);
  }

  getLogsPaginator(pageIn, pageOut) {
    return this.http.get(`${this.apiUrl}/log/paginator/?pageIn=${pageIn}&pageOut=${pageOut}`);
  }

	logsPaginator(pageIn, pageOut) {
    return this.http.get(`${this.apiUrl}/log/paginator?pageIn=${pageIn}&pageOut=${pageOut}`);
  }

}
