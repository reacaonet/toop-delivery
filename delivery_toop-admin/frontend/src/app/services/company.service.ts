import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../environments/environment";

import { Company } from "./../../models/company/company";

@Injectable({
	providedIn: "root",
})
export class CompanyService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) { }

	getCompanies() {
		return this.http.get(`${this.apiUrl}/company/list?status=all`);
	}

	getGraphicCompanies() {
		return this.http.get(`${this.apiUrl}/company/graphic`);
	}

	getCompaniesPaginator(pageIn, pageOut, groupId, companyId) {
		let filter = "";

		filter += "&status=all";
		if (groupId) {
			filter += `&group=${groupId}`;
		}
		if (companyId) {
			filter += `&company=${companyId}`;
		}

		return this.http.get(
			`${this.apiUrl}/company/paginator?pageIn=${pageIn}&pageOut=${pageOut}${filter}`
		);
	}

	getCompaniesByFranchise(name, franchise: any = "") {
		if (name === "") {
			name = "null";
		} else if (name && typeof name === "string") {
			name = name.trim();
		}

		franchise = (franchise?._id) ? franchise?._id : franchise;

		return this.http.get(`${this.apiUrl}/v1/company/search?search=${name}&franchise=${franchise}`);

	}

	getCompaniesNome(name, franchise = "") {
		if (name === "") {
			name = "null";
		} else if (name && typeof name === "string") {
			name = name.trim();
		}
		return this.http.get(
			`${this.apiUrl}/company/search?search=${name}&franchise=${franchise}`
		);
	}

	createCompany(company: Company) {
		return this.http.post(`${this.apiUrl}/company`, company);
	}

	updateCompany(company: Company) {
		return this.http.put(`${this.apiUrl}/company/${company._id}`, company);
	}

	deleteCompany(id) {
		return this.http.delete(`${this.apiUrl}/company/${id}`);
	}

	createPublicCompany(company: Company) {
		return this.http.post(
			`${this.apiUrl}/v2/company/register-company`,
			company
		);
	}
}
