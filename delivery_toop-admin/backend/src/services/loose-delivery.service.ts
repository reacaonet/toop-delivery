import mongoose from 'mongoose';
import { DeliveryAddressModel } from '../models/DeliveryAddress';
import { OrderModel } from '../models/Order';
import { CompanyModel } from '../models/Company';
import { AppError } from '../middleware/errorHandler';
import crypto from 'crypto';

const TYPE_VEHICLES = ['MOTO', 'CARRO', 'BICICLETA'];

interface LooseDeliveryInput {
  company: string;
  customer: string;
  address: string;
  city?: string;
  district?: string;
  referencePoint?: string;
  streetNumber?: string;
  complement?: string;
  latitude: number;
  longitude: number;
  total: number;
  priceDelivery: number;
  note?: string;
  typeVehicle?: string;
  category?: 'RESIDENCIA' | 'WORK';
}

export class LooseDeliveryService {
  async create(data: LooseDeliveryInput) {
    const {
      company,
      customer,
      address,
      city,
      district,
      referencePoint,
      streetNumber,
      complement,
      latitude,
      longitude,
      total,
      priceDelivery,
      note = '',
      typeVehicle,
      category,
    } = data;

    if (!company || !mongoose.isValidObjectId(company)) {
      throw new AppError('Informe uma empresa válida', 400);
    }

    if (!customer || !mongoose.isValidObjectId(customer)) {
      throw new AppError('Informe um cliente válido', 400);
    }

    if (!address) {
      throw new AppError('Informe o endereço de entrega', 400);
    }

    if (latitude === undefined || latitude === null || isNaN(Number(latitude))) {
      throw new AppError('Informe a latitude da entrega', 400);
    }

    if (longitude === undefined || longitude === null || isNaN(Number(longitude))) {
      throw new AppError('Informe a longitude da entrega', 400);
    }

    const numTotal = Number(total);
    const numPriceDelivery = Number(priceDelivery);

    if (numTotal === undefined || isNaN(numTotal) || numTotal < 0) {
      throw new AppError('Informe o total da encomenda', 400);
    }

    if (numPriceDelivery === undefined || isNaN(numPriceDelivery) || numPriceDelivery < 0) {
      throw new AppError('Informe o preço da entrega', 400);
    }

    const isCompany = await CompanyModel.findById(company)
      .select({ _id: 1, name: 1 })
      .lean();

    if (!isCompany || !isCompany._id) {
      throw new AppError('Para criar entrega avulsa é necessário ter cadastro como empresa', 400);
    }

    const deliveryAddress = await DeliveryAddressModel.create({
      address,
      location: {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)],
      },
      customer,
      main: false,
      city,
      district,
      referencePoint,
      streetNumber,
      complement,
      category: category || 'HOME',
    });

    if (!deliveryAddress || !deliveryAddress._id) {
      throw new AppError('Não foi possível registrar o endereço', 400);
    }

    const order = await OrderModel.create({
      orderNumber: `LD${Date.now()}${crypto.randomInt(1000).toString().padStart(3, '0')}`,
      customer,
      company,
      items: [
        {
          name: 'Entrega avulsa',
          quantity: 1,
          price: numTotal,
          total: numTotal,
        },
      ],
      subtotal: numTotal,
      deliveryFee: numPriceDelivery,
      discount: 0,
      total: numTotal + numPriceDelivery,
      status: 'pending',
      paymentMethod: typeVehicle ? `MONEY-${typeVehicle}` : 'MONEY',
      paymentStatus: 'pending',
      typeOfVehicle: typeVehicle && TYPE_VEHICLES.includes(String(typeVehicle).trim())
        ? String(typeVehicle).trim()
        : undefined,
      deliveryAddress: {
        street: address,
        number: streetNumber || undefined,
        complement: complement || undefined,
        neighborhood: district || undefined,
        city: city || undefined,
        lat: Number(latitude),
        lng: Number(longitude),
      },
      notes: note || undefined,
    });

    return order;
  }

  async validateAddress(_data: { latitude?: number; longitude?: number }) {
    const { latitude, longitude } = _data;
    if (latitude === undefined || longitude === undefined || isNaN(Number(latitude)) || isNaN(Number(longitude))) {
      throw new AppError('Informe as coordenadas', 400);
    }
    // Geocodificação por API externa (Google Maps) não está configurada nesta
    // migração — o endereço é validado/normalizado pelo cliente que o envia.
    return {
      address: null,
      city: null,
      district: null,
      state: null,
      message: 'Geocodificação externa não configurada; envie o endereço no corpo do pedido',
    };
  }
}

export default new LooseDeliveryService();