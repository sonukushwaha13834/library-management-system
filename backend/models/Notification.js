const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        notificationId: {
            type: String,
            unique: true,
            required: true
        },

        studentId: {
            type: String,
            required: true
        },

        collegeId: {
            type: String,
            required: true
        },

        type: {
            type: String,
            enum: [
                "BOOK_REQUEST_APPROVED",
                "BOOK_REQUEST_REJECTED",
                "GENERAL"
            ],
            default: "GENERAL"
        },

        title: {
            type: String,
            required: true
        },

        message: {
            type: String,
            required: true
        },

        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Notification",
    notificationSchema
);