import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../../environments/environment';

import { SegmentModel } from './../../../models/company/segment';

@Injectable({
  providedIn: 'root'
})
export class SegmentService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {}

  get(name=undefined, company=undefined) {
    let filter = '';

    if (name && typeof name === "string") {
			filter +=  `&name=${name.trim()}`;
		}

		if (company?._id) {
			filter +=  `&companyId=${company._id}`;
		}

    return this.http.get(`${this.apiUrl}/company/segment?status=true${filter}`);
  }

  paginator(pageIn, pageOut, name) {
    let filter = '';

    if (name) {
      filter += `&name=${name}`;
    }
    return this.http.get(`${this.apiUrl}/company/segment/paginator/?pageIn=${pageIn}&pageOut=${pageOut}${filter}`);
  }

  create(segment: SegmentModel) {
    return this.http.post(`${this.apiUrl}/company/segment`, segment);
  }

  update(segment: SegmentModel) {
    return this.http.put(`${this.apiUrl}/company/segment/${segment._id}`, segment);
  }

  delete(id) {
    return this.http.delete(`${this.apiUrl}/company/segment/${id}`);
  }

	listCompanySegment(companyId) {
		return this.http.get(`${this.apiUrl}/company/segment/list-category/company/${companyId}`)
	}


	listFranchiseSegment(id: string) {
		return this.http.get(`${this.apiUrl}/company/segment/franchise/${id}`)
	}
}
