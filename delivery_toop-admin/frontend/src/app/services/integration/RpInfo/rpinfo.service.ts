import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RpInfoIntegrationService {

  apiUrl = environment.apiURL;
  apiIntegrationsURL = environment.apiIntegrationsURL;

  constructor(private http: HttpClient) {

  }

  getProductSync(company, barcode, cnpj) {
    return this.http.get(`${this.apiIntegrationsURL}/v1/rpinfo/products/barcode/${barcode}/cnpj/${cnpj}?company=${company}&synchronize=true`);
	}

}
