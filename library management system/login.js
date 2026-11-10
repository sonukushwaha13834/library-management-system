// /* =========================================================
//    LIBRARY MANAGEMENT SYSTEM
//    LOGIN PAGE JAVASCRIPT
// ========================================================= */

// document.addEventListener("DOMContentLoaded", function () {

//     /* =====================================================
//        ELEMENTS
//     ===================================================== */

//     const loginForm =
//         document.getElementById("loginForm");

//     const adminRadio =
//         document.getElementById("admin");

//     const studentRadio =
//         document.getElementById("student");

//     const loginCard =
//         document.querySelector(".login-card");


//     /* =====================================================
//        HELPER FUNCTION
//     ===================================================== */

//     function setRoleAnimation(role) {

//         if (!loginCard) {
//             return;
//         }

//         /* Remove previous role class */

//         loginCard.classList.remove(
//             "role-admin",
//             "role-student"
//         );

//         /* Restart animation */

//         void loginCard.offsetWidth;

//         /* Add current role class */

//         if (role === "Admin") {

//             loginCard.classList.add(
//                 "role-admin"
//             );

//         } else {

//             loginCard.classList.add(
//                 "role-student"
//             );

//         }
//     }


//     /* =====================================================
//        INITIAL STATE
//     ===================================================== */

//     if (adminRadio && adminRadio.checked) {

//         setRoleAnimation("Admin");

//     } else if (
//         studentRadio &&
//         studentRadio.checked
//     ) {

//         setRoleAnimation("Student");

//     }


//     /* =====================================================
//        ADMIN ROLE
//     ===================================================== */

//     if (adminRadio) {

//         adminRadio.addEventListener(
//             "change",
//             function () {

//                 if (!adminRadio.checked) {
//                     return;
//                 }

//                 setRoleAnimation("Admin");

//                 const heading =
//                     document.querySelector(
//                         ".login-header h2"
//                     );

//                 const description =
//                     document.querySelector(
//                         ".login-header p"
//                     );


//                 if (heading) {

//                     heading.textContent =
//                         "Admin Login";

//                 }


//                 if (description) {

//                     description.textContent =
//                         "Access your admin dashboard";

//                 }

//             }
//         );

//     }


//     /* =====================================================
//        STUDENT ROLE
//     ===================================================== */

//     if (studentRadio) {

//         studentRadio.addEventListener(
//             "change",
//             function () {

//                 if (!studentRadio.checked) {
//                     return;
//                 }

//                 setRoleAnimation("Student");

//                 const heading =
//                     document.querySelector(
//                         ".login-header h2"
//                     );

//                 const description =
//                     document.querySelector(
//                         ".login-header p"
//                     );


//                 if (heading) {

//                     heading.textContent =
//                         "Student Login";

//                 }


//                 if (description) {

//                     description.textContent =
//                         "Access your student dashboard";

//                 }

//             }
//         );

//     }


//     /* =====================================================
//        USERNAME + PASSWORD LOGIN
//     ===================================================== */

//     if (loginForm) {

//         loginForm.addEventListener(
//             "submit",
//             async function (event) {

//                 event.preventDefault();


//                 /* -----------------------------------------
//                    GET INPUTS
//                 ----------------------------------------- */

//                 const usernameInput =
//                     document.getElementById(
//                         "username"
//                     );

//                 const passwordInput =
//                     document.getElementById(
//                         "password"
//                     );


//                 const username =
//                     usernameInput
//                         ? usernameInput.value.trim()
//                         : "";


//                 const password =
//                     passwordInput
//                         ? passwordInput.value
//                         : "";


//                 /* -----------------------------------------
//                    SELECTED ROLE
//                 ----------------------------------------- */

//                 const selectedRole =
//                     adminRadio &&
//                     adminRadio.checked
//                         ? "Admin"
//                         : "Student";


//                 /* =================================================
//                    BASIC VALIDATION
//                 ================================================= */

//                 if (!username || !password) {

//                     alert(
//                         "Please enter username and password."
//                     );

//                     return;
//                 }


//                 /* =================================================
//                    ADMIN LOGIN
//                 ================================================= */

//                 if (selectedRole === "Admin") {

//                     try {

//                         /* -------------------------------------
//                            SEND LOGIN REQUEST TO BACKEND
//                         ------------------------------------- */

//                         const response =
//                             await fetch(
//                                 "http://localhost:5000/api/auth/admin-login",
//                                 {
//                                     method: "POST",

//                                     headers: {
//                                         "Content-Type":
//                                             "application/json"
//                                     },

//                                     body:
//                                         JSON.stringify({

//                                             username:
//                                                 username,

//                                             password:
//                                                 password

//                                         })
//                                 }
//                             );


//                         /* -------------------------------------
//                            READ SERVER RESPONSE
//                         ------------------------------------- */

//                         let data = {};

//                         try {

//                             data =
//                                 await response.json();

//                         } catch (jsonError) {

//                             console.error(
//                                 "Invalid server response:",
//                                 jsonError
//                             );

//                         }


//                         /* -------------------------------------
//                            LOGIN FAILED
//                         ------------------------------------- */

