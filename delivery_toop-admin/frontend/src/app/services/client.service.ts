import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({
	providedIn: "root",
})
export class ClientService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	paginator(pageIn, pageOut, name) {
		let filter = "";

		if (name) {
			filter += `&name=${name}`;
		}

		return this.http.get(
			`${this.apiUrl}/v1/client/paginator?pageIn=${pageIn}&pageOut=${pageOut}${filter}`
		);
	}

	searchClient(name) {
		if (name === "") {
			name = "null";
		} else if (name && typeof name === "string") {
			name = name.trim();
		}

		return this.http.get(`${this.apiUrl}/v1/client/search?search=${name}`);
	}

	create(client: any) {
		return this.http.post(`${this.apiUrl}/v1/client`, client);
	}

	update(client: any) {
		return this.http.put(`${this.apiUrl}/v1/client/${client._id}`, client);
	}

	delete(id) {
		return this.http.delete(`${this.apiUrl}/v1/client/${id}`);
	}
}
