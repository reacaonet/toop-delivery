import { Company } from './../company/company';
import { Coupon } from './coupon';

export class CompanyCoupon {
  id?: number;
  _id?: string;
  coupon: Coupon;
  companies: Company;
}
