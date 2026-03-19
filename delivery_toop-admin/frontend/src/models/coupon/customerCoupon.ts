import { Customer } from './../customer';
import { Coupon } from './coupon';
import { Person } from './../person';
import { Company } from './../company/company';
export class CustomerCoupon {
  id?: number;
  _id?: string;
  company: Company;
  person: Person;
  coupon: Coupon;
  customer: Customer;
}
