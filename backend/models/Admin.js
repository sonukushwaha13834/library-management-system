const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
    {
        adminId: {
            type: String,
            required: true,
            unique: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            default: null
        },

        phone: {
            type: String,
            default: null
        },

        collegeId: {
            type: String,
            required: true
        },

        role: {
            type: String,
            default: "Admin"
        },

        status: {
            type: String,
            enum: ["Pending", "Active", "Blocked"],
            default: "Pending"
        },
        mustChangePassword: {
    type: Boolean,
    default: true
},

        setupTokenHash: {
            type: String,
            default: null
        },

        setupTokenExpiresAt: {
            type: Date,
        
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Admin", adminSchema);