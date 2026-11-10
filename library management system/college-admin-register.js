const API_URL = API_BASE_URL;

let emailVerified = false;
let currentRequestId = null;


// ==========================================
// ELEMENTS
// ==========================================

const form =
    document.getElementById("adminRegistrationForm");

const sendOtpBtn =
    document.getElementById("sendOtpBtn");

const verifyOtpBtn =
    document.getElementById("verifyOtpBtn");

const otpArea =
    document.getElementById("otpArea");

const otpMessage =
    document.getElementById("otpMessage");

const statusMessage =
    document.getElementById("statusMessage");

const submitBtn =
    document.getElementById("submitBtn");


// ==========================================
// STATUS MESSAGE
// ==========================================

function showStatus(message, type) {

    statusMessage.textContent = message;

    statusMessage.className =
        "status-message " + type;
}


// ==========================================
// SAFE JSON RESPONSE
// ==========================================

async function getResponseData(response) {

    const text = await response.text();

    try {

        return JSON.parse(text);

    } catch (error) {

        console.error(
            "Server returned non-JSON response:",
            text
        );

        throw new Error(
            "Backend server returned an invalid response. Please check that Node.js server is running on port 5000."
        );

    }
}


// ==========================================
// SEND OTP
// ==========================================

sendOtpBtn.addEventListener(
    "click",
    async function () {

        const collegeName =
            document.getElementById(
                "collegeName"
            ).value.trim();

        const applicantName =
            document.getElementById(
                "applicantName"
            ).value.trim();

        const designation =
            document.getElementById(
                "designation"
            ).value.trim();

        const officialEmail =
            document.getElementById(
                "officialEmail"
            ).value.trim();

        const phone =
            document.getElementById(
                "phone"
            ).value.trim();


        // ==========================================
        // VALIDATION
        // ==========================================

        if (!collegeName) {

            showStatus(
                "Please enter college name first.",
                "error"
            );

            return;
        }


        if (!applicantName) {

            showStatus(
                "Please enter applicant name first.",
                "error"
            );

            return;
        }


        if (!designation) {

            showStatus(
                "Please enter designation first.",
                "error"
            );

            return;
        }


        if (!phone) {

            showStatus(
                "Please enter phone number first.",
                "error"
            );

            return;
        }


        if (!/^[0-9]{10}$/.test(phone)) {

            showStatus(
                "Please enter a valid 10-digit phone number.",
                "error"
            );

            return;
        }


        if (!officialEmail) {

            showStatus(
                "Please enter official college email.",
                "error"
            );

            return;
        }


        emailVerified = false;


        sendOtpBtn.disabled = true;

        sendOtpBtn.textContent =
            "Sending...";


        try {

            const response =
                await fetch(
                    `${API_URL}/api/admin-requests/send-otp`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            collegeName,

                            applicantName,

                            designation,

                            officialEmail,

                            phone

                        })
                    }
                );


            const data =
                await getResponseData(response);


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to send OTP."
                );

            }


            currentRequestId =
                data.requestId;


            document.getElementById(
                "requestId"
            ).value =
                currentRequestId;


            otpArea.style.display =
                "block";


            otpMessage.textContent =
                "OTP sent to your official email.";

            otpMessage.style.color =
                "#166534";


            showStatus(
                "OTP sent successfully. Please check your email.",
                "success"
            );


        } catch (error) {

            console.error(
                "Send OTP error:",
                error
            );


            showStatus(
                error.message,
                "error"
            );

        } finally {

            sendOtpBtn.disabled =
                false;

            sendOtpBtn.textContent =
                "Send OTP";

        }

    }
);


// ==========================================
// VERIFY OTP
// ==========================================

