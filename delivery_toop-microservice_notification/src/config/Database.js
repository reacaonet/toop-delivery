import mongoose from 'mongoose';

async function ConnectDB() {
    const uri = process.env.DB_USER && process.env.DB_PASSWORD
        ? `mongodb://${encodeURIComponent(process.env.DB_USER)}:${encodeURIComponent(process.env.DB_PASSWORD)}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?authSource=admin`
        : `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
    await mongoose.connect(uri);
}

function StatusDB() {
    return mongoose.STATES[mongoose.connection.readyState];
}

export {
    ConnectDB,
    StatusDB
};
