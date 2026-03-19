import { Company } from './../company/company';
export class AccessoriesCategory {
    id?: number;
    _id?: string;
    name: string;
    company: any;
    isPaused: boolean;
    products?: any;
    position: number;
}
