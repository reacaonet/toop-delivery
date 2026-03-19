import { Person } from './person';
import { Company } from './company/company';
export class Shopper {
  id?: number;
  _id?: string;
  person: Person;
  company: Company;
  status: boolean;
  isOnline: boolean;
  appVersion: string;
}
