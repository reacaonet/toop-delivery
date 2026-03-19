import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../environments/environment";

@Injectable({
	providedIn: "root",
})
export class PreRegisterService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	update(id, data: any) {
		return this.http.put(`${this.apiUrl}/pre-register/${id}`, data);
	}

	delete(id) {
		return this.http.delete(`${this.apiUrl}/pre-register/${id}`);
	}
}
