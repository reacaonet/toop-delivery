import { Franchise } from '../franchise';
import { Service } from './service';

export class Drivers {
	id?: number;
	_id?: string;
	franchise: Franchise;
	name: any;
	phone: number;
	email: string;
	password?: string;
	confirmPassword?: string;
	identityDocuments: string;
	birthDate: string;
	status: boolean;
	selfiePhoto: string;
	service: Service;
	address: string;
	approved: boolean;
	online: boolean;
	vehicleManufacturer: string;
	vehicleModel: string;
	vehicleNameplate: string;
	vehicleColor: string;
	activeRunStatus: string;
}
