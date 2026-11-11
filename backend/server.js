const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
// const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const cors = require("cors");

const College = require("./models/College");
const AdminRequest = require("./models/AdminRequest");
const Admin = require("./models/Admin");
const SuperAdmin = require("./models/SuperAdmin");
const Student = require("./models/Student");
const Book = require("./models/Book");
const BookRequest = require("./models/BookRequest");
const Notification = require("./models/notification");
const LibrarySettings = require("./models/LibrarySettings");

const app = express();


// ======================================================
// BASIC CONFIGURATION
// ======================================================

const PORT = process.env.PORT || 5000;

const FRONTEND_URL =
    process.env.FRONTEND_URL ||
    "http://127.0.0.1:5500";


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
    cors({
        origin: true,
        credentials: true
    })
);
app.use(express.json({ limit: "10mb" }));
app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb"
    })
);


// ======================================================
// UPLOAD FOLDERS
// ======================================================

const uploadRoot =
    path.join(
        __dirname,
        "uploads"
    );

const adminRequestUploadDir =
    path.join(
        uploadRoot,
        "admin-requests"
    );


if (!fs.existsSync(uploadRoot)) {

    fs.mkdirSync(
        uploadRoot,
        {
            recursive: true
        }
    );

}


if (!fs.existsSync(adminRequestUploadDir)) {

    fs.mkdirSync(
        adminRequestUploadDir,
        {
            recursive: true
        }
    );

}


// ======================================================
// MULTER CONFIGURATION
// ======================================================

const storage =
    multer.diskStorage({

        destination:
            function (
                req,
                file,
                cb
            ) {

                cb(
                    null,
                    adminRequestUploadDir
                );

            },


        filename:
            function (
                req,
                file,
                cb
            ) {

                const extension =
                    path.extname(
                        file.originalname
                    );


                const uniqueName =
                    Date.now() +
                    "-" +
                    crypto
                        .randomBytes(8)
                        .toString("hex") +
                    extension;


                cb(
                    null,
                    uniqueName
                );

            }

    });


const fileFilter =
    function (
        req,
        file,
        cb
    ) {

        const allowedTypes = [

            "image/jpeg",
            "image/jpg",
            "image/png"

        ];


        if (
            allowedTypes.includes(
                file.mimetype
            )
        ) {

            cb(
                null,
                true
            );

        } else {

            cb(
                new Error(
                    "Only JPG, JPEG and PNG files are allowed."
                )
            );

        }

    };


const upload =
    multer({

        storage,

        fileFilter,

        limits: {

            fileSize:
                5 * 1024 * 1024

        }

    });


// ======================================================
// EMAIL CONFIGURATION
// ======================================================

// let transporter = null;


// if (
//     process.env.EMAIL_USER &&
//     process.env.EMAIL_PASS
// ) {

//     transporter = nodemailer.createTransport({

//         host: "smtp.gmail.com",

//         port: 465,

//         secure: true,

//         auth: {

//             user:
//                 process.env.EMAIL_USER,

//             pass:
//                 process.env.EMAIL_PASS

//         }

//     });


//     transporter.verify(
//         function (
//             error,
//             success
//         ) {

//             if (error) {

//                 console.error(
//                     "Email transporter error:",
//                     error
//                 );

//             } else {

//                 console.log(
//                     "Email transporter configured successfully."
//                 );

//             }

//         }
//     );

// } else {

//     console.warn(
//         "EMAIL_USER or EMAIL_PASS missing. Email sending disabled."
//     );

// }

// ==========================================================
// RESEND EMAIL CONFIGURATION
// ==========================================================

let transporter = null;

if (
    process.env.RESEND_API_KEY &&
    process.env.EMAIL_FROM
) {

    transporter = {

        async sendMail(mailOptions) {

            const recipients = Array.isArray(mailOptions.to)
                ? mailOptions.to
                : [mailOptions.to];

            // const emailData = {

            //     sender: {
            //         name: "Library Management System",
            //         email: process.env.EMAIL_FROM
            //     },

            //     to: recipients,

            //     subject: mailOptions.subject

            // };

            // if (mailOptions.html) {
            //     emailData.htmlContent = mailOptions.html;
            // }

            // if (mailOptions.text) {
            //     emailData.textContent = mailOptions.text;
            // }

            // const response = await fetch(
            //     "https://api.resend.com/emails",
            //     {
            //         method: "POST",

            //         headers: {
            //             "Authorization":
            //                 `Bearer ${process.env.RESEND_API_KEY}`,

            //             "Content-Type": "application/json"
            //         },

            //         body: JSON.stringify(emailData)
            //     }
            // );

            // const result = await response.json();

            // if (!response.ok) {
            //     throw new Error(
            //         `Resend API Error: ${response.status} - ${
            //             result.message || JSON.stringify(result)
            //         }`
            //     );
            // }

            // return {
            //     messageId: result.id
            // };


const emailData = {
    from: process.env.EMAIL_FROM,
    to: recipients,
    subject: mailOptions.subject
};

if (mailOptions.html) {
    emailData.html = mailOptions.html;
}

if (mailOptions.text) {
    emailData.text = mailOptions.text;
}

const response = await fetch(
    "https://api.resend.com/emails",
    {
        method: "POST",

        headers: {
            "Authorization":
                `Bearer ${process.env.RESEND_API_KEY}`,

            "Content-Type": "application/json"
        },

        body: JSON.stringify(emailData)
    }
);

const result = await response.json().catch(() => ({}));

if (!response.ok) {
    throw new Error(
        `Resend API Error: ${response.status} - ${
            result.message || JSON.stringify(result)
        }`
    );
}

return {
    messageId: result.id
};


        }

    };

    console.log("Resend email API configured successfully.");

} else {

    console.warn(
        "Resend API key or EMAIL_FROM missing. Email sending disabled."
    );

}

// let transporter = null;

// if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {

//     transporter = nodemailer.createTransport({
//         host: "smtp.gmail.com",
//         port: 587,
//         secure: false,
//         requireTLS: true,

//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS
//         },

//         connectionTimeout: 20000,
//         greetingTimeout: 20000,
//         socketTimeout: 30000
//     });

//     transporter.verify()
//         .then(() => {
//             console.log("Email transporter configured successfully.");
//         })
//         .catch((error) => {
//             console.error("Email transporter error:", error.message);
//         });

// } else {
//     console.warn("EMAIL_USER or EMAIL_PASS missing. Email sending disabled.");
// }



// ======================================================
// DATABASE CONNECTION
// ======================================================

// const MONGODB_URI =
//     process.env.MONGODB_URI ||
//     process.env.MONGO_URI;


// if (!MONGODB_URI) {

//     console.error(
//         "MongoDB URI is missing in .env file."
//     );

// } else {

//     mongoose
//         .connect(MONGODB_URI)
//         .then(
//             function () {

//                 console.log(
//                     "MongoDB Connected"
//                 );

//             }
//         )
//         .catch(
//             function (error) {

//                 console.error(
//                     "MongoDB Connection Error:",
//                     error
//                 );

//             }
//         );

// }

const MONGODB_URI =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI;

if (!MONGODB_URI) {

    console.error(
        "MongoDB URI is missing in .env file."
    );

} else {

    mongoose
        .connect(MONGODB_URI)
        .then(function () {

            console.log("MongoDB Connected");

        })
        .catch(function (error) {

            console.error("\n========== MONGODB CONNECTION ERROR ==========");
            console.error("Error Name:", error.name);
            console.error("Error Message:", error.message);

            if (error.reason && error.reason.servers) {

                for (const [address, server] of error.reason.servers) {

                    console.log("\nServer:", address);
                    console.log("Server Status:", server.type);

                    if (server.error) {
                        console.log("Actual Error:", server.error.message);
                        console.log("Error Code:", server.error.code);
                        console.log("Error Name:", server.error.name);
                    } else {
                        console.log("Actual Error: Not available");
                    }

                }

            }

            console.error("\n==============================================");

        });

}


// ======================================================
// JWT SECRET
// ======================================================
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in environment variables.");
}
// ======================================================
// HELPER - GENERATE JWT
// ======================================================

function generateToken(payload) {

    return jwt.sign(
        payload,
        JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

}


// ======================================================
// AUTHENTICATE ADMIN
// ======================================================

async function authenticateAdmin(req, res, next) {

    try {

        const authHeader = req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                success: false,
                message: "Authentication token required."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            JWT_SECRET
        );

        if (decoded.role !== "Admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access required."
            });
        }

        // FIND ADMIN IN DATABASE
        const admin = await Admin.findOne({
            adminId: decoded.adminId,
            collegeId: decoded.collegeId
        });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Admin account not found."
            });
        }

        if (admin.status !== "Active") {
            return res.status(403).json({
                success: false,
                message: "Your admin account is not active."
            });
        }

        // ALLOW PASSWORD CHANGE ROUTE
        const isPasswordChangeRoute =
            req.path === "/api/auth/admin-change-password";

        // BLOCK OTHER ADMIN ROUTES UNTIL PASSWORD CHANGES
        if (
            admin.mustChangePassword === true &&
            !isPasswordChangeRoute
        ) {
            return res.status(403).json({
                success: false,
                mustChangePassword: true,
                message: "Please change your temporary password first."
            });
        }

        req.user = decoded;

        next();

    } catch (error) {

        console.error(
            "Admin Authentication Error:",
            error
        );

        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token."
        });

    }
}

// ======================================================
// AUTHENTICATE SUPER ADMIN
// ======================================================

function authenticateSuperAdmin(
    req,
    res,
    next
) {

    try {

        const authHeader =
            req.headers.authorization;


        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res
                .status(401)
                .json({

                    success: false,

                    message:
                        "Authentication token required."

                });

        }


        const token =
            authHeader.split(" ")[1];


        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );


        if (
            decoded.role !== "SuperAdmin"
        ) {

            return res
                .status(403)
                .json({

                    success: false,

                    message:
                        "Super Admin access required."

                });

        }


        req.user =
            decoded;


        next();


    } catch (error) {

        console.error(
            "Super Admin Authentication Error:",
            error
        );


        return res
            .status(401)
            .json({

                success: false,

                message:
                    "Invalid or expired authentication token."

            });

    }

}


// ======================================================
// AUTHENTICATE STUDENT
// ======================================================

function authenticateStudent(
    req,
    res,
    next
) {

    try {

        const authHeader =
            req.headers.authorization;


        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res
                .status(401)
                .json({

                    success: false,

                    message:
                        "Authentication token required."

                });

        }


        const token =
            authHeader.split(" ")[1];


        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );


        if (
            decoded.role !== "Student"
        ) {

            return res
                .status(403)
                .json({

                    success: false,

                    message:
                        "Student access required."

                });

        }


        req.user =
            decoded;


        next();


    } catch (error) {

        console.error(
            "Student Authentication Error:",
            error
        );


        return res
            .status(401)
            .json({

                success: false,

                message:
                    "Invalid or expired authentication token."

            });

    }

}


// ======================================================
// BASIC TEST ROUTE
// ======================================================

app.get(
    "/",
    function (req, res) {

        res.json({

            success: true,

            message:
                "Library Management System Backend",

            server:
                `http://127.0.0.1:${PORT}`,

            frontend:
                FRONTEND_URL

        });

    }
);


// ======================================================
// HEALTH CHECK
// ======================================================

app.get(
    "/api/health",
    function (req, res) {

        return res.json({

            success: true,

            message:
                "Backend is running.",

            database:
                mongoose.connection.readyState === 1
                    ? "Connected"
                    : "Disconnected"

        });

    }
);


// ======================================================
// STUDENT LOGIN
// ======================================================

app.post(
    "/api/auth/student-login",
    async function (req, res) {

        try {

            const {
                username,
                password
            } = req.body;


            if (
                !username ||
                !password
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Username and password are required."

                    });

            }


            const cleanUsername =
                String(username)
                    .trim()
                    .toLowerCase();


            const student =
                await Student.findOne({

                    username:
                        cleanUsername

                });


            if (!student) {

                return res
                    .status(401)
                    .json({

                        success: false,

                        message:
                            "Invalid username or password."

                    });

            }


            if (
                student.status !== "Active"
            ) {

                return res
                    .status(403)
                    .json({

                        success: false,

                        message:
                            `Student account is ${student.status}.`

                    });

            }


            const passwordMatch =
                await bcrypt.compare(
                    password,
                    student.password
                );


            if (!passwordMatch) {

                return res
                    .status(401)
                    .json({

                        success: false,

                        message:
                            "Invalid username or password."

                    });

            }


            const token =
                generateToken({

                    studentId:
                        student.studentId,

                    username:
                        student.username,

                    collegeId:
                        student.collegeId,

                    role:
                        "Student"

                });


            return res.json({

                success: true,

                message:
                    "Student login successful.",

                token:

                    token,

                student: {

                    studentId:
                        student.studentId,

                    fullName:
                        student.fullName,

                    username:
                        student.username,

                    email:
                        student.email,

                    course:
                        student.course,

                    collegeId:
                        student.collegeId,

                    role:
                        "Student",

                    status:
                        student.status

                }

            });


        } catch (error) {

            console.error(
                "Student Login Error:",
                error
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Unable to login student."

                });

        }

    }
);


