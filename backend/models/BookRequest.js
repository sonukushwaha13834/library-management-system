
// const mongoose = require("mongoose");

// const bookRequestSchema = new mongoose.Schema(
//     {
//         requestId: {
//             type: String,
//             required: true,
//             unique: true
//         },

//         bookId: {
//             type: String,
//             required: true
//         },

//         studentId: {
//             type: String,
//             required: true
//         },

//         collegeId: {
//             type: String,
//             required: true
//         },

//         title: {
//             type: String,
//             required: true,
//             trim: true
//         },

//         author: {
//             type: String,
//             required: true,
//             trim: true
//         },

//         category: {
//             type: String,
//             default: "General",
//             trim: true
//         },

//         isbn: {
//             type: String,
//             default: null,
//             trim: true
//         },

//         status: {
//             type: String,
//             enum: [
//                 "Pending",
//                 "Approved",
//                 "Rejected",
//                 "Returned"
//             ],
//             default: "Pending"
//         },

//         requestedDate: {
//             type: Date,
//             default: Date.now
//         },

//         issueDate: {
//             type: Date,
//             default: null
//         },

//         dueDate: {
//             type: Date,
//             default: null
//         },

//         returnDate: {
//             type: Date,
//             default: null
//         },

//         lateDays: {
//             type: Number,
//             default: 0
//         },

//         fine: {
//             type: Number,
//             default: 0
//         }
//     },
//     {
//         timestamps: true
//     }
// );

// module.exports = mongoose.model(
//     "BookRequest",
//     bookRequestSchema
// );

const mongoose = require("mongoose");

const bookRequestSchema = new mongoose.Schema(
{


//     paymentStatus: {
//     type: String,
//     enum: ["Pending", "Paid"],
//     default: "Pending"
// },
// paidAmount: {
//     type: Number,
//     default: 0,
//     min: 0
// },
// paymentMethod: {
//     type: String,
//     enum: ["Cash"],
//     default: null
// },
// paidAt: {
//     type: Date,
//     default: null
// },
    // ==================================================
    // REQUEST ID
    // ==================================================

    requestId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },


    // ==================================================
    // STUDENT INFORMATION
    // ==================================================

    studentId: {
        type: String,
        required: true,
        trim: true
    },

    studentName: {
        type: String,
        required: true,
        trim: true
    },

    studentUsername: {
        type: String,
        trim: true,
        default: ""
    },

    studentEmail: {
        type: String,
        trim: true,
        lowercase: true,
        default: ""
    },


    // ==================================================
    // COLLEGE
    // ==================================================

    collegeId: {
        type: String,
        required: true,
        trim: true
    },


    // ==================================================
    // BOOK INFORMATION
    // ==================================================

    bookId: {
        type: String,
        required: true,
        trim: true
    },

    title: {
        type: String,
        required: true,
        trim: true
    },

    author: {
        type: String,
        trim: true,
        default: ""
    },

    category: {
        type: String,
        trim: true,
        default: "General"
    },


    // ==================================================
    // REQUEST STATUS
    // ==================================================

    status: {
        type: String,
        enum: [
            "Pending",
            "Approved",
            "Rejected",
            "Returned"
        ],
        default: "Pending"
    },


    // ==================================================
    // DATES
    // ==================================================

    requestedDate: {
        type: Date,
        default: Date.now
    },

    approvedDate: {
        type: Date,
        default: null
    },

    issuedDate: {
        type: Date,
        default: null
    },

    dueDate: {
        type: Date,
        default: null
    },

    returnedDate: {
        type: Date,
        default: null
    },


    // ==================================================
    // FINE
    // ==================================================

    fine: {
        type: Number,
        default: 0,
        min: 0
    },

    fineStatus: {
        type: String,
        enum: ["Pending", "Paid"],
        default: "Pending"
    },

    paidDate: {
        type: Date,
        default: null
    },
    


    // ==================================================
    // ADMIN INFORMATION
    // ==================================================

    approvedBy: {
        type: String,
        default: ""
    }

},
{
    timestamps: true
}


);

// ==========================================================
// INDEXES
// ==========================================================

bookRequestSchema.index({
collegeId: 1,
studentId: 1
});

bookRequestSchema.index({
collegeId: 1,
bookId: 1
});

bookRequestSchema.index({
collegeId: 1,
status: 1
});


// ==========================================================
// EXPORT MODEL
// ==========================================================

module.exports = mongoose.model(
"BookRequest",
bookRequestSchema
);