//                         if (
//                             !response.ok ||
//                             !data.success
//                         ) {

//                             alert(
//                                 data.message ||
//                                 "Invalid Admin username/email or password."
//                             );

//                             return;
//                         }



//                         /* -------------------------------------
//                            SAVE ADMIN SESSION
//                         ------------------------------------- */
//                         localStorage.setItem(
//     "adminToken",
//     data.token
// );

//                         localStorage.setItem(
//                             "loggedInUser",
//                             JSON.stringify({

//     adminId:
//         data.admin.adminId,

//     name:
//         data.admin.name,

//     username:
//         data.admin.username,

//     email:
//         data.admin.email,

//     collegeId:
//         data.admin.collegeId,

//     role:
//         "Admin",

//     status:
//         data.admin.status,

//     mustChangePassword:
//         data.admin.mustChangePassword
// })

//                         );
                      


//                         /* -------------------------------------
//                            SUCCESS
//                         ------------------------------------- */

//                         alert(
//                             "Admin login successful!"
//                         );
//                         if (data.admin.mustChangePassword === true) {
//     window.location.href =
//         "change-admin-password.html";

//     return;
// }


//                         /* -------------------------------------
//                            ADMIN DASHBOARD
//                         ------------------------------------- */

//                         window.location.href =
//                             "admin-dashboard.html";


//                         return;

//                     } catch (error) {

//                         console.error(
//                             "Admin Login Error:",
//                             error
//                         );


//                         alert(
//                             "Unable to connect to the server. Please make sure the backend is running."
//                         );

//                         return;
//                     }

//                 }


//                 /* =================================================
//                    STUDENT LOGIN
//                 ================================================= */

//                 const users =
//                     JSON.parse(
//                         localStorage.getItem(
//                             "libraryUsers"
//                         )
//                     ) || [];


//                 /* -----------------------------------------
//                    FIND STUDENT
//                 ----------------------------------------- */

//                 const student =
//                     users.find(
//                         function (user) {

//                             return (

//                                 user.username &&

//                                 user.username
//                                     .toLowerCase() ===
//                                 username
//                                     .toLowerCase() &&

//                                 user.password ===
//                                 password &&

//                                 user.role ===
//                                 "Student"

//                             );

//                         }
//                     );


//                 /* -----------------------------------------
//                    INVALID LOGIN
//                 ----------------------------------------- */

//                 if (!student) {

//                     alert(
//                         "Invalid username or password."
//                     );

//                     return;
//                 }


//                 /* -----------------------------------------
//                    SAVE STUDENT SESSION
//                 ----------------------------------------- */

//                 localStorage.setItem(
//                     "loggedInUser",

//                     JSON.stringify(student)
//                 );
                


//                 /* -----------------------------------------
//                    SUCCESS MESSAGE
//                 ----------------------------------------- */

//                 alert(
//                     "Welcome " +
//                     (
//                         student.fullName ||
//                         student.username
//                     ) +
//                     "!"
//                 );


//                 /* -----------------------------------------
//                    STUDENT DASHBOARD
//                 ----------------------------------------- */

//                 window.location.href =
//                     "student.html";

//             }
//         );

//     }


//     /* =====================================================
//        DEBUG MESSAGE
//     ===================================================== */

//     console.log(
//         "Library Login System initialized successfully."
//     );
//     console.log("LOGIN JS IS RUNNING");

// });


// ==========================================================
// LIBRARY MANAGEMENT SYSTEM
// LOGIN.JS
// ADMIN + STUDENT LOGIN
// ==========================================================
const API_URL = API_BASE_URL;
// ==========================================================
// DOM ELEMENTS
// ==========================================================

const loginForm = document.getElementById("loginForm");

const usernameInput =
    document.getElementById("username");

const passwordInput =
    document.getElementById("password");

const adminRadio =
    document.getElementById("admin");

const studentRadio =
    document.getElementById("student");

const passwordToggle =
    document.getElementById("passwordToggle");

const passwordIcon =
    document.getElementById("passwordIcon");

const loginButton =
    document.querySelector(".login-button");

const buttonText =
    document.querySelector(".button-text");


// ==========================================================
// PASSWORD SHOW / HIDE
// ==========================================================

if (passwordInput) {

    passwordInput.addEventListener(
        "input",
        function () {

            if (passwordInput.value.length > 0) {

                if (passwordToggle) {
                    passwordToggle.style.display =
                        "block";
                }

                if (passwordIcon) {
                    passwordIcon.style.display =
                        "none";
                }

            } else {

                if (passwordToggle) {
                    passwordToggle.style.display =
                        "none";
                }

                if (passwordIcon) {
                    passwordIcon.style.display =
                        "block";
                }

            }

        }
    );

}


if (passwordToggle) {

    passwordToggle.addEventListener(
        "click",
        function () {

            if (
                passwordInput.type ===
                "password"
            ) {

                passwordInput.type =
                    "text";

                passwordToggle.textContent =
                    "🙈";

            } else {

                passwordInput.type =
                    "password";

                passwordToggle.textContent =
                    "👁️";

            }

        }
    );

}


