import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from './../../../environments/environment';

import { Campaign } from './../../../models/marketing/campaign';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) { }

  getCampaign() {
    return this.http.get(`${this.apiUrl}/marketing/campaign`);
  }

  getPaginatorCampaign(page, limit) {
    return this.http.get(`${this.apiUrl}/marketing/campaign/paginator?page=${page}&limit=${limit}`);
  }

  createCampaign(campaign: Campaign) {
    return this.http.post(`${this.apiUrl}/marketing/campaign`, campaign);
  }

  updateCampaign(campaign: Campaign) {
    return this.http.put(`${this.apiUrl}/marketing/campaign/${campaign._id}`, campaign);
  }

  deleteCampaign(id) {
    return this.http.delete(`${this.apiUrl}/marketing/campaign/${id}`);
  }
}
