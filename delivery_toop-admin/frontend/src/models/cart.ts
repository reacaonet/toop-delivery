import { Customer } from './customer';
import { Company } from './company/company';

export class Cart {
    id?: number;
    _id?: string;
    custumer: Customer;
    company: Company;
    status: string;
    isDeleted: boolean;
}
