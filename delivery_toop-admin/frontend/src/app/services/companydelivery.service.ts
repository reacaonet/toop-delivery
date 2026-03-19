import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../environments/environment";

import { CompanyDelivery } from "./../../models/company/companyDelivery";

@Injectable({
	providedIn: "root",
})
export class CompanyDeliveryService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	getCompaniesDelivery() {
		return this.http.get(`${this.apiUrl}/company/company-delivery`);
	}

	getCompaniesDeliveryPaginator(pageIn, pageOut, companyId?) {
		let filter = "";

		if (companyId) {
			filter += `&company=${companyId}`;
		}

		return this.http.get(
			`${this.apiUrl}/company/company-delivery/paginator/?pageIn=${pageIn}&pageOut=${pageOut}${filter}`
		);
	}

	getCompanyId(companyId?) {
		return this.http.get(
			`${this.apiUrl}/company/company-delivery/${companyId}`
		);
	}

	createCompanyDelivery(companyDelivery: any) {
		return this.http.post(
			`${this.apiUrl}/company/company-delivery/${companyDelivery.company._id}`,
			companyDelivery
		);
	}

	updateCompanyDelivery(companyDelivery: any) {
		return this.http.put(
			`${this.apiUrl}/company/company-delivery/${companyDelivery._id}`,
			companyDelivery
		);
	}

	updateOpenCompany(companyDelivery) {
		return this.http.put(
			`${this.apiUrl}/company/company-delivery/open-company`,
			companyDelivery
		);
	}

	deleteCompanyDelivery(companyId) {
		return this.http.delete(
			`${this.apiUrl}/company/company-delivery/${companyId}`
		);
	}
}
