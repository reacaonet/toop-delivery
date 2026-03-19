import { Schema, model } from 'mongoose';

const AppNotification = new Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    userId: String
}, {
    timestamps: true
});

export default model('AppNotification', AppNotification);