// ==========================================================
// ROLE UI
// ==========================================================

function updateRoleUI() {

    const heading =
        document.querySelector(
            ".login-header h2"
        );

    const description =
        document.querySelector(
            ".login-header p"
        );


    if (!heading || !description) {
        return;
    }


    if (
        studentRadio &&
        studentRadio.checked
    ) {

        heading.textContent =
            "Student Login";

        description.textContent =
            "Access your student dashboard";

    } else {

        heading.textContent =
            "Admin Login";

        description.textContent =
            "Access your admin dashboard";

    }

}


if (adminRadio) {

    adminRadio.addEventListener(
        "change",
        updateRoleUI
    );

}


if (studentRadio) {

    studentRadio.addEventListener(
        "change",
        updateRoleUI
    );

}


updateRoleUI();


// ==========================================================
// BUTTON LOADING
// ==========================================================

function setLoading(loading) {

    if (!loginButton) {
        return;
    }


    loginButton.disabled =
        loading;


    if (loading) {

        loginButton.style.opacity =
            "0.7";

        loginButton.style.cursor =
            "not-allowed";

        if (buttonText) {
            buttonText.textContent =
                "Logging in...";
        }

    } else {

        loginButton.style.opacity =
            "1";

        loginButton.style.cursor =
            "pointer";

        if (buttonText) {
            buttonText.textContent =
                "Log in";
        }

    }

}


// ==========================================================
// SAVE ADMIN LOGIN
// ==========================================================

function saveAdminSession(data) {

    if (!data) {
        return;
    }


    if (data.token) {

        localStorage.setItem(
            "adminToken",
            data.token
        );

    }


    if (data.admin) {

        localStorage.setItem(
            "loggedInAdmin",
            JSON.stringify(data.admin)
        );

        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(data.admin)
        );

    }

}


// ==========================================================
// SAVE STUDENT LOGIN
// ==========================================================

function saveStudentSession(data) {

    if (!data) {
        return;
    }


    if (data.token) {

        localStorage.setItem(
            "studentToken",
            data.token
        );

    }


    if (data.student) {

        localStorage.setItem(
            "loggedInStudent",
            JSON.stringify(data.student)
        );

        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(data.student)
        );

    }

}


// ==========================================================
// ADMIN LOGIN
// ==========================================================

async function adminLogin(
    username,
    password
) {

    const response =
        await fetch(
            API_URL +
            "/api/auth/admin-login",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({

                        username:
                            username,

                        password:
                            password

                    })

            }
        );


    let data;

    try {

        data =
            await response.json();

    } catch (error) {

        throw new Error(
            "Invalid response from server."
        );

    }


    if (
        !response.ok ||
        !data.success
    ) {

        throw new Error(
            data.message ||
            "Invalid admin username or password."
        );

    }


    saveAdminSession(data);


    return data;

}


// ==========================================================
// STUDENT LOGIN
// ==========================================================

async function studentLogin(
    username,
    password
) {

    const response =
        await fetch(
            API_URL +
            "/api/auth/student-login",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({

                        username:
                            username,

                        password:
                            password

                    })

            }
        );


    let data;

    try {

        data =
            await response.json();

    } catch (error) {

        throw new Error(
            "Invalid response from server."
        );

    }


    if (
        !response.ok ||
        !data.success
    ) {

        throw new Error(
            data.message ||
            "Invalid student username or password."
        );

    }


    saveStudentSession(data);


    return data;

}


// ==========================================================
// LOGIN FORM
// ==========================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const username =
                usernameInput.value.trim();

            const password =
                passwordInput.value;


            // --------------------------------------------------
            // VALIDATION
            // --------------------------------------------------

            if (!username) {

                alert(
                    "Please enter your username."
                );

                usernameInput.focus();

                return;

            }


            if (!password) {

                alert(
                    "Please enter your password."
                );

                passwordInput.focus();

                return;

            }


            setLoading(true);


            try {

                // =================================================
                // ADMIN
                // =================================================

                if (
                    adminRadio &&
                    adminRadio.checked
                ) {

                    const data =
                        await adminLogin(
                            username,
                            password
                        );


                    console.log(
                        "Admin login successful:",
                        data
                    );
                    if (
    data.admin &&
    data.admin.mustChangePassword === true
) {

    window.location.href =
        "admin-change-password.html";

} else {

    window.location.href =
        "admin-dashboard.html";

}



                    return;

                }


                // =================================================
                // STUDENT
                // =================================================

                if (
                    studentRadio &&
                    studentRadio.checked
                ) {

                    const data =
                        await studentLogin(
                            username,
                            password
                        );


                    console.log(
                        "Student login successful:",
                        data
                    );


                    window.location.href =
                        "student.html";


                    return;

                }


                alert(
                    "Please select Admin or Student."
                );


            } catch (error) {

                console.error(
                    "Login Error:",
                    error
                );


                alert(
                    error.message ||
                    "Login failed. Please try again."
                );


            } finally {

                setLoading(false);

            }

        }
    );

}


// ==========================================================
// END
// ==========================================================

