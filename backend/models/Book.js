const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
    {
        bookId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        author: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            default: "General",
            trim: true
        },

        isbn: {
            type: String,
            default: null,
            trim: true
        },

        publisher: {
            type: String,
            default: null,
            trim: true
        },

        /* =================================================
           BOOK COVER
           ================================================= */

        coverData: {
            type: String,
            default: ""
        },

        totalCopies: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },

        availableCopies: {
            type: Number,
            required: true,
            min: 0,
            default: 1
        },

        collegeId: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["Available", "Unavailable"],
            default: "Available"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Book", bookSchema);