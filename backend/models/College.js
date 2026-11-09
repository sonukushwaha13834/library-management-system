const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema(
    {
        collegeId: {
            type: String,
            required: true,
            unique: true
        },

        collegeName: {
            type: String,
            required: true,
            trim: true
        },

        officialEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

    
libraryAddress: {
    type: String,
    default: "",
    trim: true
},

openingTime: {
    type: String,
    default: "09:00"
},

closingTime: {
    type: String,
    default: "18:00"
},



        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            default: null
        },

//       status: {
//     type: String,
//     enum: ["Pending", "Approved", "Blocked", "Removed"],
//     default: "Pending"
// }
status: {
    type: String,
    enum: [
        "Pending",
        "Active",
        "Approved",
        "Blocked",
        "Removed"
    ],
    default: "Pending"
}

    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("College", collegeSchema);