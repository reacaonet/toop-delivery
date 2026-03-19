import { Company } from './company';
import { Store } from './store';

export class Tabloid {
    id?: number;
    _id?: string;
    name: string;
    company: Company;
    store: Store;
    observation: string;
    status: boolean;
    url: string;
    brand?: string;
    expiration_date?: string;
    location?: any;
    city?: string;
}