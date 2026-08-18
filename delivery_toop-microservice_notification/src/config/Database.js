import mongoose from 'mongoose';

async function ConnectDB() {
    await mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`);
}

function StatusDB() {
    return mongoose.STATES[mongoose.connection.readyState];
}

export {
    ConnectDB,
    StatusDB
};
