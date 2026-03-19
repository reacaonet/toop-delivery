import { Product } from './product';
import { Company } from './company/company';

export class Slider {
    id?: number;
    _id?: string;
    name: string;
    company: Company;
    status: boolean;
    vizualizations: number;
    type?: string;
    priorities: string;
    images: string[];
    companyClick: boolean;
    productId: Product;
    foodId: any;
		segment?: string;
		category?: string;
}
