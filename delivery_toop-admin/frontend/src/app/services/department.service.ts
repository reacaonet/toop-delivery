import { Department } from "./../../models/department";
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../environments/environment";

import { queryString } from "../util";

@Injectable({
	providedIn: "root",
})
export class DepartmentService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	getDepartments(params = {}) {
		let query = `all=true`;
		const queryStr = `${queryString(params)}`;
		if (queryStr) {
			query += `&${queryStr}`;
		}

		return this.http.get(`${this.apiUrl}/shopping/department?${query}`);
	}

	getPaginatorDepartments(pageIn, pageOut, params = {}) {
		let query = `pageIn=${pageIn}&pageOut=${pageOut}`;
		const queryStr = `${queryString(params)}`;
		if (queryStr) {
			query += `&${queryStr}`;
		}

		return this.http.get(
			`${this.apiUrl}/shopping/department/paginator?${query}`
		);
	}

	createDepartment(department: Department) {
		return this.http.post(`${this.apiUrl}/shopping/department`, department);
	}

	updateDepartment(department: Department) {
		return this.http.put(
			`${this.apiUrl}/shopping/department/${department._id}`,
			department
		);
	}

	deleteDepartment(id) {
		return this.http.delete(`${this.apiUrl}/shopping/department/${id}`);
	}

	verifySortDepartment(company) {
		return this.http.get(
			`${this.apiUrl}/product/sort-verify-department/${company}`
		);
	}

	updateSortDepartment(id, order) {
		return this.http.put(
			`${this.apiUrl}/product/sort-update-department/${id}`,
			{
				order,
			}
		);
	}
}