// ======================================================
// STUDENT - CURRENT PROFILE
// ======================================================
app.get("/api/student/me", authenticateStudent, async (req, res) => {
    try {
        // ==========================================
        // FIND STUDENT
        // ==========================================

        const student = await Student.findOne({
            studentId: req.user.studentId,
            collegeId: req.user.collegeId
        }).select("-password");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        // ==========================================
        // FIND COLLEGE
        // ==========================================

        const college = await College.findOne({
            collegeId: student.collegeId
        });

        if (!college) {
            return res.status(404).json({
                success: false,
                message: "College information not found."
            });
        }

        // ==========================================
        // FIND ADMIN
        // ==========================================

        let admin = null;

        if (college.adminId) {
            admin = await Admin.findById(college.adminId)
                .select("-password -setupTokenHash -setupTokenExpiresAt");
        }

        // ==========================================
        // RESPONSE
        // ==========================================

        return res.json({
            success: true,

            student: {
                studentId: student.studentId,
                fullName: student.fullName,
                username: student.username,
                email: student.email,
                course: student.course,
                collegeId: student.collegeId,
                role: student.role,
                status: student.status
            },

            college: {
                collegeId: college.collegeId,
                collegeName: college.collegeName,
                officialEmail: college.officialEmail,
                status: college.status
            },

            admin: admin
                ? {
                    adminId: admin.adminId,
                    name: admin.name,
                    username: admin.username,
                    email: admin.email,
                    phone: admin.phone
                }
                : null
        });

    } catch (error) {
        console.error("Student profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load student information."
        });
    }
});


// ==========================================================
// STUDENT - DASHBOARD STATS
// ==========================================================

app.get(
    "/api/student/dashboard-stats",
    authenticateStudent,
    async (req, res) => {

        try {

            const studentId =
                req.user.studentId;

            const collegeId =
                req.user.collegeId;


            // ==================================================
            // AVAILABLE BOOK COPIES
            // ==================================================

            const availableBooksResult =
                await Book.aggregate([

                    {
                        $match: {
                            collegeId: collegeId,
                            status: "Available"
                        }
                    },

                    {
                        $group: {
                            _id: null,

                            totalAvailableCopies: {
                                $sum: "$availableCopies"
                            }
                        }
                    }

                ]);


            const availableBooks =
                availableBooksResult.length > 0
                    ? availableBooksResult[0]
                        .totalAvailableCopies
                    : 0;


            // ==================================================
            // CURRENTLY ISSUED BOOKS
            // ==================================================

            const issuedBooks =
                await BookRequest.find({

                    studentId: studentId,

                    collegeId: collegeId,

                    status: "Approved"

                }).sort({

                    dueDate: 1

                });


            // ==================================================
            // DUE SOON
            // Next 7 Days
            // ==================================================

            const today =
                new Date();


            const next7Days =
                new Date();


            next7Days.setDate(
                next7Days.getDate() + 7
            );


            let dueSoon = 0;


            issuedBooks.forEach(
                function (book) {

                    if (!book.dueDate) {
                        return;
                    }


                    const dueDate =
                        new Date(
                            book.dueDate
                        );


                    if (
                        dueDate >= today &&
                        dueDate <= next7Days
                    ) {

                        dueSoon++;

                    }

                }
            );


            // ==================================================
            // TOTAL FINE
            // ==================================================

            const fineResult =
                await BookRequest.aggregate([

                    {
                        $match: {

                            studentId: studentId,

                            collegeId: collegeId

                        }
                    },

                    {
                        $group: {

                            _id: null,

                            totalFine: {
                                $sum: "$fine"
                            }

                        }
                    }

                ]);


            const totalFine =
                fineResult.length > 0
                    ? fineResult[0].totalFine
                    : 0;


            // ==================================================
            // RESPONSE
            // ==================================================

            return res.json({

                success: true,

                stats: {

                    availableBooks:
                        availableBooks,

                    issuedBooks:
                        issuedBooks.length,

                    dueSoon:
                        dueSoon,

                    totalFine:
                        totalFine

                }

            });


        } catch (error) {

            console.error(
                "Student Dashboard Stats Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load dashboard statistics."

            });

        }

    }
);


// ======================================================
// STUDENT - SESSION CHECK
// ======================================================

app.get(
    "/api/student/ping",
    authenticateStudent,
    function (req, res) {

        return res.json({

            success: true,

            message:
                "Student session is valid.",

            studentId:
                req.user.studentId,

            collegeId:
                req.user.collegeId

        });

    }
);


// ======================================================
// ADMIN LOGIN
// ======================================================

app.post(
    "/api/auth/admin-login",
    async function (req, res) {

        try {

            const {
                username,
                password
            } = req.body;


            if (
                !username ||
                !password
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Username and password are required."

                    });

            }


            const cleanUsername =
                String(username)
                    .trim()
                    .toLowerCase();


            const admin =
                await Admin.findOne({

                    $or: [

                        {
                            username:
                                cleanUsername
                        },

                        {
                            email:
                                cleanUsername
                        }

                    ]

                });


            if (!admin) {

                return res
                    .status(401)
                    .json({

                        success: false,

                        message:
                            "Invalid Admin username/email or password."

                    });

            }


            if (
                admin.status !== "Active"
            ) {

                return res
                    .status(403)
                    .json({

                        success: false,

                        message:
                            `Admin account is ${admin.status}.`

                    });

            }


            const passwordMatch =
                await bcrypt.compare(
                    password,
                    admin.password
                );


            if (!passwordMatch) {

                return res
                    .status(401)
                    .json({

                        success: false,

                        message:
                            "Invalid Admin username/email or password."

                    });

            }


            const token =
                generateToken({

                    adminId:
                        admin.adminId,

                    username:
                        admin.username,

                    email:
                        admin.email,

                    collegeId:
                        admin.collegeId,

                    role:
                        "Admin",

                    status:
                        admin.status

                });


            return res.json({

                success: true,

                message:
                    "Admin login successful.",

                token:

                    token,

                admin: {

                    adminId:
                        admin.adminId,

                    name:
                        admin.name,

                    username:
                        admin.username,

                    email:
                        admin.email,

                    collegeId:
                        admin.collegeId,

                    role:
                        "Admin",

                    status:
                        admin.status,

                    mustChangePassword:
                        admin.mustChangePassword || false

                }

            });


        } catch (error) {

            console.error(
                "Admin Login Error:",
                error
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Unable to login admin."

                });

        }

    }
);
// ======================================================
// SUPER ADMIN LOGIN
// ======================================================

app.post(
    "/api/auth/super-admin-login",
    async function (req, res) {

        try {

            const {
                username,
                password
            } = req.body;


            if (
                !username ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Username and password are required."

                });

            }


            const cleanUsername =
                String(username)
                    .trim()
                    .toLowerCase();


            const superAdmin =
                await SuperAdmin.findOne({

                    $or: [

                        {
                            username:
                                cleanUsername
                        },

                        {
                            email:
                                cleanUsername
                        }

                    ]

                });


            if (!superAdmin) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid Super Admin username or password."

                });

            }


            if (
                superAdmin.status !==
                "Active"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        `Super Admin account is ${superAdmin.status}.`

                });

            }


            const passwordMatch =
                await bcrypt.compare(
                    password,
                    superAdmin.password
                );


            if (!passwordMatch) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid Super Admin username or password."

                });

            }


            const token =
                generateToken({

                    superAdminId:
                        superAdmin._id,

                    username:
                        superAdmin.username,

                    email:
                        superAdmin.email,

                    role:
                        "SuperAdmin",

                    status:
                        superAdmin.status

                });


            return res.json({

                success: true,

                message:
                    "Super Admin login successful.",

                token:

                    token,

                superAdmin: {

                    id:
                        superAdmin._id,

                    username:
                        superAdmin.username,

                    name:
                        superAdmin.name,

                    email:
                        superAdmin.email,

                    role:
                        "SuperAdmin",

                    status:
                        superAdmin.status

                }

            });


        } catch (error) {

            console.error(
                "Super Admin Login Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to login Super Admin."

            });

        }

    }
);


// ======================================================
// SUPER ADMIN - CURRENT PROFILE
// ======================================================

app.get(
    "/api/super-admin/profile",
    authenticateSuperAdmin,
    async function (req, res) {

        try {

            const superAdmin =
                await SuperAdmin.findById(
                    req.user.superAdminId
                ).select(
                    "-password"
                );


            if (!superAdmin) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Super Admin profile not found."

                });

            }


            return res.json({

                success: true,

                superAdmin:
                    superAdmin

            });


        } catch (error) {

            console.error(
                "Super Admin Profile Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load Super Admin profile."

            });

        }

    }
);


// ======================================================
// SUPER ADMIN - UPDATE PROFILE
// ======================================================

app.put(
    "/api/super-admin/profile",
    authenticateSuperAdmin,
    async function (req, res) {

        try {

            const {
                name,
                email
            } = req.body;


            if (
                !name ||
                !email
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name and email are required."

                });

            }


            const superAdmin =
                await SuperAdmin.findById(
                    req.user.superAdminId
                );


            if (!superAdmin) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Super Admin profile not found."

                });

            }


            superAdmin.name =
                String(name).trim();


            superAdmin.email =
                String(email)
                    .trim()
                    .toLowerCase();


            await superAdmin.save();


            return res.json({

                success: true,

                message:
                    "Super Admin profile updated successfully.",

                superAdmin: {

                    id:
                        superAdmin._id,

                    username:
                        superAdmin.username,

                    name:
                        superAdmin.name,

                    email:
                        superAdmin.email,

                    role:
                        superAdmin.role,

                    status:
                        superAdmin.status

                }

            });


        } catch (error) {

            console.error(
                "Update Super Admin Profile Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to update Super Admin profile."

            });

        }

    }
);


// ======================================================
// SUPER ADMIN - CHANGE PASSWORD
// ======================================================

app.put(
    "/api/super-admin/change-password",
    authenticateSuperAdmin,
    async function (req, res) {

        try {

            const {
                currentPassword,
                newPassword
            } = req.body;


            if (
                !currentPassword ||
                !newPassword
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Current password and new password are required."

                });

            }


            if (
                String(newPassword).length < 6
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "New password must contain at least 6 characters."

                });

            }


            const superAdmin =
                await SuperAdmin.findById(
                    req.user.superAdminId
                );


            if (!superAdmin) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Super Admin not found."

                });

            }


            const passwordMatch =
                await bcrypt.compare(
                    currentPassword,
                    superAdmin.password
                );


            if (!passwordMatch) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Current password is incorrect."

                });

            }


            superAdmin.password =
                await bcrypt.hash(
                    newPassword,
                    12
                );


            await superAdmin.save();


            return res.json({

                success: true,

                message:
                    "Password changed successfully."

            });


        } catch (error) {

            console.error(
                "Super Admin Password Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to change password."

            });

        }

    }
);


// ======================================================
// ADMIN - CURRENT PROFILE
// ======================================================

app.get(
    "/api/admin/profile",
    authenticateAdmin,
    async function (req, res) {

        try {

            const admin =
                await Admin.findOne({

                    adminId:
                        req.user.adminId,

                    collegeId:
                        req.user.collegeId

                }).select(
                    "-password -setupToken -setupTokenExpiresAt"
                );


            if (!admin) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Admin profile not found."

                });

            }


            return res.json({

                success: true,

                admin:
                    admin

            });


        } catch (error) {

            console.error(
                "Admin Profile Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load admin profile."

            });

        }

    }
);


// ======================================================
// ADMIN - UPDATE PROFILE
// ======================================================

app.put(
    "/api/admin/profile",
    authenticateAdmin,
    async function (req, res) {
        try {
            const { name, username, email, phone } = req.body;

            if (!name?.trim() || !username?.trim() || !email?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Name, username and email are required."
                });
            }

            const admin = await Admin.findOne({
                adminId: req.user.adminId,
                collegeId: req.user.collegeId
            });

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: "Admin not found."
                });
            }

            const cleanUsername = username.trim().toLowerCase();
            const cleanEmail = email.trim().toLowerCase();

            // Check if another admin already uses this username
            const existingUsername = await Admin.findOne({
                username: cleanUsername,
                _id: { $ne: admin._id }
            });

            if (existingUsername) {
                return res.status(409).json({
                    success: false,
                    message: "This username is already taken."
                });
            }

            // Check if another admin already uses this email
            const existingEmail = await Admin.findOne({
                email: cleanEmail,
                _id: { $ne: admin._id }
            });

            if (existingEmail) {
                return res.status(409).json({
                    success: false,
                    message: "This email is already in use."
                });
            }

            admin.name = name.trim();
            admin.username = cleanUsername;
            admin.email = cleanEmail;
            admin.phone = phone?.trim() || null;

            await admin.save();

            return res.json({
                success: true,
                message: "Admin profile updated successfully.",
                admin: {
                    adminId: admin.adminId,
                    name: admin.name,
                    username: admin.username,
                    email: admin.email,
                    phone: admin.phone,
                    collegeId: admin.collegeId,
                    role: admin.role,
                    status: admin.status
                }
            });

        } catch (error) {
            console.error("Update Admin Profile Error:", error);

            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "Username or email is already in use."
                });
            }

            return res.status(500).json({
                success: false,
                message: "Unable to update admin profile."
            });
        }
    }
);


// ======================================================
// ADMIN - DASHBOARD STUDENT STATS
// ======================================================

app.get(
    "/api/admin/dashboard-stats",
    authenticateAdmin,
    async function (req, res) {

        try {

            const totalStudents =
                await Student.countDocuments({

                    collegeId:
                        req.user.collegeId

                });


            const activeStudents =
                await Student.countDocuments({

                    collegeId:
                        req.user.collegeId,

                    status:
                        "Active"

                });


            const pendingStudents =
                await Student.countDocuments({

                    collegeId:
                        req.user.collegeId,

                    status:
                        "Pending"

                });


            return res.json({

                success: true,

                stats: {

                    totalStudents:
                        totalStudents,

                    activeStudents:
                        activeStudents,

                    pendingStudents:
                        pendingStudents,

                    collegeId:
                        req.user.collegeId

                }

            });


        } catch (error) {

            console.error(
                "Admin Dashboard Stats Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load dashboard statistics."

            });

        }

    }
);


