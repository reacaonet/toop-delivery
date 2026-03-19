export interface Order {
	_id: string;
	createdAt: string;
	order_number: number;
	payment: {
		total: number;
		status: string;
		totalCompany: number;
		priceDelivery: number;
		cashChange: number;
		typePayment: string;
		valueTip: number;
		serviceCharge: number;
		couponPrice: number;
	};
	shoppingCart: {
		_id: string;
	};
	company: {
		location: {
			coordinates: [number, number];
		};
		name: string;
	};
	customer: {
		person: {
			_id: string;
			name: string;
			phone: string;
		}[];
		_id: string;
	};
	customerDelivery: {
		location: {
			coordinates: [number, number];
		};
		referencePoint: string;
		complement: string;
		address: string;
	};
	typePayment: string;
	typeSchedule: string;
	status: string;
}
