document.addEventListener("DOMContentLoaded", function () {

    const forgotPasswordForm =
        document.getElementById("forgotPasswordForm");

    const resetOtpSection =
        document.getElementById("resetOtpSection");

    const resetOtpForm =
        document.getElementById("resetOtpForm");

    const newPasswordSection =
        document.getElementById("newPasswordSection");

    const newPasswordForm =
        document.getElementById("newPasswordForm");

    const otpMessage =
        document.getElementById("otpMessage");


    // =========================
    // STEP 1: SEND OTP
    // =========================

    if (forgotPasswordForm) {

        forgotPasswordForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const email =
                document.getElementById("resetEmail").value.trim();


            if (email === "") {
                alert("Please enter your email.");
                return;
            }


            // Get registered users
            const users =
                JSON.parse(
                    localStorage.getItem("libraryUsers")
                ) || [];


            // Find account
            const user =
                users.find(function (account) {

                    return (
                        account.email.toLowerCase() ===
                        email.toLowerCase()
                    );

                });


            if (!user) {

                alert(
                    "No account found with this email address."
                );

                return;
            }


            // Generate 6 digit demo OTP
            const otp =
                Math.floor(
                    100000 + Math.random() * 900000
                ).toString();


            // Save reset information
            sessionStorage.setItem(
                "resetEmail",
                email
            );

            sessionStorage.setItem(
                "resetOtp",
                otp
            );


            // Hide email section
            forgotPasswordForm.style.display = "none";


            // Show OTP section
            resetOtpSection.style.display = "block";


            // Show demo OTP inside the page
            otpMessage.innerHTML = `
                <strong>OTP sent successfully!</strong><br>
                <span style="font-size: 13px;">
                    Demo OTP:
                </span>
                <strong
                    style="
                        display: inline-block;
                        margin-left: 5px;
                        letter-spacing: 3px;
                    "
                >
                    ${otp}
                </strong>
            `;

        });

    }


    // =========================
    // STEP 2: VERIFY OTP
    // =========================

    if (resetOtpForm) {

        resetOtpForm.addEventListener("submit", function (event) {

            event.preventDefault();


            const enteredOtp =
                document
                    .getElementById("resetOtp")
                    .value
                    .trim();


            const savedOtp =
                sessionStorage.getItem("resetOtp");


            if (enteredOtp === "") {

                alert("Please enter the OTP.");

                return;
            }


            if (enteredOtp !== savedOtp) {

                alert(
                    "Invalid OTP. Please enter the correct OTP."
                );

                return;
            }


            // OTP verified
            otpMessage.innerHTML = `
                <strong>
                    ✓ OTP verified successfully
                </strong>
            `;


            // Remove OTP
            sessionStorage.removeItem("resetOtp");


            // Hide OTP section
            resetOtpSection.style.display = "none";


            // Show password section
            newPasswordSection.style.display = "block";

        });

    }


    // =========================
    // STEP 3: RESET PASSWORD
    // =========================

    if (newPasswordForm) {

        newPasswordForm.addEventListener("submit", function (event) {

            event.preventDefault();


            const newPassword =
                document
                    .getElementById("newPassword")
                    .value;


            const confirmNewPassword =
                document
                    .getElementById("confirmNewPassword")
                    .value;


            // Empty password
            if (
                newPassword === "" ||
                confirmNewPassword === ""
            ) {

                alert(
                    "Please fill both password fields."
                );

                return;
            }


            // Password match
            if (newPassword !== confirmNewPassword) {

                alert(
                    "New password and confirm password do not match."
                );

                return;
            }


            // Minimum password length
            if (newPassword.length < 6) {

                alert(
                    "Password must be at least 6 characters."
                );

                return;
            }


            const resetEmail =
                sessionStorage.getItem("resetEmail");


            if (!resetEmail) {

                alert(
                    "Password reset session expired. Please try again."
                );

                window.location.href =
                    "forgot-password.html";

                return;
            }


            // Get users
            let users =
                JSON.parse(
                    localStorage.getItem("libraryUsers")
                ) || [];


            // Find user
            const userIndex =
                users.findIndex(function (account) {

                    return (
                        account.email.toLowerCase() ===
                        resetEmail.toLowerCase()
                    );

                });


            if (userIndex === -1) {

                alert("User account not found.");

                return;
            }


            // Update password
            users[userIndex].password =
                newPassword;


            // Save updated users
            localStorage.setItem(
                "libraryUsers",
                JSON.stringify(users)
            );


            // Clear reset session
            sessionStorage.removeItem(
                "resetEmail"
            );


            alert(
                "Password reset successfully!"
            );


            // Back to login
            window.location.href =
                "index.html";

        });

    }

});