document.addEventListener("DOMContentLoaded", function () {

    const signupForm = document.getElementById("signupForm");

    if (!signupForm) {
        return;
    }

    signupForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const fullName =
            document.getElementById("fullName").value.trim();

        const username =
            document.getElementById("signupUsername").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("signupPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        // Check password
        if (password !== confirmPassword) {
            alert("Password and Confirm Password do not match.");
            return;
        }


        // Get existing users
        let users =
            JSON.parse(localStorage.getItem("libraryUsers")) || [];


        // Check duplicate username
        const usernameExists =
            users.some(function (user) {
                return user.username.toLowerCase() ===
                       username.toLowerCase();
            });


        if (usernameExists) {
            alert("This username already exists. Please choose another username.");
            return;
        }


        // Create student account
      const newUser = {
    studentId: "STU" + Date.now(),
    fullName: fullName,
    username: username,
    email: email,
    password: password,
    role: "Student"
};


        // Save account
        users.push(newUser);

        localStorage.setItem(
            "libraryUsers",
            JSON.stringify(users)
        );


        // Success
        alert("Account created successfully! You can now log in.");


        // Go to login
        window.location.href = "index.html";

    });

});