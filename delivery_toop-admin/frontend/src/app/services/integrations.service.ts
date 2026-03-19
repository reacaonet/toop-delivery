import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';

import { Integrations } from './../../models/integrations';

@Injectable({
  providedIn: 'root'
})
export class IntegrationsService {

  apiUrl = environment.apiURL;
  apiIntegrationsURL = environment.apiIntegrationsURL;

  constructor(private http: HttpClient) {

  }

  getIntegrations(name) {
    return this.http.get(`${this.apiUrl}/tools/integrations/?name=${name}`);
	}

	getIntegrationCompany(companyId) {
    return this.http.get(`${this.apiUrl}/tools/integrations/company/${companyId}`);
  }

  getPaginatorIntegrations(pageIn, pageOut) {
    return this.http.get(`${this.apiUrl}/tools/integrations/paginator?pageIn=${pageIn}&pageOut=${pageOut}`);
  }

  createIntegrations(integrations: Integrations) {
    return this.http.post(`${this.apiUrl}/tools/integrations`, integrations);
  }

  updateIntegrations(integrations: Integrations) {
    return this.http.put(`${this.apiUrl}/tools/integrations/${integrations._id}`, integrations);
  }

  deleteIntegrations(id) {
    return this.http.delete(`${this.apiUrl}/tools/integrations/${id}`);
  }

	// Sincronizar Image
	syncImage(companyId: string) {
		return this.http.get(`${this.apiUrl}/tools/integrations/sync-image/${companyId}`);
	}

  // integração rota front:company/integration
  getListIntegrationsCompany(pageSize, page, companyId, department) {
    let filter = '';

    if (companyId) {
      filter += `&company=${companyId}`;
    }

    if (department) {
      filter += `&department=${department}`;
    }

    return this.http.get(`${this.apiIntegrationsURL}/v1/all/unsynchronized-departments/?pageSize=${pageSize}&page=${page}${filter}`);
	}


}
