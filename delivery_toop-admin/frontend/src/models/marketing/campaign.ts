export class Campaign {
  id?: number;
  _id?: string;
  name: string;
  disseminationVehicle: string;
  initialDate: string;
  finalDate: string;
  note: string;
  dowloadAndroid: number;
  dowloadIos: number;
  image: string[];
}