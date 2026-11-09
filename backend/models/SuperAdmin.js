// const mongoose = require("mongoose");

// const superAdminSchema = new mongoose.Schema(
//     {
//         username: {
//             type: String,
//             required: true,
//             unique: true,
//             trim: true
//         },

//         password: {
//             type: String,
//             required: true
//         },

//         name: {
//             type: String,
//             required: true,
//             trim: true
//         },

//         email: {
//             type: String,
//             required: true,
//             unique: true,
//             lowercase: true,
//             trim: true
//         },

//         role: {
//             type: String,
//             default: "SuperAdmin"
//         },

//       status: {
//     type: String,
//     enum: ["Active", "Blocked"],
//     default: "Active"
// },

// otpHash: {
//     type: String,
//     default: null
// },

// otpExpiresAt: {
//     type: Date,
//     default: null
// },

// otpPurpose: {
//     type: String,
//     enum: ["Login", "ResetPassword", null],
//     default: null
// },

// otpAttempts: {
//     type: Number,
//     default: 0
// },

// otpLastSentAt: {
//     type: Date,
//     default: null
// },

// resetTokenHash: {
//     type: String,
//     default: null
// },

// resetTokenExpiresAt: {
//     type: Date,
//     default: null
// }

//     },
//     {
//         timestamps: true
//     }
// );

// module.exports = mongoose.model(
//     "SuperAdmin",
//     superAdminSchema
// );

// console.log("SUPER ADMIN MODEL LOADED");
const mongoose = require("mongoose");

const superAdminSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        pendingEmail: {
    type: String,
    default: null,
    lowercase: true,
    trim: true
},

        role: {
            type: String,
            default: "SuperAdmin"
        },

        status: {
            type: String,
            enum: ["Active", "Blocked"],
            default: "Active"
        },

        // OTP fields
        otpHash: {
            type: String,
            default: null
        },

        otpExpiresAt: {
            type: Date,
            default: null
        },

        // otpPurpose: {
        //     type: String,
        //     enum: ["LOGIN", "RESET_PASSWORD", null],
        //     default: null
        // },
        otpPurpose: {
    type: String,
    enum: [
        "LOGIN",
        "RESET_PASSWORD",
        "CHANGE_EMAIL",
        null
    ],
    default: null
},

        otpAttempts: {
            type: Number,
            default: 0
        },

        otpLastSentAt: {
            type: Date,
            default: null
        },

        // Password reset token
        resetTokenHash: {
            type: String,
            default: null
        },

        resetTokenExpiresAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("SuperAdmin", superAdminSchema);