verifyOtpBtn.addEventListener(
    "click",
    async function () {

        const otp =
            document.getElementById(
                "otp"
            ).value.trim();


        if (!currentRequestId) {

            showStatus(
                "Please request an OTP first.",
                "error"
            );

            return;
        }


        if (
            !otp ||
            otp.length !== 6
        ) {

            showStatus(
                "Please enter the 6-digit OTP.",
                "error"
            );

            return;
        }


        verifyOtpBtn.disabled =
            true;

        verifyOtpBtn.textContent =
            "Verifying...";


        try {

            const response =
                await fetch(
                    `${API_URL}/api/admin-requests/verify-otp`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            requestId:
                                currentRequestId,

                            otp

                        })
                    }
                );


            const data =
                await getResponseData(response);


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "OTP verification failed."
                );

            }


            emailVerified =
                true;


            otpMessage.textContent =
                "✓ Official email verified successfully.";

            otpMessage.style.color =
                "#166534";


            verifyOtpBtn.textContent =
                "Verified";

            verifyOtpBtn.disabled =
                true;


            showStatus(
                "Official email verification successful.",
                "success"
            );


        } catch (error) {

            emailVerified =
                false;


            console.error(
                "OTP verification error:",
                error
            );


            showStatus(
                error.message,
                "error"
            );

        } finally {

            if (!emailVerified) {

                verifyOtpBtn.disabled =
                    false;

                verifyOtpBtn.textContent =
                    "Verify OTP";

            }

        }

    }
);


// ==========================================
// SUBMIT REGISTRATION
// ==========================================

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!currentRequestId) {

            showStatus(
                "Please request and verify your official email first.",
                "error"
            );

            return;
        }


        if (!emailVerified) {

            showStatus(
                "Please verify your official email using OTP.",
                "error"
            );

            return;
        }


        const collegeName =
            document.getElementById(
                "collegeName"
            ).value.trim();

        const applicantName =
            document.getElementById(
                "applicantName"
            ).value.trim();

        const designation =
            document.getElementById(
                "designation"
            ).value.trim();

        const officialEmail =
            document.getElementById(
                "officialEmail"
            ).value.trim();

        const phone =
            document.getElementById(
                "phone"
            ).value.trim();


        const photo =
            document.getElementById(
                "photo"
            ).files[0];

        const staffIdCard =
            document.getElementById(
                "staffIdCard"
            ).files[0];


        if (
            !collegeName ||
            !applicantName ||
            !designation ||
            !officialEmail ||
            !phone
        ) {

            showStatus(
                "Please fill all required fields.",
                "error"
            );

            return;
        }


        if (!/^[0-9]{10}$/.test(phone)) {

            showStatus(
                "Please enter a valid 10-digit phone number.",
                "error"
            );

            return;
        }


        if (!photo || !staffIdCard) {

            showStatus(
                "Please upload applicant photo and staff ID card.",
                "error"
            );

            return;
        }


        const maxSize =
            5 * 1024 * 1024;


        if (
            photo.size > maxSize ||
            staffIdCard.size > maxSize
        ) {

            showStatus(
                "Each uploaded file must be 5 MB or smaller.",
                "error"
            );

            return;
        }


        const formData =
            new FormData();


        formData.append(
            "requestId",
            currentRequestId
        );

        formData.append(
            "collegeName",
            collegeName
        );

        formData.append(
            "applicantName",
            applicantName
        );

        formData.append(
            "designation",
            designation
        );

        formData.append(
            "officialEmail",
            officialEmail
        );

        formData.append(
            "phone",
            phone
        );

        formData.append(
            "photo",
            photo
        );

        formData.append(
            "staffIdCard",
            staffIdCard
        );


        submitBtn.disabled =
            true;

        submitBtn.textContent =
            "Submitting...";


        try {

            const response =
                await fetch(
                    `${API_URL}/api/admin-requests/register`,
                    {
                        method: "POST",

                        body: formData
                    }
                );


            const data =
                await getResponseData(response);


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Registration failed."
                );

            }


            showStatus(
                "Registration submitted successfully. Your request is now pending Super Admin approval.",
                "success"
            );


            submitBtn.textContent =
                "Request Submitted";


            form.reset();


            emailVerified =
                false;

            currentRequestId =
                null;


            otpArea.style.display =
                "none";


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            showStatus(
                error.message,
                "error"
            );


            submitBtn.disabled =
                false;

            submitBtn.textContent =
                "Submit Registration Request";

        }

    }
);