// ======================================================
// ADMIN - GET OWN COLLEGE STUDENTS
// ======================================================

app.get(
    "/api/admin/students",
    authenticateAdmin,
    async function (req, res) {

        try {

            // GET ALL STUDENTS OF ADMIN'S COLLEGE
            const students =
                await Student.find({
                    collegeId:
                        req.user.collegeId
                })
                .select("-password")
                .sort({
                    createdAt: -1
                })
                .lean();


            // GET CURRENTLY ISSUED BOOK COUNT
            // FOR EACH STUDENT
            const studentsWithBookCount =
                await Promise.all(

                    students.map(
                        async function (student) {

                            const booksIssued =
                                await BookRequest.countDocuments({

                                    studentId:
                                        student.studentId,

                                    collegeId:
                                        req.user.collegeId,

                                    status:
                                        "Approved"

                                });


                            return {

                                ...student,

                                booksIssued:
                                    booksIssued

                            };

                        }
                    )

                );


            // SEND RESPONSE
            return res.json({

                success: true,

                students:
                    studentsWithBookCount

            });


        } catch (error) {

            console.error(
                "Admin Students Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load students."

            });

        }

    }
);


// // ======================================================
// // ADMIN - GET OWN COLLEGE STUDENTS
// // ======================================================

// app.get(
//     "/api/admin/students",
//     authenticateAdmin,
//     async function (req, res) {

//         try {

//             const students =
//                 await Student.find({

//                     collegeId:
//                         req.user.collegeId

//                 })
//                 .select("-password")
//                 .sort({

//                     createdAt:
//                         -1

//                 });


//             return res.json({

//                 success: true,

//                 students:
//                     students

//             });


//         } catch (error) {

//             console.error(
//                 "Admin Students Error:",
//                 error
//             );


//             return res.status(500).json({

//                 success: false,

//                 message:
//                     "Unable to load students."

//             });

//         }

//     }
// );


// ======================================================
// ADMIN - CREATE STUDENT
// ======================================================

app.post(
    "/api/admin/students",
    authenticateAdmin,
    async function (req, res) {

        try {

            const {
                fullName,
                email,
                course,
                status
            } = req.body;


            // --------------------------------------------------
            // VALIDATION
            // --------------------------------------------------

            if (
                !fullName ||
                !email ||
                !course ||
                !status
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Full name, email, course and status are required."

                });

            }


            // --------------------------------------------------
            // CLEAN DATA
            // --------------------------------------------------

            const cleanName =
                String(fullName).trim();

            const cleanEmail =
                String(email)
                    .trim()
                    .toLowerCase();

            const cleanCourse =
                String(course).trim();


            // --------------------------------------------------
            // CHECK EMAIL
            // --------------------------------------------------

            const existingEmail =
                await Student.findOne({

                    email:
                        cleanEmail

                });


            if (existingEmail) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email already exists."

                });

            }


            // --------------------------------------------------
            // GENERATE USERNAME
            // --------------------------------------------------

            const nameParts =
                cleanName
                    .toLowerCase()
                    .split(/\s+/);


            const firstName =
                nameParts[0] || "student";


            const lastName =
                nameParts.length > 1
                    ? nameParts[nameParts.length - 1]
                    : "";


            let username =
                lastName
                    ? `${firstName}.${lastName}`
                    : firstName;


            username =
                username.replace(
                    /[^a-z0-9.]/g,
                    ""
                );


            username =
                username +
                Math.floor(
                    1000 +
                    Math.random() * 9000
                );


            // --------------------------------------------------
            // MAKE USERNAME UNIQUE
            // --------------------------------------------------

            let usernameExists =
                await Student.findOne({

                    username:
                        username

                });


            while (usernameExists) {

                username =
                    username.replace(
                        /\d+$/,
                        ""
                    ) +
                    Math.floor(
                        1000 +
                        Math.random() * 9000
                    );


                usernameExists =
                    await Student.findOne({

                        username:
                            username

                    });

            }


            // --------------------------------------------------
            // GENERATE TEMPORARY PASSWORD
            // --------------------------------------------------

            const temporaryPassword =
                "Lib@" +
                Math.random()
                    .toString(36)
                    .slice(2, 8) +
                Math.floor(
                    10 +
                    Math.random() * 90
                );


            // --------------------------------------------------
            // GENERATE STUDENT ID
            // --------------------------------------------------

            const studentId =
                "STU" +
                String(
                    Date.now()
                ).slice(-6);


            // --------------------------------------------------
            // HASH PASSWORD
            // --------------------------------------------------

            const hashedPassword =
                await bcrypt.hash(
                    temporaryPassword,
                    10
                );


            // --------------------------------------------------
            // CREATE STUDENT
            // --------------------------------------------------

            const student =
                await Student.create({

                    studentId:
                        studentId,

                    fullName:
                        cleanName,

                    username:
                        username,

                    email:
                        cleanEmail,

                    password:
                        hashedPassword,

                    course:
                        cleanCourse,

                    collegeId:
                        req.user.collegeId,

                    role:
                        "Student",

                    status:
                        status,

                    emailVerified:
                        true

                });


            // --------------------------------------------------
            // SEND LOGIN CREDENTIALS
            // --------------------------------------------------

            let emailSent =
                false;


            if (transporter) {

                try {

                    const mailInfo =
                        await transporter.sendMail({

                            from:
                                process.env.EMAIL_FROM,

                            to:
                                student.email,

                            subject:
                                "Library Management System - Student Account",

                            html: `

                                <div style="
                                    font-family: Arial, sans-serif;
                                    line-height: 1.6;
                                    max-width: 600px;
                                    margin: auto;
                                ">

                                    <h2>
                                        Welcome to Library Management System
                                    </h2>

                                    <p>
                                        Hello
                                        <strong>
                                            ${student.fullName}
                                        </strong>,
                                    </p>

                                    <p>
                                        Your student account has been
                                        created by your college administrator.
                                    </p>

                                    <h3>
                                        Your Login Credentials
                                    </h3>

                                    <p>
                                        <strong>
                                            Username:
                                        </strong>
                                        ${student.username}
                                    </p>

                                    <p>
                                        <strong>
                                            Temporary Password:
                                        </strong>
                                        ${temporaryPassword}
                                    </p>

                                    <p>
                                        <strong>
                                            Student ID:
                                        </strong>
                                        ${student.studentId}
                                    </p>

                                    <p>
                                        Please keep these credentials safe.
                                    </p>

                                    <p>
                                        You can use these credentials
                                        to login through the Library
                                        Management System.
                                    </p>

                                    <br>

                                    <p>
                                        Regards,<br>
                                        Library Management System
                                    </p>

                                </div>

                            `

                        });


                    emailSent =
                        true;


                    console.log(
                        "Student credentials email sent:",
                        mailInfo.messageId
                    );


                } catch (emailError) {

                    console.error(
                        "Student Email Error:",
                        emailError
                    );

                }

            } else {

                console.error(
                    "Student email not sent: transporter unavailable."
                );

            }


            // --------------------------------------------------
            // RESPONSE
            // --------------------------------------------------

            return res.status(201).json({

                success: true,

                message:
                    emailSent
                        ? "Student account created successfully and login credentials were emailed."
                        : "Student account created successfully, but email could not be sent.",

                emailSent:
                    emailSent,

                student: {

                    studentId:
                        student.studentId,

                    fullName:
                        student.fullName,

                    username:
                        student.username,

                    email:
                        student.email,

                    course:
                        student.course,

                    collegeId:
                        student.collegeId,

                    status:
                        student.status

                }

            });


        } catch (error) {

            console.error(
                "Create Student Error:",
                error
            );


            if (
                error.code === 11000
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Student ID, username or email already exists."

                });

            }


            return res.status(500).json({

                success: false,

                message:
                    "Unable to create student."

            });

        }

    }
);


// ======================================================
// ADMIN - GET SINGLE STUDENT
// ======================================================

app.get(
    "/api/admin/students/:studentId",
    authenticateAdmin,
    async function (req, res) {

        try {

            const student =
                await Student.findOne({

                    studentId:
                        req.params.studentId,

                    collegeId:
                        req.user.collegeId

                }).select("-password");


            if (!student) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Student not found."

                });

            }


            return res.json({

                success: true,

                student:
                    student

            });


        } catch (error) {

            console.error(
                "Get Single Student Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load student details."

            });

        }

    }
);


// ======================================================
// ADMIN - UPDATE STUDENT
// ======================================================

app.put(
    "/api/admin/students/:studentId",
    authenticateAdmin,
    async function (req, res) {

        try {

            const {
                fullName,
                email,
                course,
                studentId,
                status
            } = req.body;


            if (
                !fullName ||
                !email ||
                !course
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Full name, email and course are required."

                });

            }


            const student =
                await Student.findOne({

                    studentId:
                        req.params.studentId,

                    collegeId:
                        req.user.collegeId

                });


            if (!student) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Student not found."

                });

            }


            const cleanEmail =
                String(email)
                    .trim()
                    .toLowerCase();


            // --------------------------------------------------
            // CHECK DUPLICATE EMAIL
            // --------------------------------------------------

            const duplicateEmail =
                await Student.findOne({

                    email:
                        cleanEmail,

                    _id: {
                        $ne:
                            student._id
                    }

                });


            if (duplicateEmail) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Email already exists."

                });

            }


            student.fullName =
                String(fullName).trim();


            student.email =
                cleanEmail;


            student.course =
                String(course).trim();


            // --------------------------------------------------
            // OPTIONAL STUDENT ID UPDATE
            // --------------------------------------------------

            if (
                studentId &&
                String(studentId).trim()
            ) {

                const cleanStudentId =
                    String(studentId).trim();


                const duplicateId =
                    await Student.findOne({

                        studentId:
                            cleanStudentId,

                        _id: {
                            $ne:
                                student._id
                        }

                    });


                if (duplicateId) {

                    return res.status(409).json({

                        success: false,

                        message:
                            "Student ID already exists."

                    });

                }


                student.studentId =
                    cleanStudentId;

            }


            if (status) {

                student.status =
                    status;

            }


            await student.save();


            return res.json({

                success: true,

                message:
                    "Student updated successfully.",

                student: {

                    studentId:
                        student.studentId,

                    fullName:
                        student.fullName,

                    username:
                        student.username,

                    email:
                        student.email,

                    course:
                        student.course,

                    collegeId:
                        student.collegeId,

                    status:
                        student.status

                }

            });


        } catch (error) {

            console.error(
                "Update Student Error:",
                error
            );


            if (
                error.code === 11000
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Student ID, username or email already exists."

                });

            }


            return res.status(500).json({

                success: false,

                message:
                    "Unable to update student."

            });

        }

    }
);


// ======================================================
// ADMIN - DELETE STUDENT
// ======================================================

app.delete(
    "/api/admin/students/:studentId",
    authenticateAdmin,
    async function (req, res) {

        try {

            const student =
                await Student.findOne({

                    studentId:
                        req.params.studentId,

                    collegeId:
                        req.user.collegeId

                });


            if (!student) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Student not found."

                });

            }


            await Student.deleteOne({

                _id:
                    student._id

            });


            return res.json({

                success: true,

                message:
                    "Student deleted successfully."

            });


        } catch (error) {

            console.error(
                "Delete Student Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to delete student."

            });

        }

    }
);


// ======================================================
// ADMIN - GET PENDING STUDENTS
// ======================================================

app.get(
    "/api/admin/students/pending",
    authenticateAdmin,
    async function (req, res) {

        try {

            const students =
                await Student.find({

                    collegeId:
                        req.user.collegeId,

                    status:
                        "Pending"

                })
                .select("-password")
                .sort({

                    createdAt:
                        -1

                });


            return res.json({

                success: true,

                students:
                    students

            });


        } catch (error) {

            console.error(
                "Pending Students Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load pending students."

            });

        }

    }
);


// ======================================================
// ADMIN - APPROVE STUDENT
// ======================================================

app.put(
    "/api/admin/students/:studentId/approve",
    authenticateAdmin,
    async function (req, res) {

        try {

            const student =
                await Student.findOne({

                    studentId:
                        req.params.studentId,

                    collegeId:
                        req.user.collegeId

                });


            if (!student) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Student not found."

                });

            }


            student.status =
                "Active";


            await student.save();


            return res.json({

                success: true,

                message:
                    "Student approved successfully."

            });


        } catch (error) {

            console.error(
                "Approve Student Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to approve student."

            });

        }

    }
);


// ======================================================
// ADMIN - REJECT STUDENT
// ======================================================

app.put(
    "/api/admin/students/:studentId/reject",
    authenticateAdmin,
    async function (req, res) {

        try {

            const student =
                await Student.findOne({

                    studentId:
                        req.params.studentId,

                    collegeId:
                        req.user.collegeId

                });


            if (!student) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Student not found."

                });

            }


            student.status =
                "Rejected";


            await student.save();


            return res.json({

                success: true,

                message:
                    "Student rejected successfully."

            });


        } catch (error) {

            console.error(
                "Reject Student Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to reject student."

            });

        }

    }
);


// ==================================================
// ADMIN - COLLEGE / LIBRARY INFORMATION
// ==================================================

app.get(
    "/api/admin/college-settings",
    authenticateAdmin,
    async (req, res) => {
        try {
            const collegeId = req.user.collegeId;

            const college = await College.findOne({
                collegeId: collegeId
            }).select(
                "collegeId collegeName officialEmail libraryAddress openingTime closingTime"
            );

            if (!college) {
                return res.status(404).json({
                    success: false,
                    message: "College not found."
                });
            }

            return res.json({
                success: true,
                college: college
            });

        } catch (error) {
            console.error(
                "Library Information GET Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to load library information."
            });
        }
    }
);


