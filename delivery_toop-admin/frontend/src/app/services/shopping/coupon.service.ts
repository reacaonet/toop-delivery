import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Coupon } from '../../../models/coupon/coupon';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CouponService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  getCoupons() {
    return this.http.get(`${this.apiUrl}/coupon/list`);
  }

  getCouponsPaginator(pageIn, pageOut) {
    return this.http.get(`${this.apiUrl}/coupon/paginator/?pageIn=${pageIn}&pageOut=${pageOut}`);
  }

  getCustomerCoupon(id, pageIn, pageOut) {
    return this.http.get(`${this.apiUrl}/coupon/coupon-customer-paginator/?pageIn=${pageIn}&pageOut=${pageOut}&coupon=${id}`);
  }

  getCouponsNome(name) {
    if (name === '') {
      name = 'null';
    } else if (name && (typeof name === 'string')) {
      name = name.trim();
    }
    return this.http.get(`${this.apiUrl}/coupon/search?search=${name}`);
  }

  createCoupon(coupon: Coupon) {
    return this.http.post(`${this.apiUrl}/coupon`, coupon);
  }

  updateCoupon(coupon: Coupon) {
    return this.http.put(`${this.apiUrl}/coupon/update/${coupon._id}`, coupon);
  }

  deleteCoupon(id) {
    return this.http.delete(`${this.apiUrl}/coupon/delete/${id}`);
  }

}
