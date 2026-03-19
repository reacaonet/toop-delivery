import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../environments/environment";

import { Slider } from "./../../../models/mobility/slider";

@Injectable({
	providedIn: "root",
})
export class SliderService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	create(slider: Slider) {
		return this.http.post(`${this.apiUrl}/mobility/slider`, slider);
	}

	get() {
		return this.http.get(`${this.apiUrl}/mobility/slider/list`);
	}

	getPaginator(pageIn, pageOut, target) {
		let getTarget = "";

		if (target) {
			getTarget = `target=${target}`;
		}
		return this.http.get(
			`${this.apiUrl}/v1/mobility/slider/paginator?pageIn=${pageIn}&pageOut=${pageOut}`
		);
	}

	update(slider: Slider) {
		return this.http.put(
			`${this.apiUrl}/mobility/slider/${slider._id}`,
			slider
		);
	}

	delete(id) {
		return this.http.delete(`${this.apiUrl}/mobility/slider/${id}`);
	}
}
