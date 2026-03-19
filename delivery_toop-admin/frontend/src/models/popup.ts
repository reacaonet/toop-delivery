import { Company } from './company/company';

export class Popup {
    id?: number;
    _id?: string;
    name: string;
    company: Company;
    startDate: string;
    endDate: string;
    startHour: number;
    endHour: number;
    hours?: any[];
    message: string;
    priorities: string;
    vizualizations: number;
    status: boolean;
    url: string;
    redirectTo: string;
    images: string[];
    isPaused: boolean;
}