app.put(
    "/api/admin/college-settings",
    authenticateAdmin,
    async (req, res) => {
        try {
            const collegeId = req.user.collegeId;

            const {
                libraryName,
                libraryEmail,
                libraryAddress,
                openingTime,
                closingTime
            } = req.body;

            if (!libraryName || !libraryEmail) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Library name and email are required."
                });
            }

            const college = await College.findOne({
                collegeId: collegeId
            });

            if (!college) {
                return res.status(404).json({
                    success: false,
                    message: "College not found."
                });
            }

            college.collegeName =
                String(libraryName).trim();

            college.officialEmail =
                String(libraryEmail)
                    .trim()
                    .toLowerCase();

            college.libraryAddress =
                String(libraryAddress || "").trim();

            college.openingTime =
                String(openingTime || "09:00");

            college.closingTime =
                String(closingTime || "18:00");

            await college.save();

            return res.json({
                success: true,
                message:
                    "Library information saved successfully.",
                college: {
                    collegeId: college.collegeId,
                    collegeName:
                        college.collegeName,
                    officialEmail:
                        college.officialEmail,
                    libraryAddress:
                        college.libraryAddress,
                    openingTime:
                        college.openingTime,
                    closingTime:
                        college.closingTime
                }
            });

        } catch (error) {
            console.error(
                "Library Information Update Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to save library information."
            });
        }
    }
);
// ==================================================
// ADMIN LIBRARY SETTINGS - GET
// ==================================================

app.get(
    "/api/admin/settings",
    authenticateAdmin,
    async (req, res) => {
        try {
            const collegeId = req.user.collegeId;

            let settings = await LibrarySettings.findOne({
                collegeId: collegeId
            });

            // Agar pehli baar settings load ho rahi hain
            // to default settings automatically create hongi
            if (!settings) {
                settings = await LibrarySettings.create({
                    collegeId: collegeId
                });
            }

            return res.json({
                success: true,
                settings: settings
            });

        } catch (error) {
            console.error(
                "Admin Settings GET Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Unable to load library settings."
            });
        }
    }
);


// ==================================================
// ADMIN LIBRARY SETTINGS - UPDATE
// ==================================================

app.put(
    "/api/admin/settings",
    authenticateAdmin,
    async (req, res) => {
        try {
            const collegeId = req.user.collegeId;

            const {
                finePerDay,
                maximumFine,
                gracePeriod,
                maxBooks,
                issueDuration,
                dueReminder,
                overdueNotification,
                fineNotification
            } = req.body;


            // ==============================
            // BASIC VALIDATION
            // ==============================

            if (
                finePerDay === undefined ||
                maximumFine === undefined ||
                gracePeriod === undefined ||
                maxBooks === undefined ||
                issueDuration === undefined
            ) {
                return res.status(400).json({
                    success: false,
                    message: "All library settings are required."
                });
            }


            if (Number(finePerDay) < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Fine per day cannot be negative."
                });
            }


            if (Number(maximumFine) < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Maximum fine cannot be negative."
                });
            }


            if (Number(gracePeriod) < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Grace period cannot be negative."
                });
            }


            if (Number(maxBooks) < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Maximum books must be at least 1."
                });
            }


            if (Number(issueDuration) < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Issue duration must be at least 1 day."
                });
            }


            // ==============================
            // UPDATE / CREATE SETTINGS
            // ==============================

            const settings =
                await LibrarySettings.findOneAndUpdate(
                    {
                        collegeId: collegeId
                    },
                    {
                        collegeId: collegeId,

                        finePerDay:
                            Number(finePerDay),

                        maximumFine:
                            Number(maximumFine),

                        gracePeriod:
                            Number(gracePeriod),

                        maxBooks:
                            Number(maxBooks),

                        issueDuration:
                            Number(issueDuration),

                        dueReminder:
                            Boolean(dueReminder),

                        overdueNotification:
                            Boolean(overdueNotification),

                        fineNotification:
                            Boolean(fineNotification)
                    },
                    {
                        new: true,
                        upsert: true,
                        runValidators: true
                    }
                );


            return res.json({
                success: true,
                message: "Library settings saved successfully.",
                settings: settings
            });

        } catch (error) {
            console.error(
                "Admin Settings Update Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Unable to save library settings."
            });
        }
    }
);


// ==========================================================
// STUDENT - BROWSE BOOKS
// ==========================================================

app.get(
    "/api/student/books",
    authenticateStudent,
    async (req, res) => {

        try {

            const books = await Book.find({
                collegeId: req.user.collegeId,
                availableCopies: { $gt: 0 },
                status: "Available"
            })
            .select(
                "bookId title author category isbn publisher totalCopies availableCopies status coverData"
            )
            .sort({
                title: 1
            });

            return res.json({
                success: true,
                count: books.length,
                books: books
            });

        } catch (error) {

            console.error(
                "Student books error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to load books."
            });
        }
    }
);
// ======================================================
// GET SINGLE BOOK DETAILS - STUDENT
// ======================================================

app.get(
    "/api/student/books/:bookId",
    authenticateStudent,
    async (req, res) => {
        try {

            const book = await Book.findOne({
                bookId: req.params.bookId,
                collegeId: req.user.collegeId
            }).select(
                "bookId title author category isbn publisher totalCopies availableCopies status coverData"
            );

            if (!book) {
                return res.status(404).json({
                    success: false,
                    message: "Book not found."
                });
            }

            return res.json({
                success: true,
                book: book
            });

        } catch (error) {

            console.error(
                "Student book details error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to load book details."
            });
        }
    }
);

// ==========================================================
// STUDENT - REQUEST BOOK
// ==========================================================

app.post(
    "/api/student/book-requests",
    authenticateStudent,
    async (req, res) => {

        try {

            const { bookId } = req.body;

            // ----------------------------------------------
            // VALIDATION
            // ----------------------------------------------

            if (!bookId) {

                return res.status(400).json({
                    success: false,
                    message: "Book ID is required."
                });

            }


            // ----------------------------------------------
            // FIND STUDENT
            // ----------------------------------------------

            const student =
                await Student.findOne({
                    studentId: req.user.studentId,
                    collegeId: req.user.collegeId
                });

            if (!student) {

                return res.status(404).json({
                    success: false,
                    message: "Student not found."
                });

            }


            // ----------------------------------------------
            // FIND BOOK
            // ----------------------------------------------

            const book =
                await Book.findOne({
                    bookId: String(bookId).trim(),
                    collegeId: req.user.collegeId
                });

            if (!book) {

                return res.status(404).json({
                    success: false,
                    message: "Book not found."
                });

            }


            // ----------------------------------------------
            // CHECK AVAILABILITY
            // ----------------------------------------------

            if (
                book.availableCopies <= 0 ||
                book.status !== "Available"
            ) {

                return res.status(400).json({
                    success: false,
                    message: "This book is currently unavailable."
                });

            }


            // ----------------------------------------------
            // CHECK EXISTING REQUEST
            // ----------------------------------------------

            const existingRequest =
                await BookRequest.findOne({

                    bookId: book.bookId,

                    studentId:
                        req.user.studentId,

                    collegeId:
                        req.user.collegeId,

                    status: {
                        $in: [
                            "Pending",
                            "Approved"
                        ]
                    }

                });

            if (existingRequest) {

                return res.status(409).json({
                    success: false,
                    message:
                        "You have already requested this book."
                });

            }


            // ----------------------------------------------
            // GENERATE REQUEST ID
            // ----------------------------------------------

            const requestId =
                "REQ" +
                Date.now().toString().slice(-8);


            // ----------------------------------------------
            // CREATE REQUEST
            // ----------------------------------------------

            const request =
                await BookRequest.create({

                    requestId:

                        requestId,

                    studentId:

                        student.studentId,

                    studentName:

                        student.fullName,

                    studentUsername:

                        student.username,

                    studentEmail:

                        student.email,

                    collegeId:

                        student.collegeId,

                    bookId:

                        book.bookId,

                    title:

                        book.title,

                    author:

                        book.author,

                    category:

                        book.category,

                    status:

                        "Pending",

                    requestedDate:

                        new Date()

                });


            // ----------------------------------------------
            // SUCCESS
            // ----------------------------------------------

            return res.status(201).json({

                success: true,

                message:
                    "Book request submitted successfully.",

                request:

                    request

            });

        } catch (error) {

            console.error(
                "Student Book Request Error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to submit book request."

            });

        }

    }
);
// ==========================================================
// STUDENT - GET MY BOOK REQUESTS
// ==========================================================

app.get(
    "/api/student/book-requests",
    authenticateStudent,
    async (req, res) => {

        try {

            const requests =
                await BookRequest.find({

                    studentId:
                        req.user.studentId,

                    collegeId:
                        req.user.collegeId

                })
                .sort({
                    createdAt: -1
                });

            return res.json({

                success: true,

                count:
                    requests.length,

                requests:
                    requests

            });

        } catch (error) {

            console.error(
                "Student Book Requests Error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to load your book requests."

            });

        }

    }
);
// ==========================================================
// ADMIN - GET BOOK REQUESTS
// ==========================================================

app.get(
    "/api/admin/book-requests",
    authenticateAdmin,
    async (req, res) => {

        try {

            const requests =
                await BookRequest.find({
                    collegeId:
                        req.user.collegeId
                })
                .sort({
                    createdAt: -1
                })
                .lean();


            /*
             * Add actual Student + Book
             * information to every request.
             */

            const enrichedRequests =
                await Promise.all(

                    requests.map(
                        async function (request) {

                            /*
                             * Find student
                             */

                            const student =
                                await Student.findOne({

                                    studentId:
                                        request.studentId,

                                    collegeId:
                                        req.user.collegeId

                                })
                                .select(
                                    "studentId fullName username email course"
                                )
                                .lean();


                            /*
                             * Find book
                             */

                            const book =
                                await Book.findOne({

                                    bookId:
                                        request.bookId,

                                    collegeId:
                                        req.user.collegeId

                                })
                                .select(
                                    "bookId title author category isbn publisher totalCopies availableCopies status"
                                )
                                .lean();


                            /*
                             * Return original request
                             * + actual student details
                             * + actual book details
                             */

                            return {

                                ...request,


                                /* =====================
                                   STUDENT DETAILS
                                   ===================== */

                                studentName:
                                    student?.fullName ||
                                    request.studentName ||
                                    "Unknown Student",

                                studentId:
                                    student?.studentId ||
                                    request.studentId ||
                                    "N/A",

                                studentUsername:
                                    student?.username ||
                                    request.studentUsername ||
                                    "",

                                studentEmail:
                                    student?.email ||
                                    request.studentEmail ||
                                    "Email not available",

                                studentCourse:
                                    student?.course ||
                                    "Course not available",


                                /* =====================
                                   BOOK DETAILS
                                   ===================== */

                                bookId:
                                    book?.bookId ||
                                    request.bookId ||
                                    "",

                                title:
                                    book?.title ||
                                    request.title ||
                                    "Unknown Book",

                                author:
                                    book?.author ||
                                    request.author ||
                                    "Unknown Author",

                                category:
                                    book?.category ||
                                    request.category ||
                                    "General",

                                isbn:
                                    book?.isbn ||
                                    "N/A",

                                publisher:
                                    book?.publisher ||
                                    "N/A",

                                totalCopies:
                                    book?.totalCopies ??
                                    0,

                                availableCopies:
                                    book?.availableCopies ??
                                    0,

                                bookStatus:
                                    book?.status ||
                                    "Unavailable"

                            };

                        }
                    )

                );


            return res.json({

                success: true,

                count:
                    enrichedRequests.length,

                requests:
                    enrichedRequests

            });
} catch (error) {
    console.error("Admin Book Requests Error:", error);

    return res.status(500).json({
        success: false,
        message: error.message || "Unknown server error"
    });
}

     

        

    }
);


/* =========================================================
   ADMIN REPORTS & ANALYTICS
   MongoDB Based
   ========================================================= */

