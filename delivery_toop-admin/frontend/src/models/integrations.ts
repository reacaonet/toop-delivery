import { Company } from './company/company';
export class Integrations {
  id?: number;
  _id?: string;
  company: Company;
  system: string;
  status: boolean;
}
