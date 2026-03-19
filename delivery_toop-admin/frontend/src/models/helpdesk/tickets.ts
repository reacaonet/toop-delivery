import { Person } from '../person';
import { Company } from '../company/company';
import { Interactions } from './interactions';

export class Tickets {
  id?: number;
  _id?: string;
  tickedId: string;
  subject: string;
  description: string;
  company: Company;
  person: Person;
  priority: string;
  department: string;
  status: string;
	createdAt: string;
	intetactions?: Interactions[];
	lastIntetactions?: Interactions[];
}
