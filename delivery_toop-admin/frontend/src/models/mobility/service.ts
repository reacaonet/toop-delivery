export class Service {
	id?: number;
	_id?: string;
	franchise: string;
	name: string;
	capacity: number;
	priceCalculation: string;
	minimumRate: number;
	hourlyPrice: number;
	basePrice: number;
	baseDistance: number;
	timePrice: number;
	currencyPrice: number;
	dispensingMinutes: number;
	ratePerMinute: number;
	file?: string;
	maker?: string;
	peakHours?: [{ _id: string; percent: number }];
	timeZone?: String | any;
}
