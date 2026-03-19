import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../environments/environment";

import { Voucher } from "./../../../models/finance/Voucher";

@Injectable({
	providedIn: "root",
})
export class VoucherService {
	apiUrl = `${environment.apiURL}/v2/vouchers`;

	constructor(private http: HttpClient) { }

	getAll() {
		return this.http.get(`${this.apiUrl}/`);
	}

	getPaginator(pageIn, pageOut) {
		let filter = "";

		return this.http.get(
			`${this.apiUrl}/paginator?pageIn=${pageIn}&pageOut=${pageOut}${filter}`
		);
	}

	create(data: Voucher) {
		return this.http.post(`${this.apiUrl}/`, data);
	}

	update(data: Voucher) {
		return this.http.put(`${this.apiUrl}/${data._id}`, data);
	}

	delete(id) {
		return this.http.delete(`${this.apiUrl}/${id}`);
	}
}
