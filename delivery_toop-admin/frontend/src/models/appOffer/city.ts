import { State } from '../state';

export class City {
    id?: number;
    _id?: string;
    name: string;
    lat: number;
    lng: number;
    state: State;
    state_id: any;
    center: any;
}
