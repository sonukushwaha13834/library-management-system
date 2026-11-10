const API_URL = API_BASE_URL;

document.addEventListener("DOMContentLoaded", function () {

    // =========================
    // COMMON ELEMENTS
    // =========================

    const loginForm =
        document.getElementById("superAdminLoginForm");

    // HTML mein loginMessage nahi tha,
    // isliye JS se message box create kar rahe hain.
    const message = document.createElement("div");

    message.id = "loginMessage";
    message.className = "message hidden";

    const passwordLoginSection =
        document.getElementById("passwordLoginSection");

    passwordLoginSection.prepend(message);


    function showMessage(text, type = "error") {

        if (!text) {
            message.textContent = "";
            message.className = "message hidden";
            return;
        }

        message.textContent = text;
        message.className = "message " + type;
    }


    // =========================
    // PASSWORD LOGIN
    // =========================

    loginForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const login =
            document.getElementById("login").value.trim();

        const password =
            document.getElementById("password").value;


        if (!login || !password) {

            showMessage(
                "Please enter username/email and password.",
                "error"
            );

            return;
        }


        // HTML mein loginButton ID nahi hai.
        // Form ke andar submit button select kar rahe hain.

        const loginButton =
            loginForm.querySelector('button[type="submit"]');


        loginButton.disabled = true;
        loginButton.textContent = "Signing in...";


        try {

            const response = await fetch(
                `${API_URL}/api/auth/super-admin-login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                   body: JSON.stringify({
    login: login,
    username: login,
    password: password
})
                }
            );


            const data = await response.json();


            if (!response.ok || !data.success) {

                throw new Error(
                    data.message || "Login failed."
                );
            }


            // =========================
            // SAVE LOGIN INFORMATION
            // =========================

            localStorage.setItem(
                "superAdminToken",
                data.token
            );


            localStorage.setItem(
                "superAdmin",
                JSON.stringify(data.superAdmin)
            );


            localStorage.setItem(
                "loggedInUser",
                JSON.stringify({
                    username: data.superAdmin.username,
                    name: data.superAdmin.name,
                    email: data.superAdmin.email,
                    role: "SuperAdmin"
                })
            );


            showMessage(
                "Login successful. Redirecting...",
                "success"
            );


            loginButton.textContent =
                "Login Successful";


            setTimeout(function () {

                window.location.href =
                    "super-admin-dashboard.html";

            }, 700);


        } catch (error) {

            console.error(
                "Super Admin Login Error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to connect to server.",
                "error"
            );


            loginButton.disabled = false;

            loginButton.textContent =
                "Login as Super Admin";
        }

    });


    // =========================
    // SHOW / HIDE PASSWORD
    // =========================

    const togglePassword =
        document.getElementById("togglePassword");

    const passwordInput =
        document.getElementById("password");


    if (togglePassword) {

        togglePassword.addEventListener(
            "click",
            function () {

                if (passwordInput.type === "password") {

                    passwordInput.type = "text";

                    togglePassword.textContent = "🙈";

                } else {

                    passwordInput.type = "password";

                    togglePassword.textContent = "👁";
                }

            }
        );

    }


    // =========================
    // SECTIONS
    // =========================

    const otpLoginSection =
        document.getElementById("otpLoginSection");

    const forgotPasswordSection =
        document.getElementById("forgotPasswordSection");


    // =========================
    // LOGIN WITH EMAIL OTP
    // =========================

    document
        .getElementById("otpLoginButton")
        .addEventListener(
            "click",
            function () {

                passwordLoginSection
                    .classList
                    .add("hidden");

                forgotPasswordSection
                    .classList
                    .add("hidden");

                otpLoginSection
                    .classList
                    .remove("hidden");

                showMessage("", "");

            }
        );


    // =========================
    // SEND LOGIN OTP
    // =========================

    document
        .getElementById("sendLoginOtpButton")
        .addEventListener(
            "click",
            async function () {

                const email =
                    document.getElementById(
                        "otpLoginEmail"
                    ).value.trim();


                if (!email) {

                    showMessage(
                        "Please enter your registered email.",
                        "error"
                    );

                    return;
                }


                const button =
                    document.getElementById(
                        "sendLoginOtpButton"
                    );


                button.disabled = true;

                button.textContent =
                    "Sending OTP...";


                try {

                    const response =
                        await fetch(
                            `${API_URL}/api/auth/super-admin/send-login-otp`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    email: email
                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Unable to send OTP."
                        );
                    }


                    showMessage(
                        data.message ||
                        "OTP sent successfully to your email.",
                        "success"
                    );


                    document
                        .getElementById(
                            "loginOtpVerifySection"
                        )
                        .classList
                        .remove("hidden");


                } catch (error) {

                    console.error(
                        "Login OTP Error:",
                        error
                    );


                    showMessage(
                        error.message ||
                        "Unable to send OTP.",
                        "error"
                    );


                } finally {

                    button.disabled = false;

                    button.textContent =
                        "Send Login OTP";
                }

            }
        );


    // =========================
    // VERIFY LOGIN OTP
    // =========================

    document
        .getElementById("verifyLoginOtpButton")
        .addEventListener(
            "click",
            async function () {

                const email =
                    document.getElementById(
                        "otpLoginEmail"
                    ).value.trim();


                const otp =
                    document.getElementById(
                        "loginOtp"
                    ).value.trim();


                if (!email || !otp) {

                    showMessage(
                        "Please enter email and OTP.",
                        "error"
                    );

                    return;
                }


                const button =
                    document.getElementById(
                        "verifyLoginOtpButton"
                    );


                button.disabled = true;

                button.textContent =
                    "Verifying...";


                try {

                    const response =
                        await fetch(
                            `${API_URL}/api/auth/super-admin/login-with-otp`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    email: email,
                                    otp: otp
                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Invalid OTP."
                        );
                    }


                    // =========================
                    // SAVE OTP LOGIN INFORMATION
                    // =========================

                    localStorage.setItem(
                        "superAdminToken",
                        data.token
                    );


                    localStorage.setItem(
                        "superAdmin",
                        JSON.stringify(
                            data.superAdmin
                        )
                    );


                    localStorage.setItem(
                        "loggedInUser",
                        JSON.stringify({
                            username:
                                data.superAdmin.username,

                            name:
                                data.superAdmin.name,

                            email:
                                data.superAdmin.email,

                            role: "SuperAdmin"
                        })
                    );


                    showMessage(
                        "OTP verified. Login successful.",
                        "success"
                    );


                    button.textContent =
                        "Login Successful";


                    setTimeout(function () {

                        window.location.href =
                            "super-admin-dashboard.html";

                    }, 700);


                } catch (error) {

                    console.error(
                        "Verify Login OTP Error:",
                        error
                    );


                    showMessage(
                        error.message ||
                        "Unable to verify OTP.",
                        "error"
                    );


                    button.disabled = false;

                    button.textContent =
                        "Verify OTP & Login";
                }

            }
        );


    // =========================
    // BACK TO PASSWORD LOGIN
    // =========================

    document
        .getElementById("backToPasswordLogin")
        .addEventListener(
            "click",
            function () {

                otpLoginSection
                    .classList
                    .add("hidden");

                passwordLoginSection
                    .classList
                    .remove("hidden");

                showMessage("", "");

            }
        );


    // =========================
    // FORGOT PASSWORD
    // =========================

    document
        .getElementById("forgotPasswordButton")
        .addEventListener(
            "click",
            function () {

                passwordLoginSection
                    .classList
                    .add("hidden");

                otpLoginSection
                    .classList
                    .add("hidden");

                forgotPasswordSection
                    .classList
                    .remove("hidden");

                showMessage("", "");

            }
        );


    // =========================
    // SEND RESET OTP
    // =========================

    document
        .getElementById("sendResetOtpButton")
        .addEventListener(
            "click",
            async function () {

                const email =
                    document.getElementById(
                        "resetEmail"
                    ).value.trim();


                if (!email) {

                    showMessage(
                        "Please enter your registered email.",
                        "error"
                    );

                    return;
                }


                const button =
                    document.getElementById(
                        "sendResetOtpButton"
                    );


                button.disabled = true;

                button.textContent =
                    "Sending OTP...";


                try {

                    const response =
                        await fetch(
                            `${API_URL}/api/auth/super-admin/forgot-password`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    email: email
                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Unable to send reset OTP."
                        );
                    }


                    showMessage(
                        data.message ||
                        "Reset OTP sent to your email.",
                        "success"
                    );


                    document
                        .getElementById(
                            "resetOtpSection"
                        )
                        .classList
                        .remove("hidden");


                } catch (error) {

                    console.error(
                        "Reset OTP Error:",
                        error
                    );


                    showMessage(
                        error.message ||
                        "Unable to send reset OTP.",
                        "error"
                    );


                } finally {

                    button.disabled = false;

                    button.textContent =
                        "Send Reset OTP";
                }

            }
        );


    // =========================
    // VERIFY RESET OTP
    // =========================

    let resetToken = null;


    document
        .getElementById("verifyResetOtpButton")
        .addEventListener(
            "click",
            async function () {

                const email =
                    document.getElementById(
                        "resetEmail"
                    ).value.trim();


                const otp =
                    document.getElementById(
                        "resetOtp"
                    ).value.trim();


                if (!email || !otp) {

                    showMessage(
                        "Please enter email and OTP.",
                        "error"
                    );

                    return;
                }


                const button =
                    document.getElementById(
                        "verifyResetOtpButton"
                    );


                button.disabled = true;

                button.textContent =
                    "Verifying...";


                try {

                    const response =
                        await fetch(
                            `${API_URL}/api/auth/super-admin/verify-reset-otp`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    email: email,
                                    otp: otp
                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Invalid OTP."
                        );
                    }


                    resetToken =
                        data.resetToken;


                    document
                        .getElementById(
                            "newPasswordSection"
                        )
                        .classList
                        .remove("hidden");


                    showMessage(
                        "OTP verified. Create your new password.",
                        "success"
                    );


                } catch (error) {

                    console.error(
                        "Verify Reset OTP Error:",
                        error
                    );


                    showMessage(
                        error.message ||
                        "Unable to verify OTP.",
                        "error"
                    );


                } finally {

                    button.disabled = false;

                    button.textContent =
                        "Verify OTP";
                }

            }
        );


    // =========================
    // RESET PASSWORD
    // =========================

    document
        .getElementById("resetPasswordButton")
        .addEventListener(
            "click",
            async function () {

                const email =
                    document.getElementById(
                        "resetEmail"
                    ).value.trim();


                const newPassword =
                    document.getElementById(
                        "newPassword"
                    ).value;


                const confirmPassword =
                    document.getElementById(
                        "confirmNewPassword"
                    ).value;


                if (
                    !newPassword ||
                    !confirmPassword
                ) {

                    showMessage(
                        "Please enter your new password.",
                        "error"
                    );

                    return;
                }


                if (
                    newPassword !==
                    confirmPassword
                ) {

                    showMessage(
                        "Passwords do not match.",
                        "error"
                    );

                    return;
                }


                if (newPassword.length < 8) {

                    showMessage(
                        "Password must be at least 8 characters.",
                        "error"
                    );

                    return;
                }


                if (!resetToken) {

                    showMessage(
                        "Please verify the OTP first.",
                        "error"
                    );

                    return;
                }


                const button =
                    document.getElementById(
                        "resetPasswordButton"
                    );


                button.disabled = true;

                button.textContent =
                    "Resetting...";


                try {

                    const response =
                        await fetch(
                            `${API_URL}/api/auth/super-admin/reset-password`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    email: email,
                                    resetToken:
                                        resetToken,
                                    newPassword:
                                        newPassword
                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Password reset failed."
                        );
                    }


                    showMessage(
                        "Password reset successfully. Please login.",
                        "success"
                    );


                    resetToken = null;


                    document
                        .getElementById(
                            "newPasswordSection"
                        )
                        .classList
                        .add("hidden");


                    document
                        .getElementById(
                            "resetOtpSection"
                        )
                        .classList
                        .add("hidden");


                    // Clear fields

                    document
                        .getElementById(
                            "resetEmail"
                        )
                        .value = "";


                    document
                        .getElementById(
                            "resetOtp"
                        )
                        .value = "";


                    document
                        .getElementById(
                            "newPassword"
                        )
                        .value = "";


                    document
                        .getElementById(
                            "confirmNewPassword"
                        )
                        .value = "";


                    setTimeout(function () {

                        forgotPasswordSection
                            .classList
                            .add("hidden");

                        passwordLoginSection
                            .classList
                            .remove("hidden");

                    }, 1500);


                } catch (error) {

                    console.error(
                        "Reset Password Error:",
                        error
                    );


                    showMessage(
                        error.message ||
                        "Unable to reset password.",
                        "error"
                    );


                } finally {

                    button.disabled = false;

                    button.textContent =
                        "Reset Password";
                }

            }
        );


    // =========================
    // BACK TO LOGIN
    // =========================

    document
        .getElementById("backToLoginButton")
        .addEventListener(
            "click",
            function () {

                forgotPasswordSection
                    .classList
                    .add("hidden");

                otpLoginSection
                    .classList
                    .add("hidden");

                passwordLoginSection
                    .classList
                    .remove("hidden");

                resetToken = null;

                showMessage("", "");

            }
        );

});