app.get(
    "/api/admin/reports",
    authenticateAdmin,
    async (req, res) => {

        try {

            const collegeId =
                req.user.collegeId;


            /* =================================================
               TOTAL BOOKS
               ================================================= */

            const totalBooks =
                await Book.countDocuments({
                    collegeId: collegeId
                });


            /* =================================================
               TOTAL STUDENTS
               ================================================= */

            const totalStudents =
                await Student.countDocuments({
                    collegeId: collegeId,
                    status: "Active"
                });


            /* =================================================
               BOOK REQUESTS
               ================================================= */

            const allRequests =
                await BookRequest.find({
                    collegeId: collegeId
                })
                .sort({
                    createdAt: -1
                })
                .lean();


            /* =================================================
               BOOKS ISSUED
               Currently issued
               ================================================= */

            const booksIssued =
                allRequests.filter(
                    function (request) {

                        return (
                            request.status ===
                            "Approved"
                        );

                    }
                ).length;


            /* =================================================
               BOOKS RETURNED
               ================================================= */

            const booksReturned =
                allRequests.filter(
                    function (request) {

                        return (
                            request.status ===
                            "Returned"
                        );

                    }
                ).length;


            /* =================================================
               OVERDUE BOOKS
               ================================================= */

            const now =
                new Date();

            let overdueCount = 0;


            allRequests.forEach(
                function (request) {

                    if (
                        request.status !==
                        "Approved"
                    ) {
                        return;
                    }


                    if (!request.dueDate) {
                        return;
                    }


                    const dueDate =
                        new Date(
                            request.dueDate
                        );


                    if (
                        !isNaN(
                            dueDate.getTime()
                        ) &&
                        dueDate < now
                    ) {

                        overdueCount++;

                    }

                }
            );


            /* =================================================
               AVAILABLE BOOK COPIES
               ================================================= */

            const books =
                await Book.find({
                    collegeId: collegeId
                })
                .select(
                    "bookId title author totalCopies availableCopies"
                )
                .lean();


            let availableCopies = 0;

            let totalCopies = 0;


            books.forEach(
                function (book) {

                    totalCopies +=
                        Number(
                            book.totalCopies
                        ) || 0;

                    availableCopies +=
                        Number(
                            book.availableCopies
                        ) || 0;

                }
            );


            /* =================================================
               CURRENTLY ISSUED COPIES
               ================================================= */

            const currentlyIssued =
                Math.max(
                    0,
                    totalCopies -
                    availableCopies
                );


            /* =================================================
               POPULAR BOOKS
               Based on request count
               ================================================= */

            const popularMap =
                {};


            allRequests.forEach(
                function (request) {

                    const bookId =
                        request.bookId ||
                        "UNKNOWN";


                    if (
                        !popularMap[bookId]
                    ) {

                        popularMap[bookId] = {

                            bookId:
                                bookId,

                            title:
                                request.title ||
                                "Unknown Book",

                            author:
                                request.author ||
                                "Unknown Author",

                            requests:
                                0

                        };

                    }


                    popularMap[bookId]
                        .requests++;

                }
            );


            const popularBooks =
                Object.values(
                    popularMap
                )
                .sort(
                    function (a, b) {

                        return (
                            b.requests -
                            a.requests
                        );

                    }
                )
                .slice(
                    0,
                    5
                );


            /* =================================================
               RECENT STUDENT ACTIVITY
               ================================================= */

            const recentActivity =
                allRequests
                .slice(
                    0,
                    5
                )
                .map(
                    function (request) {

                        let activity =
                            "Requested";

                        if (
                            request.status ===
                            "Approved"
                        ) {

                            activity =
                                "Issued";

                        }
                        else if (
                            request.status ===
                            "Returned"
                        ) {

                            activity =
                                "Returned";

                        }
                        else if (
                            request.status ===
                            "Rejected"
                        ) {

                            activity =
                                "Rejected";

                        }


                        return {

                            studentName:
                                request.studentName ||
                                "Unknown Student",

                            bookTitle:
                                request.title ||
                                "Unknown Book",

                            activity:
                                activity,

                            date:
                                request.createdAt ||
                                request.requestedDate ||
                                null

                        };

                    }
                );


            /* =================================================
               MONTHLY ACTIVITY
               Last 6 months
               ================================================= */

            const monthlyActivity = [];


            for (
                let i = 5;
                i >= 0;
                i--
            ) {

                const start =
                    new Date();

                start.setDate(1);

                start.setHours(
                    0,
                    0,
                    0,
                    0
                );

                start.setMonth(
                    start.getMonth() - i
                );


                const end =
                    new Date(
                        start
                    );

                end.setMonth(
                    end.getMonth() + 1
                );


                let issued = 0;

                let returned = 0;


                allRequests.forEach(
                    function (request) {

                        const requestDate =
                            request.issuedDate ||
                            request.approvedDate ||
                            request.requestedDate ||
                            request.createdAt;


                        if (!requestDate) {
                            return;
                        }


                        const date =
                            new Date(
                                requestDate
                            );


                        if (
                            date >= start &&
                            date < end
                        ) {

                            if (
                                request.status ===
                                "Approved"
                            ) {

                                issued++;

                            }


                            if (
                                request.status ===
                                "Returned"
                            ) {

                                returned++;

                            }

                        }

                    }
                );


                monthlyActivity.push({

                    month:
                        start.toLocaleDateString(
                            "en-US",
                            {
                                month: "short"
                            }
                        ),

                    issued:
                        issued,

                    returned:
                        returned

                });

            }


            /* =================================================
               FINAL RESPONSE
               ================================================= */

            return res.json({

                success: true,

                statistics: {

                    totalBooks:
                        totalBooks,

                    totalStudents:
                        totalStudents,

                    booksIssued:
                        booksIssued,

                    booksReturned:
                        booksReturned,

                    availableCopies:
                        availableCopies,

                    currentlyIssued:
                        currentlyIssued,

                    overdueCount:
                        overdueCount

                },

                popularBooks:
                    popularBooks,

                recentActivity:
                    recentActivity,

                monthlyActivity:
                    monthlyActivity

            });


        } catch (error) {

            console.error(
                "Admin Reports Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load reports."

            });

        }

    }
);




// ==========================================================
// ADMIN - GET NOTIFICATIONS
// ==========================================================

app.get(
    "/api/admin/notifications",
    authenticateAdmin,
    async (req, res) => {

        try {

            const requests =
                await BookRequest.find({

                    collegeId:
                        req.user.collegeId

                })
                .sort({
                    updatedAt: -1,
                    createdAt: -1
                })
                .limit(20)
                .lean();


            const notifications =
                requests.map(function (request) {

                    let title =
                        "New Book Request";

                    let message =
                        `${request.studentName || "A student"} requested "${request.title || "a book"}".`;

                    let icon =
                        "📚";


                    if (request.status === "Approved") {

                        title =
                            "Book Request Approved";

                        message =
                            `"${request.title || "Book"}" was issued to ${request.studentName || "a student"}.`;

                        icon =
                            "📖";

                    } else if (
                        request.status === "Rejected"
                    ) {

                        title =
                            "Book Request Rejected";

                        message =
                            `Request for "${request.title || "Book"}" from ${request.studentName || "a student"} was rejected.`;

                        icon =
                            "❌";

                    } else if (
                        request.status === "Returned"
                    ) {

                        title =
                            "Book Returned";

                        message =
                            `${request.studentName || "A student"} returned "${request.title || "Book"}".`;

                        icon =
                            "↩️";
                    }


                    return {

                        notificationId:
                            request.requestId,

                        title:
                            title,

                        message:
                            message,

                        icon:
                            icon,

                        status:
                            request.status || "Pending",

                        createdAt:
                            request.updatedAt ||
                            request.createdAt ||
                            request.requestedDate

                    };

                });


            const unreadCount =
                requests.filter(function (request) {

                    return request.status === "Pending";

                }).length;


            return res.json({

                success: true,

                notifications:
                    notifications,

                unreadCount:
                    unreadCount

            });


        } catch (error) {

            console.error(
                "Admin Notifications Error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to load admin notifications."

            });

        }

    }
);
// ==========================================================
// ADMIN - APPROVE BOOK REQUEST
// ==========================================================

app.put(
    "/api/admin/book-requests/:requestId/approve",
    authenticateAdmin,
    async (req, res) => {

        try {

            const request =
                await BookRequest.findOne({

                    requestId:
                        req.params.requestId,

                    collegeId:
                        req.user.collegeId,

                    status:
                        "Pending"

                });

            if (!request) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Pending book request not found."

                });

            }

            // ----------------------------------------------
            // DECREASE AVAILABLE COPY
            // ----------------------------------------------

            const book =
                await Book.findOneAndUpdate(

                    {
                        bookId:
                            request.bookId,

                        collegeId:
                            req.user.collegeId,

                        availableCopies:
                            { $gt: 0 }
                    },

                    {
                        $inc: {
                            availableCopies: -1
                        }
                    },

                   {
    returnDocument: "after"
}
                );

            if (!book) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No copy of this book is currently available."

                });

            }

            // ----------------------------------------------
            // ISSUE DATE
            // ----------------------------------------------

            const issueDate =
                new Date();

            // ----------------------------------------------
            // DUE DATE = 14 DAYS
            // ----------------------------------------------

            const dueDate =
                new Date(issueDate);

            dueDate.setDate(
                dueDate.getDate() + 14
            );

            // ----------------------------------------------
            // UPDATE REQUEST
            // ----------------------------------------------

            request.status =
                "Approved";

            request.issueDate =
                issueDate;

            request.dueDate =
                dueDate;

            await request.save();
            // ==================================================
// CREATE STUDENT NOTIFICATION
// ==================================================

try {

    await Notification.create({

        notificationId:
            "NOTIF" +
            Date.now().toString() +
            Math.floor(Math.random() * 1000),

        studentId:
            request.studentId,

        collegeId:
            request.collegeId,

        type:
            "BOOK_REQUEST_APPROVED",

        title:
            "Book Request Approved",

        message:
            `Your request for "${request.title}" has been approved. The book has been issued to you.`,

        isRead:
            false

    });

} catch (notificationError) {

    console.error(
        "Approval notification error:",
        notificationError
    );

}

            // ----------------------------------------------
            // UPDATE BOOK STATUS
            // ----------------------------------------------

            if (
                book.availableCopies <= 0
            ) {

                book.status =
                    "Unavailable";

            } else {

                book.status =
                    "Available";

            }

            await book.save();

            return res.json({

                success: true,

                message:
                    "Book request approved successfully.",

                request:
                    request,

                book:
                    book

            });

        } catch (error) {

            console.error(
                "Approve Book Request Error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to approve book request."

            });

        }

    }
);
// ==========================================================
// ADMIN - REJECT BOOK REQUEST
// ==========================================================

app.put(
    "/api/admin/book-requests/:requestId/reject",
    authenticateAdmin,
    async (req, res) => {

        try {

            const request =
                await BookRequest.findOne({

                    requestId:
                        req.params.requestId,

                    collegeId:
                        req.user.collegeId,

                    status:
                        "Pending"

                });

            if (!request) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Pending book request not found."

                });

            }

            request.status =
                "Rejected";

            await request.save();

            // ==================================================
// CREATE STUDENT NOTIFICATION
// ==================================================

try {

    await Notification.create({

        notificationId:
            "NOTIF" +
            Date.now().toString() +
            Math.floor(Math.random() * 1000),

        studentId:
            request.studentId,

        collegeId:
            request.collegeId,

        type:
            "BOOK_REQUEST_REJECTED",

        title:
            "Book Request Rejected",

        message:
            `Your request for "${request.title}" has been rejected by the library administrator.`,

        isRead:
            false

    });

} catch (notificationError) {

    console.error(
        "Rejection notification error:",
        notificationError
    );

}

            return res.json({

                success: true,

                message:
                    "Book request rejected successfully.",

                request:
                    request

            });

        } catch (error) {

            console.error(
                "Reject Book Request Error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to reject book request."

            });

        }

    }
);
// ==========================================================
// STUDENT - RETURN BOOK
// ==========================================================

app.put(
    "/api/student/book-requests/:requestId/return",
    authenticateStudent,
    async (req, res) => {

        try {

            const request =
                await BookRequest.findOne({

                    requestId:
                        req.params.requestId,

                    studentId:
                        req.user.studentId,

                    collegeId:
                        req.user.collegeId,

                    status:
                        "Approved"

                });

            if (!request) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Issued book request not found."

                });

            }

            // ----------------------------------------------
            // RETURN DATE
            // ----------------------------------------------

            const returnDate =
                new Date();

            // ----------------------------------------------
            // CALCULATE LATE DAYS
            // ----------------------------------------------

            let lateDays = 0;

            if (request.dueDate) {

                const difference =
                    returnDate.getTime() -
                    new Date(
                        request.dueDate
                    ).getTime();

                if (difference > 0) {

                    lateDays =
                        Math.ceil(
                            difference /
                            (
                                1000 *
                                60 *
                                60 *
                                24
                            )
                        );

                }

            }

            // ----------------------------------------------
            // FINE
            // ----------------------------------------------
            // Current Book Details UI says ₹10/day.

            const fine =
                lateDays * 10;

            // ----------------------------------------------
            // UPDATE REQUEST
            // ----------------------------------------------

            request.status =
                "Returned";

            request.returnDate =
                returnDate;

            request.lateDays =
                lateDays;

            request.fine =
                fine;

            await request.save();

            // ----------------------------------------------
            // INCREASE AVAILABLE COPY
            // ----------------------------------------------

            const book =
                await Book.findOne({

                    bookId:
                        request.bookId,

                    collegeId:
                        req.user.collegeId

                });

            if (book) {

                book.availableCopies =
                    Math.min(
                        book.totalCopies,
                        book.availableCopies + 1
                    );

                book.status =
                    book.availableCopies > 0
                        ? "Available"
                        : "Unavailable";

                await book.save();

            }

            return res.json({

                success: true,

                message:
                    "Book returned successfully.",

                request:
                    request,

                fine:
                    fine,

                lateDays:
                    lateDays

            });

        } catch (error) {

            console.error(
                "Return Book Error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to return book."

            });

        }

    }
);
// ==========================================================
// ADMIN - RETURN BOOK
// ==========================================================

