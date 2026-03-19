import { Customer } from './../customer';
import { Person } from './../person';

export class AccessFlow {
  id?: number;
  _id?: string;
  name: Person;
  history: string;
  updatedAt: string;
  customer: Customer;
}
