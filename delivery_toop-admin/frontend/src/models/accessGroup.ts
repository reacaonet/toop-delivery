import { Module } from './module';
export class AccessGroup {
  id?: number;
  _id?: string;
  name: string;
  modules: Module;
  status: boolean;
  item: string;
  level: number;
  children: AccessGroup[];
  expandable: boolean;
}
