import { Franchise } from "./../franchise";
import { Service } from "./service";

export class Driver {
	_id?: string;
	id?: number;
	franchise?: Franchise;
	name: String;
	phone: String;
	email: String;
	birthDate?: String;
	password?: String;
	services?: [Service];
	carsDocument?: [String];
	cnhDocuments?: [String];
	identityDocuments?: [String];
	selfiePhoto?: [String];
	address?: String;
	location?: String;
	online?: boolean;
	vehicleManufacturer?: String;
	vehicleModel?: String;
	vehicleNameplate?: String;
	vehicleYear?: String;
	vehicleColor?: String;
	accessToken?: String;
	refreshToken?: String;
	timeZone?: String;
	approved?: boolean;
	status?: String;
	appVersion?: String;
	lastQueue?: Date;
	token?: String;
	deletedAt?: String;
	activeRunStatus?: String;
	activeRun?: [String];
}
