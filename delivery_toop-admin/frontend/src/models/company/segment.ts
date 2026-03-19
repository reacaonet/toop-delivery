import { Franchise } from "./../franchise";

export class SegmentModel {
	id?: number;
	_id?: string;
	name: string;
	franchise: Franchise;
	status: boolean;
	images: string[];
	category: string;
	order?: number;
}
