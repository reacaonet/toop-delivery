import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { environment } from "../../../environments/environment";

@Injectable({
	providedIn: "root",
})
export class SendUploadsService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	async uploadDocument(formData) {
		const req = await fetch(`${this.apiUrl}/v2/upload`, {
			method: "POST",
			body: formData,
		});

		if (!req.ok) {
			return false;
		}

		const response = await req.json();
		if (!response.url) {
			return false;
		}

		return response.url;
	}
}
