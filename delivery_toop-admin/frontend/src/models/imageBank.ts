import { Packing } from './packing';
export class ImageBank {
  id?: number;
  _id?: string;
  barcode: string;
  productName: string;
  productAccent: string;
  description: string;
  keywords: any;
  packing: any;
  packingAmount: number;
  category: any;
  brand: string;
  groupName: string;
  images: string[];
}