app.put(
    "/api/admin/book-requests/:requestId/return",
    authenticateAdmin,
    async (req, res) => {
        try {

            const request =
                await BookRequest.findOne({
                    requestId:
                        req.params.requestId,

                    collegeId:
                        req.user.collegeId,

                    status:
                        "Approved"
                });

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Issued book request not found."
                });
            }

            // ----------------------------------------------
            // RETURN DATE
            // ----------------------------------------------

            const returnedDate =
                new Date();

            // ----------------------------------------------
            // CALCULATE LATE DAYS
            // ----------------------------------------------

            let lateDays = 0;

            if (request.dueDate) {

                const difference =
                    returnedDate.getTime() -
                    new Date(
                        request.dueDate
                    ).getTime();

                if (difference > 0) {

                    lateDays =
                        Math.ceil(
                            difference /
                            (
                                1000 *
                                60 *
                                60 *
                                24
                            )
                        );

                }
            }

            // ----------------------------------------------
            // FINE ₹10 / DAY
            // ----------------------------------------------

            const fine =
                lateDays * 10;

            // ----------------------------------------------
            // UPDATE REQUEST
            // ----------------------------------------------

            request.status =
                "Returned";

            request.returnedDate =
                returnedDate;

            request.fine =
                fine;

            await request.save();

            // ----------------------------------------------
            // INCREASE AVAILABLE COPIES
            // ----------------------------------------------

            const book =
                await Book.findOne({
                    bookId:
                        request.bookId,

                    collegeId:
                        req.user.collegeId
                });

            if (book) {

                book.availableCopies =
                    Math.min(
                        book.totalCopies,
                        Number(
                            book.availableCopies
                        ) + 1
                    );

                book.status =
                    book.availableCopies > 0
                        ? "Available"
                        : "Unavailable";

                await book.save();
            }

            return res.json({

                success: true,

                message:
                    "Book returned successfully.",

                request:
                    request,

                fine:
                    fine,

                lateDays:
                    lateDays
            });

        } catch (error) {

            console.error(
                "Admin Return Book Error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to return book."
            });
        }
    }
);
// ==========================================================
// STUDENT - BOOK HISTORY
// ==========================================================

app.get(
    "/api/student/book-history",
    authenticateStudent,
    async (req, res) => {

        try {

            const history =
                await BookRequest.find({

                    studentId:
                        req.user.studentId,

                    collegeId:
                        req.user.collegeId

                })
                .sort({
                    createdAt: -1
                });

            return res.json({

                success: true,

                count:
                    history.length,

                history:
                    history

            });

        } catch (error) {

            console.error(
                "Student Book History Error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to load book history."

            });

        }

    }
);


// ==========================================================
// STUDENT - GET NOTIFICATIONS
// ==========================================================

app.get(
    "/api/student/notifications",
    authenticateStudent,
    async (req, res) => {

        try {

            const notifications =
                await Notification.find({

                    studentId:
                        req.user.studentId,

                    collegeId:
                        req.user.collegeId

                })
                .sort({
                    createdAt: -1
                })
                .limit(50);

            const unreadCount =
                await Notification.countDocuments({

                    studentId:
                        req.user.studentId,

                    collegeId:
                        req.user.collegeId,

                    isRead:
                        false

                });

            return res.json({

                success: true,

                notifications:
                    notifications,

                unreadCount:
                    unreadCount

            });

        } catch (error) {

            console.error(
                "Student Notifications Error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to load notifications."

            });

        }

    }
);


// ==========================================================
// STUDENT - MARK ONE NOTIFICATION AS READ
// ==========================================================

app.put(
    "/api/student/notifications/:notificationId/read",
    authenticateStudent,
    async (req, res) => {

        try {

            const notification =
                await Notification.findOne({

                    notificationId:
                        req.params.notificationId,

                    studentId:
                        req.user.studentId,

                    collegeId:
                        req.user.collegeId

                });

            if (!notification) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Notification not found."

                });

            }

            notification.isRead =
                true;

            await notification.save();

            return res.json({

                success: true,

                message:
                    "Notification marked as read."

            });

        } catch (error) {

            console.error(
                "Mark Notification Read Error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to update notification."

            });

        }

    }
);


// ==========================================================
// STUDENT - MARK ALL NOTIFICATIONS AS READ
// ==========================================================

app.put(
    "/api/student/notifications/read-all",
    authenticateStudent,
    async (req, res) => {

        try {

            await Notification.updateMany(

                {
                    studentId:
                        req.user.studentId,

                    collegeId:
                        req.user.collegeId,

                    isRead:
                        false
                },

                {
                    $set: {
                        isRead: true
                    }
                }

            );

            return res.json({

                success: true,

                message:
                    "All notifications marked as read."

            });

        } catch (error) {

            console.error(
                "Mark All Notifications Read Error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to update notifications."

            });

        }

    }
);

// ==========================================================
// ADMIN - ISSUE BOOK DIRECTLY
// ==========================================================

app.post(
    "/api/admin/issue-book",
    authenticateAdmin,
    async (req, res) => {

        try {

            const {
                studentId,
                bookId
            } = req.body;


            // ----------------------------------------------
            // VALIDATION
            // ----------------------------------------------

            if (!studentId || !bookId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Student and book are required."

                });

            }


            // ----------------------------------------------
            // FIND BOOK
            // ----------------------------------------------

            const book =
                await Book.findOne({

                    bookId:
                        bookId,

                    collegeId:
                        req.user.collegeId

                });


            if (!book) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Book not found."

                });

            }


            // ----------------------------------------------
            // CHECK AVAILABLE COPIES
            // ----------------------------------------------

            if (
                Number(book.availableCopies) <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No copy of this book is currently available."

                });

            }


            // ----------------------------------------------
            // CHECK STUDENT ACTIVE BOOK LIMIT
            // ----------------------------------------------

            const activeBooks =
                await BookRequest.countDocuments({

                    studentId:
                        studentId,

                    collegeId:
                        req.user.collegeId,

                    status:
                        "Approved"

                });


            if (activeBooks >= 5) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This student already has 5 active books."

                });

            }


            // ----------------------------------------------
            // CHECK DUPLICATE ACTIVE ISSUE
            // ----------------------------------------------

            const alreadyIssued =
                await BookRequest.findOne({

                    studentId:
                        studentId,

                    bookId:
                        bookId,

                    collegeId:
                        req.user.collegeId,

                    status:
                        "Approved"

                });


            if (alreadyIssued) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This book is already issued to this student."

                });

            }


            // ----------------------------------------------
            // GENERATE REQUEST ID
            // ----------------------------------------------

            const requestId =
                "REQ" +
                Date.now().toString() +
                Math.floor(
                    Math.random() * 1000
                );


            // ----------------------------------------------
            // ISSUE DATE
            // ----------------------------------------------

            const issueDate =
                new Date();


            // ----------------------------------------------
            // DUE DATE = 14 DAYS
            // ----------------------------------------------

            const dueDate =
                new Date(issueDate);

            dueDate.setDate(
                dueDate.getDate() + 14
            );


            // ----------------------------------------------
            // CREATE ISSUE RECORD
            // ----------------------------------------------

            const issue =
                await BookRequest.create({

                    requestId:
                        requestId,

                    studentId:
                        studentId,

                    studentName:
                        req.body.studentName || "Student",

                    studentUsername:
                        req.body.studentUsername || "",

                    studentEmail:
                        req.body.studentEmail || "",

                    collegeId:
                        req.user.collegeId,

                    bookId:
                        book.bookId,

                    title:
                        book.title,

                    author:
                        book.author || "",

                    category:
                        book.category || "General",

                    status:
                        "Approved",

                    requestedDate:
                        issueDate,

                    approvedDate:
                        issueDate,

                    issuedDate:
                        issueDate,

                    dueDate:
                        dueDate,

                    approvedBy:
                        req.user.username || "Admin"

                });


            // ----------------------------------------------
            // DECREASE AVAILABLE COPY
            // ----------------------------------------------

            book.availableCopies =
                Math.max(
                    0,
                    Number(book.availableCopies) - 1
                );


            book.status =
                book.availableCopies > 0
                    ? "Available"
                    : "Unavailable";


            await book.save();


            // ----------------------------------------------
            // RESPONSE
            // ----------------------------------------------

            return res.json({

                success: true,

                message:
                    "Book issued successfully.",

                issue:
                    issue,

                book:
                    book

            });


        } catch (error) {

            console.error(
                "Admin Issue Book Error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to issue book."

            });

        }

    }
);

// ==========================================================
// ADMIN - GET ALL BOOKS OF COLLEGE
// ==========================================================

app.get(
    "/api/admin/books",
    authenticateAdmin,
    async (req, res) => {

        try {

            const books = await Book.find({
                collegeId: req.user.collegeId
            })
            .sort({
                createdAt: -1
            });

            return res.json({
                success: true,
                count: books.length,
                books: books
            });

        } catch (error) {

            console.error(
                "Admin books error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to load books."
            });
        }
    }
);

// ==========================================================
// ADMIN - ADD NEW BOOK
// ==========================================================

app.post(
    "/api/admin/books",
    authenticateAdmin,
    async (req, res) => {

        try {

            const {
                title,
                author,
                category,
                isbn,
                publisher,
                totalCopies,
                coverData
            } = req.body;

            // ----------------------------------------------
            // VALIDATION
            // ----------------------------------------------

            if (
                !title ||
                !author ||
                !totalCopies
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Title, author and total copies are required."
                });
            }

            const copies =
                Number(totalCopies);

            if (
                !Number.isInteger(copies) ||
                copies < 1
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Total copies must be at least 1."
                });
            }

            // ----------------------------------------------
            // GENERATE BOOK ID
            // ----------------------------------------------

            const bookId =
                "BOOK" +
                Date.now().toString().slice(-8);

            // ----------------------------------------------
            // CREATE BOOK
            // ----------------------------------------------

            const book =
                await Book.create({

                    bookId: bookId,

                    title: title.trim(),

                    author: author.trim(),

                    category:
                        category
                            ? category.trim()
                            : "General",

                    isbn:
                        isbn
                            ? isbn.trim()
                            : null,

                    publisher:
                        publisher
                            ? publisher.trim()
                            : null,

                    // BOOK COVER
                    coverData:
                        coverData || "",

                    totalCopies: copies,

                    availableCopies: copies,

                    collegeId:
                        req.user.collegeId,

                    status: "Available"
                });

            return res.status(201).json({

                success: true,

                message:
                    "Book added successfully.",

                book: book
            });

        } catch (error) {

            console.error(
                "Add book error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to add book."
            });
        }
    }
);
// ==========================================================
// ADMIN - UPDATE BOOK
// ==========================================================

app.put(
    "/api/admin/books/:bookId",
    authenticateAdmin,
    async (req, res) => {

        try {

            const book =
                await Book.findOne({
                    bookId: req.params.bookId,
                    collegeId: req.user.collegeId
                });

            if (!book) {

                return res.status(404).json({
                    success: false,
                    message: "Book not found."
                });
            }

            const {
                title,
                author,
                category,
                isbn,
                publisher,
                totalCopies,
                coverData
            } = req.body;

            // ----------------------------------------------
            // BASIC FIELDS
            // ----------------------------------------------

            if (title !== undefined) {

                book.title =
                    title.trim();

            }

            if (author !== undefined) {

                book.author =
                    author.trim();

            }

            if (category !== undefined) {

                book.category =
                    category.trim() ||
                    "General";

            }

            if (isbn !== undefined) {

                book.isbn =
                    isbn.trim() ||
                    null;

            }

            if (publisher !== undefined) {

                book.publisher =
                    publisher.trim() ||
                    null;

            }

            // ----------------------------------------------
            // BOOK COVER
            // ----------------------------------------------

            if (coverData !== undefined) {

                book.coverData =
                    coverData || "";

            }

            // ----------------------------------------------
            // TOTAL COPIES
            // ----------------------------------------------

            if (totalCopies !== undefined) {

                const newTotal =
                    Number(totalCopies);

                if (
                    !Number.isInteger(newTotal) ||
                    newTotal < 1
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Total copies must be at least 1."
                    });
                }

                const issuedCopies =
                    book.totalCopies -
                    book.availableCopies;

                if (newTotal < issuedCopies) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Total copies cannot be less than currently issued copies."
                    });
                }

                book.totalCopies =
                    newTotal;

                book.availableCopies =
                    newTotal -
                    issuedCopies;
            }

            // ----------------------------------------------
            // UPDATE STATUS
            // ----------------------------------------------

            book.status =
                book.availableCopies > 0
                    ? "Available"
                    : "Unavailable";

            await book.save();

            return res.json({

                success: true,

                message:
                    "Book updated successfully.",

                book: book
            });

        } catch (error) {

            console.error(
                "Update book error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to update book."
            });
        }
    }
);
// ==========================================================
// ADMIN - DELETE BOOK
// ==========================================================

app.delete(
    "/api/admin/books/:bookId",
    authenticateAdmin,
    async (req, res) => {

        try {

            const book =
                await Book.findOneAndDelete({
                    bookId: req.params.bookId,
                    collegeId: req.user.collegeId
                });

            if (!book) {

                return res.status(404).json({
                    success: false,
                    message: "Book not found."
                });
            }

            return res.json({

                success: true,

                message:
                    "Book deleted successfully."
            });

        } catch (error) {

            console.error(
                "Delete book error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to delete book."
            });
        }
    }
);

app.get(
    "/api/admin/college/:collegeId",
    authenticateAdmin,
    async (req, res) => {
        try {
            if (
                req.params.collegeId !==
                req.user.collegeId
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied."
                });
            }

            const college =
                await College.findOne({
                    collegeId:
                        req.params.collegeId
                }).select(
                    "collegeId collegeName officialEmail status"
                );

            if (!college) {
                return res.status(404).json({
                    success: false,
                    message: "College not found."
                });
            }

            return res.json({
                success: true,
                college: college
            });

        } catch (error) {
            console.error(
                "Admin College Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to load college information."
            });
        }
    }
);

console.log("COLLEGE SETTINGS ROUTE LOADED");


/* ==========================================================
   ADMIN - CHANGE PASSWORD
========================================================== */

