import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../environments/environment";
import { queryString } from "../../util";

@Injectable({
	providedIn: "root",
})
export class MapService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	autoComplete(address: string) {
		return this.http.post(`${this.apiUrl}/v1/mobility/maps/complete`, { address });
	}

	geocode(params: any) {
		return this.http.post(`${this.apiUrl}/v1/mobility/maps/geo`, params);
	}
}
