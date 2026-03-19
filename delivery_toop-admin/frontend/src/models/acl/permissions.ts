import { Roles } from './roles';
export class Permissions {
  id?: number;
  _id?: string;
  name: string;
  roles: Roles;
  route: string;
  level: number;
  title: string;
}
