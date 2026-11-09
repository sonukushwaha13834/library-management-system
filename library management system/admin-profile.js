function enableEdit() {

    document.getElementById("fullName").disabled = false;
    document.getElementById("username").disabled = false;
    document.getElementById("email").disabled = false;

    document.getElementById("saveButtons").classList.add("show");
}


function cancelEdit() {

    document.getElementById("fullName").disabled = true;
    document.getElementById("username").disabled = true;
    document.getElementById("email").disabled = true;

    document.getElementById("saveButtons").classList.remove("show");
}


function saveProfile() {

    const fullName =
        document.getElementById("fullName").value.trim();

    const username =
        document.getElementById("username").value.trim();

    const email =
        document.getElementById("email").value.trim();


    if (!fullName || !username || !email) {
        alert("Please fill all fields.");
        return;
    }


    alert("Profile updated successfully.");

    cancelEdit();
}


function openPasswordModal() {

    document
        .getElementById("passwordModal")
        .classList.add("show");
}


function closePasswordModal() {

    document
        .getElementById("passwordModal")
        .classList.remove("show");
}


function updatePassword() {

    const currentPassword =
        document.getElementById("currentPassword").value;

    const newPassword =
        document.getElementById("newPassword").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;


    if (!currentPassword || !newPassword || !confirmPassword) {
        alert("Please fill all password fields.");
        return;
    }


    if (newPassword !== confirmPassword) {
        alert("New password and confirm password do not match.");
        return;
    }


    if (newPassword.length < 6) {
        alert("Password must contain at least 6 characters.");
        return;
    }


    alert("Password updated successfully.");


    document.getElementById("currentPassword").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("confirmPassword").value = "";

    closePasswordModal();
}


window.addEventListener("click", function(event) {

    const modal =
        document.getElementById("passwordModal");

    if (event.target === modal) {
        closePasswordModal();
    }

});

/* =========================================================
   LOAD LOGGED-IN ADMIN NAME
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const loggedInUser =
        JSON.parse(localStorage.getItem("loggedInUser"));

    if (
        !loggedInUser ||
        loggedInUser.role !== "Admin"
    ) {
        return;
    }


    /* Get admin name */

    const adminName =
        loggedInUser.name ||
        loggedInUser.fullName ||
        loggedInUser.username ||
        "Admin";


    /* Get first letter */

    const avatarLetter =
        adminName
            .trim()
            .charAt(0)
            .toUpperCase();


    /* Update avatar */

    document
        .querySelectorAll(".profile-avatar")
        .forEach(function (avatar) {

            avatar.textContent =
                avatarLetter;

        });


    /* Update admin name wherever available */

    document
        .querySelectorAll(
            ".admin-name, .profile-name, .logged-in-admin-name"
        )
        .forEach(function (element) {

            element.textContent =
                adminName;

        });


    console.log(
        "Logged-in Admin:",
        adminName
    );

});

