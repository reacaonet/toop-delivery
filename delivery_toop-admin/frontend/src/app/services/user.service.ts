import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../environments/environment";
import { Observable, of } from "rxjs";

import { User } from "./../../models/user";
import { User as UserModel } from "./../core/auth/_models/user.model";

@Injectable({
	providedIn: "root",
})
export class UserService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	auth(user: User): Observable<UserModel> {
		return this.http.post<UserModel>(`${this.apiUrl}/users/auth-admin`, user);
	}

	getUser() {
		return this.http.get(`${this.apiUrl}/users`);
	}

	getUserPaginator(pageIn, pageOut, personId, companyId) {
		let filter = "";

		if (personId) {
			filter += `&person=${personId}`;
		}
		if (companyId) {
			filter += `&company=${companyId}`;
		}

		return this.http.get(
			`${this.apiUrl}/users/paginator/?pageIn=${pageIn}&pageOut=${pageOut}${filter}`
		);
	}

	createUser(user: User) {
		return this.http.post(`${this.apiUrl}/users`, user);
	}

	updateUser(user: any) {
		return this.http.put(`${this.apiUrl}/users/${user._id}`, user);
	}

	changeUser(user: any) {
		return this.http.put(`${this.apiUrl}/users/${user._id}/change`, user);
	}

	updateSelectedFranchise(user: any) {
		return this.http.put(
			`${this.apiUrl}/users/${user._id}/update-selected-franchise`,
			user
		);
	}

	updateSelectedCompany(user: any) {
		return this.http.put(
			`${this.apiUrl}/users/${user._id}/update-selected-company`,
			user
		);
	}

	deleteUser(id) {
		return this.http.delete(`${this.apiUrl}/users/${id}`);
	}
}
