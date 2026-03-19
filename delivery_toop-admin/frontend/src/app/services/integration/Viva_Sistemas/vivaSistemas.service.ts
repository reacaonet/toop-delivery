import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VivaSistemasIntegrationService {

  apiUrl = environment.apiURL;
  apiIntegrationsURL = environment.apiIntegrationsURL;

  constructor(private http: HttpClient) {

  }

  getProductSync(company, barcode) {
    return this.http.get(`${this.apiIntegrationsURL}/v1/viva-sistemas/products/barcode/${barcode}/company/${company}?synchronize=true`);
	}

}
