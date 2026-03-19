import { Store } from './store';
import { City } from './../city';

export class Company {
    id?: number;
    _id?: string;
    name: string;
    description: string;
    status: boolean;
    showInApp: boolean;
    lat: number;
    lng: number;
    city: City;
    city_id: any;
    group: Store;
    image: string;
    logo: string;
    location: any;
}
