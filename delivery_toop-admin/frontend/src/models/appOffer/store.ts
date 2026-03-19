import { Company } from './company';

export class Store {
    id?: number;
		_id?: string;
		company?: Company;
    name: string;
    file?: any;
    description?: string;
		status?: boolean;
		logo?: string;
		city?: string;
		image?: string;
		lat?: any;
		lng?: any;
		premium?: boolean;
		location?: [string, string];
}
