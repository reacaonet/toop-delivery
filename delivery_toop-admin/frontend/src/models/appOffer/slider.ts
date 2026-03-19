import { City } from './../city';
import { Company } from './company';

export class Slider {
    id?: number;
    _id?: string;
    name: string;
    company: Company;
    company_id: any;
    status: boolean;
    startDate: string;
    endDate?: string;
    startHour: number;
    endHour: number
    vizualizations: number;
    priorities: string;
    images: string[];
    file: string;
    city: City;
}