app.put(
    "/api/auth/admin-change-password",
    authenticateAdmin,
    async (req, res) => {
        try {
            const {
                currentPassword,
                newPassword,
                confirmPassword
            } = req.body;

            // Validate required fields
            if (
                !currentPassword ||
                !newPassword ||
                !confirmPassword
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please fill in all password fields."
                });
            }

            // Check password confirmation
            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: "New password and confirm password do not match."
                });
            }

            // Validate minimum password length
            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: "New password must be at least 8 characters long."
                });
            }

            // Prevent reusing the current password
            if (currentPassword === newPassword) {
                return res.status(400).json({
                    success: false,
                    message: "New password must be different from the current password."
                });
            }

            // Find the logged-in admin
            const admin = await Admin.findOne({
                adminId: req.user.adminId,
                collegeId: req.user.collegeId
            });

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: "Admin account not found."
                });
            }

            // Verify current password
            const passwordMatches = await bcrypt.compare(
                currentPassword,
                admin.password
            );

            if (!passwordMatches) {
                return res.status(400).json({
                    success: false,
                    message: "Current password is incorrect."
                });
            }

            // Hash and save the new password
            admin.password = await bcrypt.hash(newPassword, 12);
            admin.mustChangePassword = false;
            await admin.save();

            return res.json({
                success: true,
                message: "Password changed successfully."
            });

        } catch (error) {
            console.error("Admin Change Password Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to change password."
            });
        }
    }
);
// // ==========================================================
// // ADMIN - MARK FINE AS PAID (CASH)
// // ==========================================================

// app.put(
//     "/api/admin/fines/:requestId/pay",
//     authenticateAdmin,
//     async (req, res) => {
//         try {
//             const request = await BookRequest.findOne({
//                 requestId: req.params.requestId,
//                 collegeId: req.user.collegeId
//             });

//             if (!request) {
//                 return res.status(404).json({
//                     success: false,
//                     message: "Fine record not found."
//                 });
//             }

//             // Prevent duplicate payment
//             if (
//                 request.paymentStatus === "Paid" ||
//                 request.fineStatus === "Paid"
//             ) {
//                 return res.status(409).json({
//                     success: false,
//                     message: "This fine has already been marked as paid."
//                 });
//             }

//             const fineAmount = Number(request.fine) || 0;

//             if (fineAmount <= 0) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "There is no pending fine to pay."
//                 });
//             }

//             const paidAt = new Date();

//             request.paymentStatus = "Paid";
//             request.fineStatus = "Paid";
//             request.paidAmount = fineAmount;
//             request.paymentMethod = "Cash";
//             request.paidAt = paidAt;
//             request.paidDate = paidAt;

//             await request.save();

//             return res.json({
//                 success: true,
//                 message: "Cash payment recorded successfully.",
//                 payment: {
//                     requestId: request.requestId,
//                     fine: fineAmount,
//                     paidAmount: request.paidAmount,
//                     paymentMethod: request.paymentMethod,
//                     paymentStatus: request.paymentStatus,
//                     paidAt: request.paidAt
//                 }
//             });
//         } catch (error) {
//             console.error("Mark Fine Paid Error:", error);

//             return res.status(500).json({
//                 success: false,
//                 message: "Unable to record fine payment."
//             });
//         }
//     }
// );

// // ==================================================
// // ADMIN - MARK FINE AS PAID (CASH)
// // ==================================================

// app.put(
//     "/api/admin/book-requests/:requestId/pay-fine",
//     authenticateAdmin,
//     async (req, res) => {
//         try {
//             const request = await BookRequest.findOne({
//                 requestId: req.params.requestId,
//                 collegeId: req.user.collegeId
//             });

//             if (!request) {
//                 return res.status(404).json({
//                     success: false,
//                     message: "Fine record not found."
//                 });
//             }

//             if (request.status !== "Returned") {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Only returned books can be paid here."
//                 });
//             }

//             if (request.paymentStatus === "Paid") {
//                 return res.status(400).json({
//                     success: false,
//                     message: "This fine has already been paid."
//                 });
//             }

//             const amount = Number(request.fine) || 0;

//             if (amount <= 0) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "There is no pending fine to collect."
//                 });
//             }

//             request.paidAmount = amount;
//             request.paymentStatus = "Paid";
//             request.paymentMethod = "Cash";
//             request.paidAt = new Date();

//             await request.save();

//             return res.json({
//                 success: true,
//                 message: "Cash payment recorded successfully.",
//                 request: request
//             });

//         } catch (error) {
//             console.error("Fine Payment Error:", error);

//             return res.status(500).json({
//                 success: false,
//                 message: "Unable to record fine payment."
//             });
//         }
//     }
// );


// ==========================================================
// COLLEGE ADMIN REGISTRATION - SEND OTP
// ==========================================================

app.post(
    "/api/admin-requests/send-otp",
    async (req, res) => {
        try {
            const {
                collegeName,
                applicantName,
                designation,
                officialEmail,
                phone
            } = req.body;

            if (
                !collegeName ||
                !applicantName ||
                !designation ||
                !officialEmail ||
                !phone
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please fill in all required fields."
                });
            }

            if (!transporter) {
                return res.status(500).json({
                    success: false,
                    message: "Email service is not configured."
                });
            }

            const email = officialEmail.trim().toLowerCase();

            // Generate OTP and request ID
            const otp = crypto.randomInt(100000, 1000000).toString();

            const requestId =
                "AR" + Date.now() + crypto.randomBytes(3).toString("hex");

            const otpExpiresAt =
                new Date(Date.now() + 5 * 60 * 1000);

            // Check existing pending request for this email
            let adminRequest = await AdminRequest.findOne({
                officialEmail: email,
                status: "Pending"
            });

            if (adminRequest && adminRequest.emailVerified) {
                return res.status(409).json({
                    success: false,
                    message: "A verified registration request already exists for this email."
                });
            }

            if (adminRequest) {
                adminRequest.requestId = requestId;
                adminRequest.collegeName = collegeName.trim();
                adminRequest.applicantName = applicantName.trim();
                adminRequest.designation = designation.trim();
                adminRequest.phone = phone.trim();
                adminRequest.otp = otp;
                adminRequest.otpExpiresAt = otpExpiresAt;
                adminRequest.emailVerified = false;

                await adminRequest.save();
            } else {
                adminRequest = await AdminRequest.create({
                    requestId,
                    collegeName: collegeName.trim(),
                    applicantName: applicantName.trim(),
                    designation: designation.trim(),
                    officialEmail: email,
                    phone: phone.trim(),
                    otp,
                    otpExpiresAt,
                    emailVerified: false
                });
            }

            await transporter.sendMail({
               from: process.env.EMAIL_FROM,
                to: email,
                subject: "Library Management System - Email Verification OTP",
                html: `
                    <div style="font-family:Arial,sans-serif;padding:20px;">
                        <h2>Email Verification</h2>
                        <p>Your OTP for College Admin Registration is:</p>
                        <h1 style="letter-spacing:6px;">${otp}</h1>
                        <p>This OTP is valid for 5 minutes.</p>
                        <p>Please do not share this OTP with anyone.</p>
                    </div>
                `
            });

            return res.json({
                success: true,
                message: "OTP sent successfully to your email.",
                requestId
            });

        } catch (error) {
            console.error("Admin Request Send OTP Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to send OTP."
            });
        }
    }
);


// ==========================================================
// COLLEGE ADMIN REGISTRATION - VERIFY OTP
// ==========================================================

app.post(
    "/api/admin-requests/verify-otp",
    async (req, res) => {
        try {
            const { requestId, otp } = req.body;

            if (!requestId || !otp) {
                return res.status(400).json({
                    success: false,
                    message: "Request ID and OTP are required."
                });
            }

            const adminRequest = await AdminRequest.findOne({
                requestId
            });

            if (!adminRequest) {
                return res.status(404).json({
                    success: false,
                    message: "Registration request not found."
                });
            }

            if (!adminRequest.otp || !adminRequest.otpExpiresAt) {
                return res.status(400).json({
                    success: false,
                    message: "Please request a new OTP."
                });
            }

            if (adminRequest.otpExpiresAt < new Date()) {
                adminRequest.otp = null;
                adminRequest.otpExpiresAt = null;
                await adminRequest.save();

                return res.status(400).json({
                    success: false,
                    message: "OTP has expired. Please request a new OTP."
                });
            }

            if (adminRequest.otp !== String(otp).trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid OTP."
                });
            }

            adminRequest.emailVerified = true;
            adminRequest.otp = null;
            adminRequest.otpExpiresAt = null;

            await adminRequest.save();

            return res.json({
                success: true,
                message: "Email verified successfully."
            });

        } catch (error) {
            console.error("Admin Request Verify OTP Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to verify OTP."
            });
        }
    }
);


// ==========================================================
// COLLEGE ADMIN REGISTRATION - SUBMIT REQUEST
// ==========================================================

app.post(
    "/api/admin-requests/register",
    upload.fields([
        { name: "photo", maxCount: 1 },
        { name: "staffIdCard", maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const {
                requestId,
                collegeName,
                applicantName,
                designation,
                officialEmail,
                phone
            } = req.body;

            const adminRequest = await AdminRequest.findOne({
                requestId
            });

            if (!adminRequest) {
                return res.status(404).json({
                    success: false,
                    message: "Registration request not found."
                });
            }

            if (!adminRequest.emailVerified) {
                return res.status(403).json({
                    success: false,
                    message: "Please verify your email before registration."
                });
            }

            if (adminRequest.status !== "Pending") {
                return res.status(400).json({
                    success: false,
                    message: "This registration request has already been processed."
                });
            }

            if (
                adminRequest.officialEmail !==
                String(officialEmail || "").trim().toLowerCase()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Registration email does not match verified email."
                });
            }

            if (
                !collegeName ||
                !applicantName ||
                !designation ||
                !phone
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide all registration details."
                });
            }

            if (!req.files?.photo?.[0] || !req.files?.staffIdCard?.[0]) {
                return res.status(400).json({
                    success: false,
                    message: "Photo and Staff ID Card are required."
                });
            }

            adminRequest.collegeName = collegeName.trim();
            adminRequest.applicantName = applicantName.trim();
            adminRequest.designation = designation.trim();
            adminRequest.phone = phone.trim();

            adminRequest.photo =
                req.files.photo[0].path.replace(/\\/g, "/");

            adminRequest.staffIdCard =
                req.files.staffIdCard[0].path.replace(/\\/g, "/");

            await adminRequest.save();

            return res.status(201).json({
                success: true,
                message: "College Admin registration submitted successfully. Please wait for Super Admin approval.",
                requestId: adminRequest.requestId
            });

        } catch (error) {
            console.error("Admin Registration Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to submit registration request."
            });
        }
    }
);



// ==========================================================
// SUPER ADMIN - SEND LOGIN OTP
// ==========================================================

app.post(
    "/api/auth/super-admin/send-login-otp",
    async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: "Email is required."
                });
            }

            if (!transporter) {
                return res.status(500).json({
                    success: false,
                    message: "Email service is not configured."
                });
            }

            const superAdmin = await SuperAdmin.findOne({
                email: email.trim().toLowerCase()
            });

            if (!superAdmin || superAdmin.status !== "Active") {
                return res.status(404).json({
                    success: false,
                    message: "Unable to send OTP."
                });
            }

            if (
                superAdmin.otpLastSentAt &&
                Date.now() - superAdmin.otpLastSentAt.getTime() < 60000
            ) {
                return res.status(429).json({
                    success: false,
                    message: "Please wait before requesting another OTP."
                });
            }

            const otp = crypto.randomInt(100000, 1000000).toString();

            superAdmin.otpHash = crypto
                .createHash("sha256")
                .update(otp)
                .digest("hex");

            superAdmin.otpExpiresAt =
                new Date(Date.now() + 10 * 60 * 1000);

            superAdmin.otpPurpose = "LOGIN";
            superAdmin.otpAttempts = 0;
            superAdmin.otpLastSentAt = new Date();

            await superAdmin.save();

            await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: superAdmin.email,
                subject: "Super Admin Login OTP",
                text: `Your Super Admin login OTP is ${otp}. It is valid for 10 minutes.`
            });

            return res.json({
                success: true,
                message: "OTP sent successfully."
            });

        } catch (error) {
            console.error("Super Admin Login OTP Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to send OTP."
            });
        }
    }
);


// ==========================================================
// SUPER ADMIN - VERIFY LOGIN OTP
// ==========================================================

app.post(
    "/api/auth/super-admin/login-with-otp",
    async (req, res) => {
        try {
            const { email, otp } = req.body;

            if (!email || !otp) {
                return res.status(400).json({
                    success: false,
                    message: "Email and OTP are required."
                });
            }

            const superAdmin = await SuperAdmin.findOne({
                email: email.trim().toLowerCase()
            });

            if (!superAdmin || superAdmin.status !== "Active") {
                return res.status(401).json({
                    success: false,
                    message: "Invalid OTP or account."
                });
            }

            if (
                !superAdmin.otpHash ||
                !superAdmin.otpExpiresAt ||
                superAdmin.otpPurpose !== "LOGIN" ||
                superAdmin.otpExpiresAt < new Date()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "OTP is invalid or expired. Please request a new OTP."
                });
            }

            if ((superAdmin.otpAttempts || 0) >= 5) {
                return res.status(429).json({
                    success: false,
                    message: "Too many attempts. Please request a new OTP."
                });
            }

            const enteredOtpHash = crypto
                .createHash("sha256")
                .update(String(otp).trim())
                .digest("hex");

            if (enteredOtpHash !== superAdmin.otpHash) {
                superAdmin.otpAttempts =
                    (superAdmin.otpAttempts || 0) + 1;

                await superAdmin.save();

                return res.status(400).json({
                    success: false,
                    message: "Incorrect OTP."
                });
            }

            superAdmin.otpHash = null;
            superAdmin.otpExpiresAt = null;
            superAdmin.otpPurpose = null;
            superAdmin.otpAttempts = 0;
            superAdmin.otpLastSentAt = null;

            await superAdmin.save();

            const token = jwt.sign(
                {
                    id: superAdmin._id,
                    role: "SuperAdmin"
                },
                process.env.JWT_SECRET,
                { expiresIn: "2h" }
            );

            return res.json({
                success: true,
                message: "Login successful.",
                token,
                superAdmin: {
                    id: superAdmin._id,
                    username: superAdmin.username,
                    name: superAdmin.name,
                    email: superAdmin.email,
                    role: "SuperAdmin"
                }
            });

        } catch (error) {
            console.error("Super Admin OTP Verification Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to verify OTP."
            });
        }
    }
);


