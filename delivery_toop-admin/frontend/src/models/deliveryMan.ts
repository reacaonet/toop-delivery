import { Person } from './person';
import { Company } from './company/company';
export class DeliveryMan {
  id?: number;
  _id?: string;
  isOnline: boolean;
  phone: number;
  company?: Company;
  typeOfVehicle: string;
  showFreightValue: boolean;
  board: string;
  model: string;
  manufacturer: string;
  color: string;
  deliveryFee?: {
    percentage: number,
    division: any[]
  };
  bankData?: {
    favoredName?: string,
    bankName?: string,
    agency?: string,
    account?: string,
    typeAccount?: string,
    pixKey?: string,
    pixType?: string,
  };
  merchantId?: string;
  year: number;
  person: Person;
  status: boolean;
  appVersion: string;
	latitude?: any;
	longitude?: any;
	franchise?: any;
}
