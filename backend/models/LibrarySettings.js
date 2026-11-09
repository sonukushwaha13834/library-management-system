
const mongoose = require("mongoose");

const librarySettingsSchema = new mongoose.Schema(
    {
        // Har college ki settings alag rahegi
        collegeId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        // ==============================
        // FINE SETTINGS
        // ==============================

        finePerDay: {
            type: Number,
            default: 5,
            min: 0
        },

        maximumFine: {
            type: Number,
            default: 500,
            min: 0
        },

        gracePeriod: {
            type: Number,
            default: 0,
            min: 0
        },

        // ==============================
        // BOOK SETTINGS
        // ==============================

        maxBooks: {
            type: Number,
            default: 5,
            min: 1
        },

        issueDuration: {
            type: Number,
            default: 14,
            min: 1
        },

        // ==============================
        // NOTIFICATION SETTINGS
        // ==============================

        dueReminder: {
            type: Boolean,
            default: true
        },

        overdueNotification: {
            type: Boolean,
            default: true
        },

        fineNotification: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "LibrarySettings",
    librarySettingsSchema
);

