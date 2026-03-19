import { Company } from './company/company';
export class Schedule {
    id?: number;
    _id?: string;
    company: Company;
    dayWeek: any;
    startHour: number;
    endHour: number;
    hours?: any[];
}
