import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';

import { Notification } from './../../models/notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  notificationURL = environment.notificationURL;

  constructor(private http: HttpClient) {

  }

  sendNotification(message: Notification) {
    const header = new HttpHeaders({ 'Content-Type': 'application/json', 'authorization': environment.notificationApiKey || '' });

    return this.http.post(`${this.notificationURL}/v1/app-notification/general`, message, { headers: header });
  }

}
