const mongoose = require('../database');

const NotificationToolsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,   
    },
    message: {
        type: String,
        required: true,
    },
    groupCompany: {
        type: Boolean,
        required: true,
    },
    numberOfShots: {
        type: String,
        required: true,
    },
    redirectTo: {
        type: Boolean,
        required: true,
    },
    externalURL: {
        type: String,
        required: true,
    },
    showGroupImages: {
        type: Boolean,
        required: true,
    },
}, {
    timestamps: true,
    collection: "notification_tools"
});

const NotificationTools = mongoose.model('NotificationTools', NotificationToolsSchema);

module.exports = NotificationTools;