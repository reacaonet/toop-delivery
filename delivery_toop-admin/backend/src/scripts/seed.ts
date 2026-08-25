import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/User';
import { CompanyModel } from '../models/Company';
import { env } from '../config';

const MONGO_DB_NAME = env.URL_MONGO.split('/').pop()?.split('?')[0] || 'ecbr';

async function seed() {
  try {
    console.log('[SEED] Connecting to MongoDB...');
    await mongoose.connect(env.URL_MONGO);
    console.log(`[SEED] Connected to database: ${MONGO_DB_NAME}`);

    const existingAdmin = await UserModel.findOne({ email: 'admin@toop.com.br' });
    if (existingAdmin) {
      console.log('[SEED] Admin user already exists. Skipping.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await UserModel.create({
      name: 'Admin Gojá',
      email: 'admin@toop.com.br',
      password: hashedPassword,
      role: 'admin',
      active: true,
    });
    console.log(`[SEED] Admin user created: ${admin.email} (id: ${admin._id})`);

    const company = await CompanyModel.create({
      name: 'Gojá Delivery - Matriz',
      cnpj: '00.000.000/0001-00',
      phone: '(11) 99999-0000',
      email: 'contato@toopdelivery.com.br',
      owner: admin._id,
      active: true,
      category: 'Restaurante',
      address: {
        street: 'Av. Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'Sao Paulo',
        state: 'SP',
        zipCode: '01310-100',
      },
    });
    console.log(`[SEED] Company created: ${company.name} (id: ${company._id})`);

    console.log('[SEED] Done!');
    process.exit(0);
  } catch (error) {
    console.error('[SEED] Error:', error);
    process.exit(1);
  }
}

seed();
