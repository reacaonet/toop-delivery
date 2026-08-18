import mongoose from 'mongoose';

const connect = async (): Promise<void> => {
  const uri = process.env.URL_MONGO || `mongodb://${process.env.MONGO_ADMIN_USER}:${process.env.MONGO_ADMIN_PASSWORD}@admin-mongodb:27017/ecbr?authSource=admin`;

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected for queueSplit');
  } catch (err) {
    console.error('MongoDB connection failed (non-critical):', (err as Error).message);
  }
};

export default connect;
