import { TypePaymentServiceModel } from '../models/TypePaymentService';

export class MobilityTypePaymentService {
  async listActive() {
    return TypePaymentServiceModel.find({ status: true });
  }
}

export default new MobilityTypePaymentService();