// ======================================================
// SUPER ADMIN - GET ALL ADMIN REGISTRATION REQUESTS
// ======================================================

app.get(
    "/api/super-admin/admin-requests",
    authenticateSuperAdmin,
    async function (req, res) {
        try {
            const requests = await AdminRequest.find()
                .sort({ createdAt: -1 });

            return res.json({
                success: true,
                requests: requests
            });

        } catch (error) {
            console.error("Load Admin Requests Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to load admin requests."
            });
        }
    }
);

// ======================================================
// SUPER ADMIN - DASHBOARD STATS
// ======================================================

app.get(
    "/api/super-admin/dashboard-stats",
    authenticateSuperAdmin,
    async function (req, res) {
        try {

            // Currently active colleges
            const totalColleges =
                await College.countDocuments({
                    status: {
                        $in: ["Active", "Approved"]
                    }
                });

            // Pending admin registration requests
            const pendingColleges =
                await AdminRequest.countDocuments({
                    status: "Pending"
                });

            // All colleges approved at least once
            const approvedColleges =
                await College.countDocuments({
                    status: {
                        $in: [
                            "Active",
                            "Approved",
                            "Blocked",
                            "Removed"
                        ]
                    }
                });

            // Active college admins
            const totalAdmins =
                await Admin.countDocuments({
                    role: "Admin",
                    status: "Active"
                });

            return res.json({
                success: true,
                stats: {
                    totalColleges: totalColleges,
                    pendingColleges: pendingColleges,
                    approvedColleges: approvedColleges,
                    totalAdmins: totalAdmins,
                    pendingRequests: pendingColleges
                }
            });

        } catch (error) {
            console.error(
                "Super Admin Dashboard Stats Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Unable to load dashboard statistics."
            });
        }
    }
);


app.get(
    "/api/super-admin/admin-requests/:requestId/file/:fileType",
    authenticateSuperAdmin,
    async function (req, res) {
        try {
            const request = await AdminRequest.findOne({
                requestId: req.params.requestId
            });

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: "Admin request not found."
                });
            }

            let filename = null;

            if (req.params.fileType === "photo") {
                filename = request.photo;
            } else if (req.params.fileType === "staffIdCard") {
                filename = request.staffIdCard;
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Invalid file type."
                });
            }

            if (!filename) {
                return res.status(404).json({
                    success: false,
                    message: "Document filename not found in database."
                });
            }

            const safeFilename = path.basename(filename);

            const filePath = path.join(
                adminRequestUploadDir,
                safeFilename
            );

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    success: false,
                    message: "Document file not found in upload folder."
                });
            }

            return res.sendFile(filePath);

        } catch (error) {
            console.error("Admin Request File Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to load document."
            });
        }
    }
);



// ======================================================
// SUPER ADMIN - LOAD COLLEGES
// ======================================================

app.get(
    "/api/super-admin/colleges",
    authenticateSuperAdmin,
    async function (req, res) {
        try {

            const [collegeRecords, pendingRecords] =
                await Promise.all([

                    College.find()
                        .populate({
                            path: "adminId",
                            select: "name email"
                        })
                        .sort({ createdAt: -1 }),

                    AdminRequest.find({
                        status: "Pending"
                    }).sort({ createdAt: -1 })

                ]);


            const colleges = collegeRecords.map(college => ({
                collegeId: college.collegeId,
                collegeName: college.collegeName,
                officialEmail: college.officialEmail,
                adminName: college.adminId
                    ? college.adminId.name
                    : "Pending",
                status: college.status
            }));


            const pendingColleges = pendingRecords.map(request => ({
                collegeId: request.collegeId || "Not assigned",
                collegeName: request.collegeName,
                officialEmail: request.officialEmail,
                adminName: request.applicantName,
                status: "Pending"
            }));


            return res.json({
                success: true,
                colleges: colleges,
                pendingColleges: pendingColleges
            });

        } catch (error) {

            console.error(
                "Load Colleges Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Unable to load colleges."
            });
        }
    }
);



// ======================================================
// SUPER ADMIN - LOAD COLLEGE ADMINS
// ======================================================

app.get(
    "/api/super-admin/admins",
    authenticateSuperAdmin,
    async function (req, res) {
        try {

            const adminRecords = await Admin.find({
                role: "Admin"
            }).sort({ createdAt: -1 });


            const collegeIds = adminRecords.map(
                admin => admin.collegeId
            );


            const colleges = await College.find({
                collegeId: { $in: collegeIds }
            }).select("collegeId collegeName");


            const collegeNameMap = new Map(
                colleges.map(college => [
                    college.collegeId,
                    college.collegeName
                ])
            );


            const admins = adminRecords.map(admin => ({
                adminId: admin.adminId,
                name: admin.name,
                username: admin.username,
                email: admin.email,
                collegeId: admin.collegeId,
                collegeName:
                    collegeNameMap.get(admin.collegeId) || "",
                status: admin.status
            }));


            return res.json({
                success: true,
                admins: admins
            });

        } catch (error) {

            console.error(
                "Load Admins Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Unable to load administrators."
            });
        }
    }
);




// ======================================================
// SUPER ADMIN - APPROVE ADMIN REGISTRATION REQUEST
// ======================================================

app.put(
    "/api/super-admin/admin-requests/:requestId/approve",
    authenticateSuperAdmin,
    async function (req, res) {
        let createdCollege = null;
        let createdAdmin = null;

        try {
            const adminRequest = await AdminRequest.findOne({
                requestId: req.params.requestId
            });

            if (!adminRequest) {
                return res.status(404).json({
                    success: false,
                    message: "Admin request not found."
                });
            }

            if (adminRequest.status !== "Pending") {
                return res.status(400).json({
                    success: false,
                    message: "This request has already been processed."
                });
            }

            if (!adminRequest.emailVerified) {
                return res.status(400).json({
                    success: false,
                    message: "Applicant email is not verified."
                });
            }

            if (!transporter) {
                return res.status(500).json({
                    success: false,
                    message: "Email service is not configured."
                });
            }

            const email = adminRequest.officialEmail
                .trim()
                .toLowerCase();

            const existingAdmin = await Admin.findOne({
                email: email
            });

            if (existingAdmin) {
                return res.status(409).json({
                    success: false,
                    message: "An admin account already exists with this email."
                });
            }

            // Generate unique IDs
            const collegeId =
                "COL" + Date.now() +
                crypto.randomBytes(2).toString("hex").toUpperCase();

            const adminId =
                "ADM" + Date.now() +
                crypto.randomBytes(2).toString("hex").toUpperCase();

            // Generate unique username
            const baseUsername =
                adminRequest.applicantName
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, "")
                    .slice(0, 20) || "admin";

            let username =
                baseUsername + crypto.randomInt(1000, 10000);

            while (await Admin.exists({ username: username })) {
                username =
                    baseUsername + crypto.randomInt(1000, 10000);
            }

            // Generate secure one-time setup token
            // const setupToken =
            //     crypto.randomBytes(32).toString("hex");

            // const setupTokenHash = crypto
            //     .createHash("sha256")
            //     .update(setupToken)
            //     .digest("hex");

            // const setupTokenExpiresAt =
            //     new Date(Date.now() + 24 * 60 * 60 * 1000);
            // Generate temporary password
const tempPassword =
    crypto.randomBytes(6).toString("hex");

const hashedTempPassword =
    await bcrypt.hash(tempPassword, 12);

            // Create approved college
            createdCollege = await College.create({
                collegeId: collegeId,
                collegeName: adminRequest.collegeName,
                officialEmail: email,
                adminId: null,
                status: "Approved"
            });

            // Create admin account
            // createdAdmin = await Admin.create({
            //     adminId: adminId,
            //     name: adminRequest.applicantName,
            //     username: username,
            //     email: email,
            //     password: null,
            //     phone: adminRequest.phone,
            //     collegeId: collegeId,
            //     role: "Admin",
            //     status: "Pending",
            //     mustChangePassword: true,
            //     setupTokenHash: setupTokenHash,
            //     setupTokenExpiresAt: setupTokenExpiresAt
            // });
createdAdmin = await Admin.create({
    adminId: adminId,
    name: adminRequest.applicantName,
    username: username,
    email: email,
    password: hashedTempPassword,
    phone: adminRequest.phone,
    collegeId: collegeId,
    role: "Admin",
    status: "Active",
    mustChangePassword: true
});

            // Link admin to college
            createdCollege.adminId = createdAdmin._id;
            await createdCollege.save();

            // // Frontend password setup page
            // const setupLink =
            //     "http://127.0.0.1:5500/sonu-kushwaha/library%20management%20system/admin-set-password.html?token=" +
            //     encodeURIComponent(setupToken);

            // Send password setup email
            await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: email,
                subject: "Library Management System - Admin Account Approved",
                html: `
                    <div style="font-family:Arial,sans-serif;line-height:1.7;max-width:600px;margin:auto;">
                        <h2>College Admin Account Approved</h2>

                        <p>Hello <strong>${adminRequest.applicantName}</strong>,</p>

                        <p>Your College Admin registration request has been approved.</p>

                        <p><strong>College:</strong> ${adminRequest.collegeName}</p>
                        <p><strong>College ID:</strong> ${collegeId}</p>
                        <p><strong>Admin ID:</strong> ${adminId}</p>
                        <p><strong>Username:</strong> ${username}</p>

                       <p><strong>Temporary Password:</strong> ${tempPassword}</p>

<p>
    Please log in using the username and temporary password.
    You will be required to create a new password on your first login.
</p>
                        <p>Regards,<br>Library Management System</p>
                    </div>
                `
            });

            // Mark request approved only after email succeeds
            adminRequest.status = "Approved";
            adminRequest.collegeId = collegeId;
            await adminRequest.save();

            return res.json({
                success: true,
               message: "Admin request approved. Temporary login credentials sent to applicant's email.",
                college: {
                    collegeId: collegeId,
                    collegeName: createdCollege.collegeName
                },
                admin: {
                    adminId: adminId,
                    username: username,
                    email: email
                }
            });

        } catch (error) {
            console.error("Approve Admin Request Error:", error);

            // Roll back newly created records if approval fails
            if (createdAdmin) {
                await Admin.deleteOne({ _id: createdAdmin._id }).catch(console.error);
            }

            if (createdCollege) {
                await College.deleteOne({ _id: createdCollege._id }).catch(console.error);
            }

            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "Duplicate college ID, admin ID or username. Please try again."
                });
            }

            return res.status(500).json({
                success: false,
                message: "Unable to approve admin request or send setup email."
            });
        }
    }
);


// // ======================================================
// // ADMIN - SET PASSWORD USING EMAIL LINK
// // ======================================================

// app.post(
//     "/api/auth/admin-set-password",
//     async function (req, res) {
//         try {
//             const { token, password } = req.body;

//             if (!token || !password) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Token and password are required."
//                 });
//             }

//             if (String(password).length < 8) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Password must contain at least 8 characters."
//                 });
//             }

//             const tokenHash = crypto
//                 .createHash("sha256")
//                 .update(String(token))
//                 .digest("hex");

//             const admin = await Admin.findOne({
//                 setupTokenHash: tokenHash,
//                 setupTokenExpiresAt: { $gt: new Date() },
//                 status: "Pending"
//             });

//             if (!admin) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Setup link is invalid, expired or already used."
//                 });
//             }

//             admin.password = await bcrypt.hash(password, 12);
//             admin.status = "Active";
//             admin.mustChangePassword = false;
//             admin.setupTokenHash = null;
//             admin.setupTokenExpiresAt = null;

//             await admin.save();

//             return res.json({
//                 success: true,
//                 message: "Password created successfully. Your Admin account is now active."
//             });

//         } catch (error) {
//             console.error("Admin Set Password Error:", error);

//             return res.status(500).json({
//                 success: false,
//                 message: "Unable to set admin password."
//             });
//         }
//     }
// );


// ======================================================
// SUPER ADMIN - REJECT ADMIN REQUEST
// ======================================================

app.put(
    "/api/super-admin/admin-requests/:requestId/reject",
    authenticateSuperAdmin,
    async function (req, res) {
        try {
            const adminRequest = await AdminRequest.findOne({
                requestId: req.params.requestId
            });

            if (!adminRequest) {
                return res.status(404).json({
                    success: false,
                    message: "Admin request not found."
                });
            }

            if (adminRequest.status !== "Pending") {
                return res.status(400).json({
                    success: false,
                    message: "This request has already been processed."
                });
            }

            adminRequest.status = "Rejected";
            await adminRequest.save();

            return res.json({
                success: true,
                message: "Admin request rejected successfully."
            });

        } catch (error) {
            console.error("Reject Admin Request Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to reject admin request."
            });
        }
    }
);


// ==========================================================
// START SERVER
// ==========================================================
app.listen(PORT, "0.0.0.0", function () {
    console.log("==============================================");
    console.log("Library Management System Backend");
    console.log(`Server running on http://127.0.0.1:${PORT}`);
    console.log(`Frontend: ${FRONTEND_URL}`);
    console.log("==============================================");
});