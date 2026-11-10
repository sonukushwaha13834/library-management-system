const API_URL = API_BASE_URL;

const form =
    document.getElementById("passwordForm");

const password =
    document.getElementById("password");

const confirmPassword =
    document.getElementById("confirmPassword");

const submitBtn =
    document.getElementById("submitBtn");

const message =
    document.getElementById("message");


function showMessage(text, type) {

    message.textContent = text;

    message.className = type;
}


const urlParams =
    new URLSearchParams(window.location.search);

const token =
    urlParams.get("token");


if (!token) {

    showMessage(
        "Invalid or missing setup link.",
        "error"
    );

    submitBtn.disabled = true;
}


form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!token) {
            return;
        }


        const newPassword =
            password.value;

        const confirm =
            confirmPassword.value;


        if (newPassword.length < 8) {

            showMessage(
                "Password must contain at least 8 characters.",
                "error"
            );

            return;
        }


        if (newPassword !== confirm) {

            showMessage(
                "Password and Confirm Password do not match.",
                "error"
            );

            return;
        }


        submitBtn.disabled = true;

        submitBtn.textContent =
            "Setting Password...";


        try {

            const response =
                await fetch(
                    `${API_URL}/api/auth/admin-set-password`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            token,
                            password: newPassword
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to set password."
                );
            }


            showMessage(
                "Password created successfully. Your Admin account is now active.",
                "success"
            );


            submitBtn.textContent =
                "Password Set";


            form.reset();


            setTimeout(function () {

                window.location.href =
                    "index.html";

            }, 2500);


        } catch (error) {

            showMessage(
                error.message,
                "error"
            );


            submitBtn.disabled =
                false;

            submitBtn.textContent =
                "Set Password";
        }

    }
);