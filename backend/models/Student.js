const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        studentId: {
            type: String,
            required: true,
            unique: true
        },

        fullName: {
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
            required: true
        },

        // =========================
        // STUDENT COURSE
        // =========================
        course: {
            type: String,
            required: true,
            trim: true
        },

        collegeId: {
            type: String,
            required: true
        },

        role: {
            type: String,
            default: "Student"
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Active",
                "Rejected",
                "Blocked"
            ],
            default: "Pending"
        },

        emailVerified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "Student",
        studentSchema
    );