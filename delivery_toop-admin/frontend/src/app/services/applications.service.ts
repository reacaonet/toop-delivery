import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Applications } from "../../models/applications";


@Injectable({
    providedIn: "root",
})
export class ApplicationsService {
    apiUrl = environment.apiURL;

    constructor(private http: HttpClient) { }

    getPaginator(pageIn, pageOut, name, status, upgrade) {
        let filter = "";
        if (name) {
            filter += `&name=${name}`;
        }
        if (status) {
            filter += `&status=${status}`;
        }
        if (upgrade) {
            filter += `&upgrade=${upgrade}`;
        }
        return this.http.get(
            `${this.apiUrl}/v1/admin/applications/paginator?pageIn=${pageIn}&pageOut=${pageOut}${filter}`
        );
    }

    getByName(name) {
        if (name === "") {
            name = "null";
        } else if (name && typeof name === "string") {
            name = name.trim();
        }
        return this.http.get(
            `${this.apiUrl}/v1/admin/applications/search?name=${name}`
        );
    }

    getById(_id) {
        return this.http.get(`${this.apiUrl}/v1/admin/applications/${_id}`);
    }

    create(applications: Applications) {
        return this.http.post(`${this.apiUrl}/v1/admin/applications`, applications);
    }

    update(applications: Applications) {
        return this.http.put(
            `${this.apiUrl}/v1/admin/applications/${applications._id}`,
            applications
        );
    }

    delete(id) {
        return this.http.delete(`${this.apiUrl}/v1/admin/applications/${id}`);
    }

    adminStyle(domain) {
        return this.http.get(
            `${this.apiUrl}/v1/setting/app/admin/styles?domain=${domain}`
        );
    }

    createTermsOfUse(applications: Applications) {
        return this.http.post(`${this.apiUrl}/v1/admin/applications`, applications);
    }

    getByIdTermsUse(applications) {
        return this.http.get(`${this.apiUrl}/v1/mobility/terms/application/${applications}`, applications);
    }

    updateTermsOfUse(applications: Applications) {
        return this.http.put(
            `${this.apiUrl}/v1/mobility/terms/application/${applications._id}`, applications);
    }
}