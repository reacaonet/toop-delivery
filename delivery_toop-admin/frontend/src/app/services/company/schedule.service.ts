import { Schedule } from './../../../models/schedule';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) { }

  getSchedule(companyId) {
    return this.http.get(`${this.apiUrl}/company/schedule/${companyId}`);
  }

  createSchedule(schedule: Schedule, companyId) {
    return this.http.post(`${this.apiUrl}/company/schedule/${companyId}`, schedule);
  }

  updateSchedule(schedule: Schedule, companyId) {
    return this.http.put(`${this.apiUrl}/company/schedule/${schedule._id}`, schedule);
  }

  deleteSchedule(id) {
    return this.http.delete(`${this.apiUrl}/company/schedule/${id}`);
  }
}
