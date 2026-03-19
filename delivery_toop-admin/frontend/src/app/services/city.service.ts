import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../environments/environment";

import { City } from "./../../models/city";

@Injectable({
	providedIn: "root",
})
export class CityService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	getCity(state = "") {
		return this.http.get(`${this.apiUrl}/setting/city?state=${state}`);
	}

	getCityName(name) {
		let search = "";
		if (name && typeof name === "string" && name.length && name.trim().length) {
			search = name.trim();
		}

		return this.http.get(`${this.apiUrl}/setting/city/?name=${search}`);
	}

	createCity(city: City) {
		return this.http.post(`${this.apiUrl}/setting/city`, city);
	}

	getPaginator(pageIn, pageOut, name) {
    let filter = '';

    if (name) {
      filter += `&name=${name}`;
    }
    return this.http.get(`${this.apiUrl}/setting/city/paginator/?pageIn=${pageIn}&pageOut=${pageOut}${filter}`);
  }

	updateCity(city: City) {
		return this.http.put(`${this.apiUrl}/setting/city/${city._id}`, city);
	}

	deleteCity(id) {
		return this.http.delete(`${this.apiUrl}/setting/city/${id}`);
	}
}
