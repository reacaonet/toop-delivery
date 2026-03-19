import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { DeliveryMan } from '../../models/deliveryMan';

@Injectable({
  providedIn: 'root'
})
export class DeliveryManService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  getDeliveryMan(id?) {
    if (id) {
      return this.http.get(`${this.apiUrl}/delivery-man/list/${id}`);
    }

    return this.http.get(`${this.apiUrl}/delivery-man/list`);
	}

	getNameDeliveryMan(name) {
		return this.http.get(`${this.apiUrl}/delivery-man/by-name/${name}`);
	}

	getDeliveryManStatus(isOnline, onRoute) {
    let filter = '';

    if (isOnline === 'true' || isOnline === 'false') {
      filter += `isOnline=${isOnline}`;
    }

    if (onRoute === 'true') {
      if (filter !== "") {
        filter = `${filter}&`
      }

      filter += `onRoute=${onRoute}`;
    }

    if (filter !== "") {
      filter = `?${filter}`
    }

    return this.http.get(`${this.apiUrl}/delivery-man/DeliveryStatus/${filter}`);
	}

	getCompanyStatus(isOpen) {
    let filter = '';

    if (isOpen === 'true' || isOpen === 'false') {
      filter += `isOpen=${isOpen}`;
    }

    if (filter !== "") {
      filter = `?${filter}`
    }

    return this.http.get(`${this.apiUrl}/v2/company/location${filter}`);
  }

  getDeliveryManFilter(isOnline, onRoute, searchName) {
    let filter = '';

    if (isOnline === 'true' || isOnline === 'false') {
      filter += `isOnline=${isOnline}`;
    }

    if(searchName && typeof searchName === 'string' && searchName.length > 0) {
      if (filter !== '') {
        filter = `${filter}&`;
      }

      filter += `search=${searchName}`;
    }

    if (onRoute === 'true') {
      if (filter !== "") {
        filter = `${filter}&`
      }

      filter += `onRoute=${onRoute}`;
    }

    if (filter !== "") {
      filter = `?${filter}`
    }

    return this.http.get(`${this.apiUrl}/delivery-man/list/${filter}`);
  }

  getDeliveryManPaginator(pageIn, pageOut, personId, companyId, isOnline) {
    let filter = '';

    if (companyId) {
      filter += `&company=${companyId}`;
    }
    if (personId) {
      filter += `&person=${personId}`;
    }
    if (isOnline == 'true' || isOnline == 'false') {
      filter += `&isOnline=${isOnline}`;
    }

    return this.http.get(`${this.apiUrl}/delivery-man/paginator/?pageIn=${pageIn}&pageOut=${pageOut}${filter}`);
	}

	getDeliveryManOnlineLastWeek(deliveryMan: string, pageIn, pageOut) {
		return this.http.get(`${this.apiUrl}/delivery-man/online-last-week/${deliveryMan}?pageIn=${pageIn}&pageOut=${pageOut}`);
	}

  createDeliveryMan(deliveryMan: DeliveryMan) {
    return this.http.post(`${this.apiUrl}/delivery-man`, deliveryMan);
  }

  updateDeliveryMan(deliveryMan: DeliveryMan) {
    return this.http.put(`${this.apiUrl}/delivery-man/update/${deliveryMan._id}`, deliveryMan);
  }

  deleteDeliveryMan(id) {
    return this.http.delete(`${this.apiUrl}/delivery-man/delete/${id}`);
  }

}
