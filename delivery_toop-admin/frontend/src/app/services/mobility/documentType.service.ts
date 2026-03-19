import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../../environments/environment';

import { DocumentType } from './../../../models/mobility/documentType';

@Injectable({
	providedIn: 'root',
})
export class DocumentTypeService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	get() {
		return this.http.get(`${this.apiUrl}/mobility/supportsubjects/list?status=all`);
	}

	getGraphic() {
		return this.http.get(`${this.apiUrl}/mobility/supportsubjects/graphic`);
	}

	getPaginator(pageIn, pageOut, name) {
		let filter = '';

		filter += '&status=all';
		if (name) {
			filter += `&name=${name}`;
		}

		return this.http.get(`${this.apiUrl}/mobility/documenttypes/paginator?pageIn=${pageIn}&pageOut=${pageOut}${filter}`);
	}

	getNome(name) {
		if (name === '') {
			name = 'null';
		} else if (name && typeof name === 'string') {
			name = name.trim();
		}
		return this.http.get(`${this.apiUrl}/mobility/documenttypes/search?search=${name}`);
	}

	create(data: DocumentType) {
		return this.http.post(`${this.apiUrl}/mobility/documenttypes`, data);
	}

	update(data: DocumentType) {
		return this.http.put(`${this.apiUrl}/mobility/documenttypes/${data._id}`, data);
	}

	delete(id) {
		return this.http.delete(`${this.apiUrl}/mobility/documenttypes/${id}`);
	}
}
