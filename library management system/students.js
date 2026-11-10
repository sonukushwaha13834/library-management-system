
let currentPage = 1;
const studentsPerPage = 5;

const API_BASE = `${API_BASE_URL}/api/admin/students`;

/* =========================================================
   PAGE INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    loadStudents();
    setupPageEvents();
    loadLoggedInAdmin();

});


/* =========================================================
   GET ADMIN TOKEN
========================================================= */

function getAdminToken() {

    return localStorage.getItem("adminToken");

}


/* =========================================================
   PAGE EVENTS
========================================================= */

function setupPageEvents() {

    const searchInput =
        document.querySelector(".search-box input");

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                currentPage = 1;
                loadStudents();

            }
        );

    }


    const courseFilter =
        document.querySelector(".course-filter");

    if (courseFilter) {

        courseFilter.addEventListener(
            "change",
            function () {

                currentPage = 1;
                loadStudents();

            }
        );

    }


    const statusFilter =
        document.querySelector(".status-filter");

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            function () {

                currentPage = 1;
                loadStudents();

            }
        );

    }


    const addStudentButton =
        document.querySelector(".add-student-btn");

    if (addStudentButton) {

        addStudentButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                addNewStudent();

            }
        );

    }


    const notification =
        document.querySelector(".notification");

    if (notification) {

        notification.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                openNotifications();

            }
        );

    }


    document.addEventListener(
        "click",
        function () {

            closeHeaderPopups();

        }
    );

}


/* =========================================================
   LOAD STUDENTS FROM BACKEND
========================================================= */

async function loadStudents() {

    const tableBody =
        document.querySelector("table tbody");

    if (!tableBody) {
        return;
    }


    const adminToken =
        getAdminToken();


    if (!adminToken) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7"
                    style="text-align:center;padding:40px;">
                    Admin session expired. Please login again.
                </td>
            </tr>
        `;

        updateStudentStats([]);

        updatePagination(0);

        return;
    }


    let students = [];


    try {

        const response =
            await fetch(
                API_BASE,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + adminToken
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "STUDENT API RESPONSE:",
            data
        );


        if (!response.ok || !data.success) {

            console.error(
                "Load Students Error:",
                data.message
            );

            tableBody.innerHTML = `
                <tr>
                    <td colspan="7"
                        style="text-align:center;padding:40px;">
                        ${escapeHTML(
                            data.message ||
                            "Unable to load students."
                        )}
                    </td>
                </tr>
            `;

            updateStudentStats([]);

            updatePagination(0);

            return;

        }


        students =
            Array.isArray(data.students)
                ? data.students
                : [];


    } catch (error) {

        console.error(
            "Load Students Error:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="7"
                    style="text-align:center;padding:40px;">
                    Unable to connect to server.
                </td>
            </tr>
        `;

        updateStudentStats([]);

        updatePagination(0);

        return;

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    const searchInput =
        document.querySelector(
            ".search-box input"
        );


  
const searchText =
    searchInput
        ? searchInput.value
            .toLowerCase()
            .trim()
        : "";




    if (searchText) {

        students =
            students.filter(
                function (student) {

                    const name =
                        String(
                            student.fullName || ""
                        ).toLowerCase();


                    const username =
                        String(
                            student.username || ""
                        ).toLowerCase();


                    const email =
                        String(
                            student.email || ""
                        ).toLowerCase();


                    const studentId =
                        String(
                            student.studentId || ""
                        ).toLowerCase();


                    const course =
                        String(
                            student.course || ""
                        ).toLowerCase();


                    return (
                        name.includes(searchText) ||
                        username.includes(searchText) ||
                        email.includes(searchText) ||
                        studentId.includes(searchText) ||
                        course.includes(searchText)
                    );

                }
            );

    }


    /* =====================================================
       COURSE FILTER
    ===================================================== */

    const courseFilter =
        document.querySelector(
            ".course-filter"
        );


    if (
        courseFilter &&
        courseFilter.value &&
        courseFilter.value !== "All Courses"
    ) {

        students =
            students.filter(
                function (student) {

                   
return String(
    student.course || ""
)
    .trim()
    .toLowerCase()
    ===
    String(
        courseFilter.value || ""
    )
    .trim()
    .toLowerCase();


                }
            );

    }


    /* =====================================================
       STATUS FILTER
    ===================================================== */

    const statusFilter =
        document.querySelector(
            ".status-filter"
        );


    if (
        statusFilter &&
        statusFilter.value &&
        statusFilter.value !== "All Status"
    ) {

        students =
            students.filter(
                function (student) {

                  
return String(
    student.status || "Active"
)
    .trim()
    .toLowerCase()
    ===
    String(
        statusFilter.value || ""
    )
    .trim()
    .toLowerCase();



                }
            );

    }


    /* =====================================================
       UPDATE REAL STATISTICS
    ===================================================== */

    /*
       IMPORTANT:
       Stats are calculated BEFORE pagination.
    */

    updateStudentStats(students);


    /* =====================================================
       CLEAR TABLE
    ===================================================== */

    tableBody.innerHTML = "";


    /* =====================================================
       NO STUDENTS
    ===================================================== */

    if (students.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7"
                    style="text-align:center;padding:40px;">
                    No students found.
                </td>
            </tr>
        `;

        updatePagination(0);

        return;

    }


    /* =====================================================
       PAGINATION
    ===================================================== */

    const totalStudents =
        students.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                totalStudents /
                studentsPerPage
            )
        );


    if (currentPage > totalPages) {

        currentPage =
            totalPages;

    }


    const startIndex =
        (currentPage - 1) *
        studentsPerPage;


    const endIndex =
        startIndex +
        studentsPerPage;


    const studentsToShow =
        students.slice(
            startIndex,
            endIndex
        );


    /* =====================================================
       CREATE TABLE ROWS
    ===================================================== */

    studentsToShow.forEach(
        function (student) {

            const row =
                document.createElement("tr");


            const fullName =
                student.fullName ||
                "Unknown Student";


            const username =
                student.username ||
                "unknown";


            const email =
                student.email ||
                "Not Added";


            const course =
                student.course ||
                "Not Added";


            const status =
                student.status ||
                "Active";


            const studentId =
                student.studentId ||
                "Not Added";


            const books =
                Number(
                    student.booksIssued || 0
                );


            const initials =
                getInitials(fullName);


            const statusClass =
                status.toLowerCase() ===
                "inactive"
                    ? "inactive"
                    : "active";


            row.innerHTML = `

                <td>

                    <div class="student-name">

                        <div class="student-avatar blue">
                            ${escapeHTML(initials)}
                        </div>

                        <div>

                            <strong>
                                ${escapeHTML(fullName)}
                            </strong>

                            <span>
                                @${escapeHTML(username)}
                            </span>

                        </div>

                    </div>

                </td>


                <td>
                    ${escapeHTML(studentId)}
                </td>


                <td>
                    ${escapeHTML(course)}
                </td>


                <td>
                    ${escapeHTML(email)}
                </td>


                <td>
                    ${books}
                </td>


                <td>

                    <span class="status ${statusClass}">
                        ${escapeHTML(status)}
                    </span>

                </td>


                <td>

                    <div class="actions">

                        <button
                            type="button"
                            class="view"
                            title="View Student"
                            data-action="view"
                            data-student-id="${escapeHTML(studentId)}">
                            👁
                        </button>


                        <button
                            type="button"
                            class="edit"
                            title="Edit Student"
                            data-action="edit"
                            data-student-id="${escapeHTML(studentId)}">
                            ✏️
                        </button>


                        <button
                            type="button"
                            class="delete"
                            title="Delete Student"
                            data-action="delete"
                            data-student-id="${escapeHTML(studentId)}">
                            🗑️
                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(row);

        }
    );


    /* =====================================================
       ACTION BUTTONS
    ===================================================== */

    tableBody
        .querySelectorAll("[data-action]")
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();
                        event.stopPropagation();


                        const action =
                            button.dataset.action;


                        const studentId =
                            button.dataset.studentId;


                        if (!studentId) {

                            alert(
                                "Student ID not found."
                            );

                            return;

                        }


                        if (action === "view") {

                            viewStudent(
                                studentId
                            );

                        }


                        if (action === "edit") {

                            editStudent(
                                studentId
                            );

                        }


                        if (action === "delete") {

                            deleteStudent(
                                studentId
                            );

                        }

                    }
                );

            }
        );


    /* =====================================================
       PAGINATION
    ===================================================== */

    updatePagination(
        students.length
    );

}

/* =========================================================
   ADD NEW STUDENT
========================================================= */

function addNewStudent() {

    const oldModal =
        document.getElementById("addStudentModal");

    if (oldModal) {
        oldModal.remove();
    }

    const modal =
        document.createElement("div");

    modal.id = "addStudentModal";

    modal.innerHTML = `

        <div class="student-modal-overlay">

            <div class="student-modal">

                <div class="student-modal-header">

                    <div>
                        <h2>Add New Student</h2>

                        <p>
                            Create a new student library account
                        </p>
                    </div>

                    <button
                        type="button"
                        class="student-modal-close"
                        id="closeStudentModal">
                        ×
                    </button>

                </div>


                <form id="addStudentForm">

                    <div class="student-form-grid">

                        <div class="student-form-group">

                            <label>
                                Full Name
                            </label>

                            <input
                                type="text"
                                id="newStudentName"
                                placeholder="Enter full name"
                                required>

                        </div>


                        <div class="student-form-group">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                id="newStudentEmail"
                                placeholder="Enter email address"
                                required>

                        </div>


                        <div class="student-form-group">

                            <label>
                                Course
                            </label>

                            <input
                                type="text"
                                id="newStudentCourse"
                                placeholder="e.g. BCA, B.Tech, BBA"
                                required>

                        </div>


                        <div class="student-form-group">

                            <label>
                                Account Status
                            </label>

                            <select id="newStudentStatus">

                                <option value="Active">
                                    Active
                                </option>

                                <option value="Pending">
                                    Pending
                                </option>

                            </select>

                        </div>

                    </div>


                    <div class="student-modal-actions">

                        <button
                            type="button"
                            id="cancelStudentModal"
                            class="student-cancel-btn">
                            Cancel
                        </button>


                        <button
                            type="submit"
                            class="student-create-btn">
                            Create Student
                        </button>

                    </div>

                </form>

            </div>

        </div>

    `;

    document.body.appendChild(modal);


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    document
        .getElementById("closeStudentModal")
        .addEventListener("click", function () {

            modal.remove();

        });


    document
        .getElementById("cancelStudentModal")
        .addEventListener("click", function () {

            modal.remove();

        });


    modal
        .querySelector(".student-modal-overlay")
        .addEventListener("click", function (event) {

            if (
                event.target ===
                event.currentTarget
            ) {

                modal.remove();

            }

        });


    /* =====================================================
       CREATE STUDENT
    ===================================================== */

    document
        .getElementById("addStudentForm")
        .addEventListener("submit", async function (event) {

            event.preventDefault();


            const fullName =
                document
                    .getElementById("newStudentName")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("newStudentEmail")
                    .value
                    .trim();


            const course =
                document
                    .getElementById("newStudentCourse")
                    .value
                    .trim();


            const status =
                document
                    .getElementById("newStudentStatus")
                    .value;


            if (
                !fullName ||
                !email ||
                !course
            ) {

                alert(
                    "Please fill all required fields."
                );

                return;

            }


            const adminToken =
                getAdminToken();


            if (!adminToken) {

                alert(
                    "Admin session expired. Please login again."
                );

                return;

            }


            try {

                /*
                 * Username aur temporary password
                 * BACKEND automatically generate karega.
                 */

                const response =
                    await fetch(
                        API_BASE,
                        {
                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    "Bearer " +
                                    adminToken

                            },

                            body:
                                JSON.stringify({

                                    fullName:
                                        fullName,

                                    email:
                                        email,

                                    course:
                                        course,

                                    status:
                                        status

                                })

                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    alert(
                        data.message ||
                        "Unable to create student."
                    );

                    return;

                }


                modal.remove();


                currentPage = 1;


                await loadStudents();


                alert(
                    "Student account created successfully!\n\nUsername and temporary password have been sent to the student's email."
                );


            } catch (error) {

                console.error(
                    "Create Student Error:",
                    error
                );


                alert(
                    "Unable to connect to the server."
                );

            }

        });

}
// /* =========================================================
//    ADD NEW STUDENT
// ========================================================= */

// function addNewStudent() {

//     const oldModal =
//         document.getElementById(
//             "addStudentModal"
//         );


//     if (oldModal) {
//         oldModal.remove();
//     }


//     const modal =
//         document.createElement("div");


//     modal.id =
//         "addStudentModal";


//     modal.innerHTML = `

//         <div class="student-modal-overlay">

//             <div class="student-modal">

//                 <div class="student-modal-header">

//                     <div>

//                         <h2>
//                             Add New Student
//                         </h2>

//                         <p>
//                             Create a new student library account
//                         </p>

//                     </div>


//                     <button
//                         type="button"
//                         class="student-modal-close"
//                         id="closeStudentModal">
//                         ×
//                     </button>

//                 </div>


//                 <form id="addStudentForm">

//                     <div class="student-form-grid">

//                         <div class="student-form-group">

//                             <label>
//                                 Full Name
//                             </label>

//                             <input
//                                 type="text"
//                                 id="newStudentName"
//                                 placeholder="Enter full name"
//                                 required>

//                         </div>


//                         <div class="student-form-group">

//                             <label>
//                                 Username
//                             </label>

//                             <input
//                                 type="text"
//                                 id="newStudentUsername"
//                                 placeholder="Create username"
//                                 required>

//                         </div>


//                         <div class="student-form-group">

//                             <label>
//                                 Email
//                             </label>

//                             <input
//                                 type="email"
//                                 id="newStudentEmail"
//                                 placeholder="Enter email address"
//                                 required>

//                         </div>


//                         <div class="student-form-group">

//                             <label>
//                                 Password
//                             </label>

//                             <input
//                                 type="password"
//                                 id="newStudentPassword"
//                                 placeholder="Create password"
//                                 required>

//                         </div>


//                         <div class="student-form-group">

//                             <label>
//                                 Course
//                             </label>

//                             <input
//                                 type="text"
//                                 id="newStudentCourse"
//                                 placeholder="e.g. BCA, B.Tech, BBA"
//                                 required>

//                         </div>


//                         <div class="student-form-group">

//                             <label>
//                                 Account Status
//                             </label>

//                             <select id="newStudentStatus">

//                                 <option value="Active">
//                                     Active
//                                 </option>

//                                 <option value="Inactive">
//                                     Inactive
//                                 </option>

//                             </select>

//                         </div>

//                     </div>


//                     <div class="student-modal-actions">

//                         <button
//                             type="button"
//                             id="cancelStudentModal"
//                             class="student-cancel-btn">
//                             Cancel
//                         </button>


//                         <button
//                             type="submit"
//                             class="student-create-btn">
//                             Create Student
//                         </button>

//                     </div>

//                 </form>

//             </div>

//         </div>

//     `;


//     document.body.appendChild(modal);


//     document
//         .getElementById("closeStudentModal")
//         .addEventListener(
//             "click",
//             function () {

//                 modal.remove();

//             }
//         );


//     document
//         .getElementById("cancelStudentModal")
//         .addEventListener(
//             "click",
//             function () {

//                 modal.remove();

//             }
//         );


//     modal
//         .querySelector(".student-modal-overlay")
//         .addEventListener(
//             "click",
//             function (event) {

//                 if (
//                     event.target ===
//                     event.currentTarget
//                 ) {

//                     modal.remove();

//                 }

//             }
//         );


//     document
//         .getElementById("addStudentForm")
//         .addEventListener(
//             "submit",
//             async function (event) {

//                 event.preventDefault();


//                 const fullName =
//                     document
//                         .getElementById(
//                             "newStudentName"
//                         )
//                         .value
//                         .trim();


//                 const username =
//                     document
//                         .getElementById(
//                             "newStudentUsername"
//                         )
//                         .value
//                         .trim();


//                 const email =
//                     document
//                         .getElementById(
//                             "newStudentEmail"
//                         )
//                         .value
//                         .trim();


//                 const password =
//                     document
//                         .getElementById(
//                             "newStudentPassword"
//                         )
//                         .value;


//                 const course =
//                     document
//                         .getElementById(
//                             "newStudentCourse"
//                         )
//                         .value
//                         .trim();


//                 if (
//                     !fullName ||
//                     !username ||
//                     !email ||
//                     !password ||
//                     !course
//                 ) {

//                     alert(
//                         "Please fill all required fields."
//                     );

//                     return;

//                 }


//                 const adminToken =
//                     getAdminToken();


//                 if (!adminToken) {

//                     alert(
//                         "Admin session expired. Please login again."
//                     );

//                     return;

//                 }


//                 try {

//                     const response =
//                         await fetch(
//                             API_BASE,
//                             {
//                                 method: "POST",

//                                 headers: {

//                                     "Content-Type":
//                                         "application/json",

//                                     "Authorization":
//                                         "Bearer " +
//                                         adminToken

//                                 },

//                                body:
//     JSON.stringify({

//         fullName:
//             fullName,

//         username:
//             username,

//         email:
//             email,

//         password:
//             password,

//         course:
//             course,

//         status:
//             status

//     })

//                             }
//                         );


//                     const data =
//                         await response.json();


//                     if (
//                         !response.ok ||
//                         !data.success
//                     ) {

//                         alert(
//                             data.message ||
//                             "Unable to create student."
//                         );

//                         return;

//                     }


//                     modal.remove();


//                     currentPage = 1;


//                     await loadStudents();


//                     alert(
//                         "Student account created successfully!"
//                     );


//                 } catch (error) {

//                     console.error(
//                         "Create Student Error:",
//                         error
//                     );


//                     alert(
//                         "Unable to connect to the server."
//                     );

//                 }

//             }
//         );

// }


/* =========================================================
   VIEW STUDENT
========================================================= */

async function viewStudent(studentId) {

    const adminToken =
        getAdminToken();


    if (!adminToken) {

        alert(
            "Admin session expired. Please login again."
        );

        return;

    }


    try {

        const response =
            await fetch(
                API_BASE +
                "/" +
                encodeURIComponent(studentId),
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " +
                            adminToken
                    }
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            alert(
                data.message ||
                "Student not found."
            );

            return;

        }


        const student =
            data.student;


        const oldModal =
            document.getElementById(
                "viewStudentModal"
            );


        if (oldModal) {
            oldModal.remove();
        }


        const status =
            student.status ||
            "Active";


        const course =
            student.course ||
            "Not Added";


        const viewedStudentId =
            student.studentId ||
            "Not Added";


        const booksIssued =
            Number(
                student.booksIssued || 0
            );


        const initials =
            getInitials(
                student.fullName
            );


        const modal =
            document.createElement(
                "div"
            );


        modal.id =
            "viewStudentModal";


        modal.innerHTML = `

            <div class="student-modal-overlay">

                <div class="student-modal view-student-modal">

                    <div class="student-modal-header">

                        <div>

                            <h2>
                                Student Profile
                            </h2>

                            <p>
                                Student account information
                            </p>

                        </div>


                        <button
                            type="button"
                            class="student-modal-close"
                            id="closeViewStudentModal">
                            ×
                        </button>

                    </div>


                    <div class="student-profile-content">

                        <div class="student-profile-top">

                            <div class="student-profile-avatar">
                                ${escapeHTML(initials)}
                            </div>


                            <div>

                                <h3>
                                    ${escapeHTML(
                                        student.fullName ||
                                        "Unknown"
                                    )}
                                </h3>

                                <p>
                                    @${escapeHTML(
                                        student.username ||
                                        ""
                                    )}
                                </p>


                                <span class="
                                    student-profile-status
                                    ${
                                        status === "Active"
                                            ? "active"
                                            : "inactive"
                                    }
                                ">
                                    ${escapeHTML(status)}
                                </span>

                            </div>

                        </div>


                        <div class="student-details-grid">

                            <div class="student-detail-item">

                                <span class="detail-label">
                                    Student ID
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        viewedStudentId
                                    )}
                                </strong>

                            </div>


                            <div class="student-detail-item">

                                <span class="detail-label">
                                    Course
                                </span>

                                <strong>
                                    ${escapeHTML(course)}
                                </strong>

                            </div>


                            <div class="student-detail-item">

                                <span class="detail-label">
                                    Email
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        student.email ||
                                        "Not Added"
                                    )}
                                </strong>

                            </div>


                            <div class="student-detail-item">

                                <span class="detail-label">
                                    Username
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        student.username ||
                                        "Not Added"
                                    )}
                                </strong>

                            </div>


                            <div class="student-detail-item">

                                <span class="detail-label">
                                    Books Issued
                                </span>

                                <strong>
                                    ${booksIssued}
                                </strong>

                            </div>


                            <div class="student-detail-item">

                                <span class="detail-label">
                                    Account Status
                                </span>

                                <strong>
                                    ${escapeHTML(status)}
                                </strong>

                            </div>

                        </div>

                    </div>


                    <div class="student-modal-actions">

                        <button
                            type="button"
                            id="closeViewStudent"
                            class="student-cancel-btn">
                            Close
                        </button>

                    </div>

                </div>

            </div>

        `;


        document.body.appendChild(modal);


        document
            .getElementById(
                "closeViewStudentModal"
            )
            .addEventListener(
                "click",
                function () {

                    modal.remove();

                }
            );


        document
            .getElementById(
                "closeViewStudent"
            )
            .addEventListener(
                "click",
                function () {

                    modal.remove();

                }
            );


        modal
            .querySelector(
                ".student-modal-overlay"
            )
            .addEventListener(
                "click",
                function (event) {

                    if (
                        event.target ===
                        event.currentTarget
                    ) {

                        modal.remove();

                    }

                }
            );


    } catch (error) {

        console.error(
            "View Student Error:",
            error
        );


        alert(
            "Unable to load student details."
        );

    }

}

/* =========================================================
   EDIT STUDENT
========================================================= */

async function editStudent(studentId) {

    const adminToken =
        localStorage.getItem("adminToken");

    if (!adminToken) {
        alert("Admin session expired. Please login again.");
        return;
    }

    if (!studentId) {
        alert("Student ID not found.");
        return;
    }

    let student;

    try {

        const response =
            await fetch(
               API_BASE_URL + "/api/admin/students/" +
                encodeURIComponent(studentId),
                {
                    method: "GET",
                    headers: {
                        "Authorization":
                            "Bearer " + adminToken
                    }
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            alert(
                data.message ||
                "Unable to load student."
            );

            return;
        }

        student = data.student;

    } catch (error) {

        console.error(
            "Load Student For Edit Error:",
            error
        );

        alert(
            "Unable to connect to the server."
        );

        return;
    }


    const oldModal =
        document.getElementById(
            "editStudentModal"
        );

    if (oldModal) {
        oldModal.remove();
    }


    const modal =
        document.createElement("div");

    modal.id =
        "editStudentModal";


    modal.innerHTML = `

        <div class="student-modal-overlay">

            <div class="student-modal">

                <div class="student-modal-header">

                    <div>

                        <h2>
                            Edit Student
                        </h2>

                        <p>
                            Update student account details
                        </p>

                    </div>

                    <button
                        type="button"
                        class="student-modal-close"
                        id="closeEditStudentModal">
                        ×
                    </button>

                </div>


                <form id="editStudentForm">

                    <div class="student-form-grid">

                        <div class="student-form-group">

                            <label>
                                Full Name
                            </label>

                            <input
                                type="text"
                                id="editStudentName"
                                value="${escapeHTML(
                                    student.fullName || ""
                                )}"
                                required>

                        </div>


                        <div class="student-form-group">

                            <label>
                                Username
                            </label>

                            <input
                                type="text"
                                value="${escapeHTML(
                                    student.username || ""
                                )}"
                                disabled>

                        </div>


                        <div class="student-form-group">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                id="editStudentEmail"
                                value="${escapeHTML(
                                    student.email || ""
                                )}"
                                required>

                        </div>


                        <div class="student-form-group">

                            <label>
                                Course
                            </label>

                            <input
                                type="text"
                                id="editStudentCourse"
                                value="${escapeHTML(
                                    student.course || ""
                                )}"
                                required>

                        </div>


                        <div class="student-form-group">

                            <label>
                                Student ID
                            </label>

                            <input
                                type="text"
                                value="${escapeHTML(
                                    student.studentId || ""
                                )}"
                                disabled>

                        </div>


                        <div class="student-form-group">

                            <label>
                                Account Status
                            </label>

                            <select
                                id="editStudentStatus">

                                <option
                                    value="Active"
                                    ${
                                        student.status === "Active"
                                            ? "selected"
                                            : ""
                                    }>
                                    Active
                                </option>

                                <option
                                    value="Inactive"
                                    ${
                                        student.status === "Inactive"
                                            ? "selected"
                                            : ""
                                    }>
                                    Inactive
                                </option>

                            </select>

                        </div>

                    </div>


                    <div class="student-modal-actions">

                        <button
                            type="button"
                            id="cancelEditStudent"
                            class="student-cancel-btn">
                            Cancel
                        </button>

                        <button
                            type="submit"
                            class="student-create-btn">
                            Save Changes
                        </button>

                    </div>

                </form>

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    document
        .getElementById("closeEditStudentModal")
        .addEventListener(
            "click",
            function () {
                modal.remove();
            }
        );


    document
        .getElementById("cancelEditStudent")
        .addEventListener(
            "click",
            function () {
                modal.remove();
            }
        );


    modal
        .querySelector(".student-modal-overlay")
        .addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    event.currentTarget
                ) {
                    modal.remove();
                }

            }
        );


    document
        .getElementById("editStudentForm")
        .addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const newName =
                    document
                        .getElementById(
                            "editStudentName"
                        )
                        .value
                        .trim();


                const newEmail =
                    document
                        .getElementById(
                            "editStudentEmail"
                        )
                        .value
                        .trim();


                const newCourse =
                    document
                        .getElementById(
                            "editStudentCourse"
                        )
                        .value
                        .trim();


                const newStatus =
                    document
                        .getElementById(
                            "editStudentStatus"
                        )
                        .value;


                if (
                    !newName ||
                    !newEmail ||
                    !newCourse
                ) {

                    alert(
                        "Please fill all required fields."
                    );

                    return;
                }


                try {

                    const response =
                        await fetch(
                            API_BASE_URL + "/api/admin/students/" +
                            encodeURIComponent(
                                student.studentId
                            ),
                            {
                                method: "PUT",

                                headers: {

                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        "Bearer " +
                                        adminToken

                                },

                                body:
                                    JSON.stringify({

                                        fullName:
                                            newName,

                                        email:
                                            newEmail,

                                        course:
                                            newCourse,

                                        status:
                                            newStatus

                                    })

                            }
                        );


                    const data =
                        await response.json();


                    console.log(
                        "UPDATE STUDENT RESPONSE:",
                        data
                    );


                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        alert(
                            data.message ||
                            "Unable to update student."
                        );

                        return;
                    }


                    alert(
                        "Student details updated successfully!"
                    );


                    modal.remove();

                    currentPage = 1;

                    await loadStudents();


                } catch (error) {

                    console.error(
                        "Update Student Error:",
                        error
                    );

                    alert(
                        "Unable to connect to the server."
                    );

                }

            }
        );

}


/* =========================================================
   DELETE STUDENT
========================================================= */

async function deleteStudent(studentId) {

    if (!studentId) {

        alert(
            "Student ID not found."
        );

        return;

    }


    const confirmDelete =
        confirm(
            "Are you sure you want to delete this student?"
        );


    if (!confirmDelete) {
        return;
    }


    const adminToken =
        getAdminToken();


    if (!adminToken) {

        alert(
            "Admin session expired. Please login again."
        );

        return;

    }


    try {

        const response =
            await fetch(
                API_BASE +
                "/" +
                encodeURIComponent(
                    studentId
                ),
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            "Bearer " +
                            adminToken
                    }
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            alert(
                data.message ||
                "Unable to delete student."
            );

            return;

        }


        await loadStudents();


        alert(
            "Student deleted successfully."
        );


    } catch (error) {

        console.error(
            "Delete Student Error:",
            error
        );


        alert(
            "Unable to connect to the server."
        );

    }

}


/* =========================================================
   STUDENT STATISTICS
========================================================= */

function updateStudentStats(students) {

    const statCards =
        document.querySelectorAll(
            ".stat-card"
        );


    if (statCards.length < 4) {
        return;
    }


    const total =
        students.length;


    const active =
        students.filter(
            function (student) {

                return String(
                    student.status || "Active"
                ).toLowerCase()
                ===
                "active";

            }
        ).length;


    const inactive =
        students.filter(
            function (student) {

                return String(
                    student.status || "Active"
                ).toLowerCase()
                ===
                "inactive";

            }
        ).length;


    let booksIssued = 0;


    students.forEach(
        function (student) {

            booksIssued +=
                Number(
                    student.booksIssued || 0
                );

        }
    );


    const totalElement =
        statCards[0]
            .querySelector("h3");


    const activeElement =
        statCards[1]
            .querySelector("h3");


    const booksElement =
        statCards[2]
            .querySelector("h3");


    const inactiveElement =
        statCards[3]
            .querySelector("h3");


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (activeElement) {

        activeElement.textContent =
            active;

    }


    if (booksElement) {

        booksElement.textContent =
            booksIssued;

    }


    if (inactiveElement) {

        inactiveElement.textContent =
            inactive;

    }

}


/* =========================================================
   GET INITIALS
========================================================= */

function getInitials(name) {

    if (!name) {
        return "ST";
    }


    const words =
        name
            .trim()
            .split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function openNotifications() {

    const oldPanel =
        document.getElementById(
            "notificationPanel"
        );


    if (oldPanel) {

        oldPanel.remove();

        return;

    }


    const panel =
        document.createElement(
            "div"
        );


    panel.id =
        "notificationPanel";


    panel.innerHTML = `

        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:15px;
        ">

            <strong style="
                font-size:18px;
                color:#1e293b;
            ">
                🔔 Notifications
            </strong>


            <button
                type="button"
                id="closeNotificationBtn"
                style="
                    border:none;
                    background:#f1f5f9;
                    border-radius:6px;
                    padding:5px 9px;
                    cursor:pointer;
                    font-size:18px;
                ">
                ×
            </button>

        </div>


        <div style="
            padding:12px;
            background:#f8fafc;
            border-radius:8px;
            margin-bottom:10px;
        ">

            📚 <strong>Library System</strong>

            <p style="
                margin:5px 0 0;
                color:#64748b;
                font-size:13px;
            ">
                Library management system is active.
            </p>

        </div>


        <div style="
            padding:12px;
            background:#f8fafc;
            border-radius:8px;
        ">

            👨‍🎓 <strong>Student Management</strong>

            <p style="
                margin:5px 0 0;
                color:#64748b;
                font-size:13px;
            ">
                You can manage registered students.
            </p>

        </div>


        <button
            type="button"
            id="closeNotificationBottom"
            style="
                width:100%;
                margin-top:15px;
                padding:10px;
                border:none;
                border-radius:7px;
                background:#1769ff;
                color:white;
                cursor:pointer;
                font-weight:600;
            ">
            Close
        </button>

    `;


    panel.style.position = "fixed";
    panel.style.top = "75px";
    panel.style.right = "25px";
    panel.style.width = "340px";
    panel.style.padding = "20px";
    panel.style.background = "white";
    panel.style.border = "1px solid #e5e7eb";
    panel.style.borderRadius = "14px";
    panel.style.boxShadow =
        "0 20px 50px rgba(0,0,0,0.18)";
    panel.style.zIndex = "999999";
    panel.style.fontFamily =
        '"Segoe UI", Arial, sans-serif';


    document.body.appendChild(panel);


    document
        .getElementById(
            "closeNotificationBtn"
        )
        .addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                panel.remove();

            }
        );


    document
        .getElementById(
            "closeNotificationBottom"
        )
        .addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                panel.remove();

            }
        );


    panel.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

        }
    );

}


/* =========================================================
   ADMIN PROFILE MENU
========================================================= */

function toggleAdminMenu(event) {

    event.stopPropagation();


    const oldPopup =
        document.getElementById(
            "adminProfilePopup"
        );


    if (oldPopup) {

        oldPopup.remove();

        return;

    }


    const popup =
        document.createElement(
            "div"
        );


    popup.id =
        "adminProfilePopup";


    popup.className =
        "header-popup admin-popup";


    popup.innerHTML = `

        <div class="admin-popup-profile">

            <div class="admin-big-avatar">
                A
            </div>

            <div>

                <strong>
                    Admin
                </strong>

                <small>
                    Library Administrator
                </small>

            </div>

        </div>


        <div class="popup-divider"></div>


        <button
            class="admin-menu-item"
            type="button"
            id="adminProfileBtn">

            <span>👤</span>

            <div>

                <strong>
                    My Profile
                </strong>

                <small>
                    View administrator profile
                </small>

            </div>

        </button>


        <button
            class="admin-menu-item"
            type="button"
            id="adminSettingsBtn">

            <span>⚙️</span>

            <div>

                <strong>
                    Settings
                </strong>

                <small>
                    Manage system settings
                </small>

            </div>

        </button>


        <div class="popup-divider"></div>


        <button
            class="admin-menu-item logout-menu"
            type="button"
            id="adminLogoutBtn">

            <span>🚪</span>

            <div>

                <strong>
                    Logout
                </strong>

                <small>
                    Sign out of admin account
                </small>

            </div>

        </button>

    `;


    document.body.appendChild(
        popup
    );


    document
        .getElementById(
            "adminProfileBtn"
        )
        .addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                adminProfile();

            }
        );


    document
        .getElementById(
            "adminSettingsBtn"
        )
        .addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                adminSettings();

            }
        );


    document
        .getElementById(
            "adminLogoutBtn"
        )
        .addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                adminLogout();

            }
        );

}


/* =========================================================
   CLOSE HEADER POPUPS
========================================================= */

function closeHeaderPopups() {

    const notification =
        document.getElementById(
            "notificationPanel"
        );


    const profile =
        document.getElementById(
            "adminProfilePopup"
        );


    if (notification) {
        notification.remove();
    }


    if (profile) {
        profile.remove();
    }

}


/* =========================================================
   ADMIN PROFILE
========================================================= */

function adminProfile() {

    closeHeaderPopups();


    alert(
        "Admin Profile\n\n" +
        "Name: Admin\n" +
        "Role: Library Administrator"
    );

}


/* =========================================================
   ADMIN SETTINGS
========================================================= */

function adminSettings() {

    closeHeaderPopups();

    window.location.href =
        "settings.html";

}


/* =========================================================
   ADMIN LOGOUT
========================================================= */

function adminLogout() {

    const confirmLogout =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmLogout) {
        return;
    }


    localStorage.removeItem(
        "adminToken"
    );


    localStorage.removeItem(
        "loggedInUser"
    );


    window.location.href =
        "index.html";

}


/* =========================================================
   LOAD LOGGED-IN ADMIN
========================================================= */

function loadLoggedInAdmin() {

    try {

        const loggedInUser =
            JSON.parse(
                localStorage.getItem(
                    "loggedInUser"
                )
            );


        if (!loggedInUser) {
            return;
        }


        const adminName =
            loggedInUser.name ||
            loggedInUser.fullName ||
            loggedInUser.username ||
            "Admin";


        const adminNameElement =
            document.getElementById(
                "adminName"
            );


        const adminAvatarElement =
            document.getElementById(
                "adminAvatar"
            );


        if (adminNameElement) {

            adminNameElement.textContent =
                adminName;

        }


        if (adminAvatarElement) {

            adminAvatarElement.textContent =
                adminName
                    .trim()
                    .charAt(0)
                    .toUpperCase();

        }

    } catch (error) {

        console.error(
            "Admin profile load error:",
            error
        );

    }

}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function toggleSidebar() {

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (!sidebar) {

        alert(
            "Sidebar nahi mila!"
        );

        return;

    }


    sidebar.classList.toggle(
        "sidebar-open"
    );

}


/* =========================================================
   CLOSE SIDEBAR ON NAV LINK
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const navLink =
            event.target.closest(
                ".nav-link"
            );


        const sidebar =
            document.querySelector(
                ".sidebar"
            );


        if (
            navLink &&
            sidebar &&
            window.innerWidth <= 768
        ) {

            sidebar.classList.remove(
                "sidebar-open"
            );

        }

    }
);


/* =========================================================
   PAGINATION
========================================================= */

function updatePagination(
    totalStudents
) {

    const pagination =
        document.querySelector(
            ".pagination"
        );


    if (!pagination) {
        return;
    }


    const paginationInfo =
        pagination.querySelector(
            "#paginationInfo"
        );


    const paginationButtons =
        pagination.querySelector(
            "#paginationButtons"
        );


    if (
        !paginationInfo ||
        !paginationButtons
    ) {

        return;

    }


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                totalStudents /
                studentsPerPage
            )
        );


    if (
        currentPage >
        totalPages
    ) {

        currentPage =
            totalPages;

    }


    const start =
        totalStudents === 0
            ? 0
            : (
                (currentPage - 1) *
                studentsPerPage
            ) + 1;


    const end =
        totalStudents === 0
            ? 0
            : Math.min(
                currentPage *
                studentsPerPage,
                totalStudents
            );


    paginationInfo.textContent =
        `Showing ${start}–${end} of ${totalStudents} students`;


    paginationButtons.innerHTML =
        "";


    function createButton(
        text,
        page,
        disabled,
        active
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.textContent =
            text;


        button.disabled =
            disabled;


        if (active) {

            button.classList.add(
                "current"
            );

        }


        if (!disabled) {

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();


                    currentPage =
                        page;


                    loadStudents();

                }
            );

        }


        return button;

    }


    paginationButtons.appendChild(
        createButton(
            "‹",
            currentPage - 1,
            currentPage === 1,
            false
        )
    );


    const maxVisiblePages =
        5;


    let startPage =
        Math.max(
            1,
            currentPage - 2
        );


    let endPage =
        Math.min(
            totalPages,
            startPage +
            maxVisiblePages -
            1
        );


    if (
        endPage -
        startPage +
        1 <
        maxVisiblePages
    ) {

        startPage =
            Math.max(
                1,
                endPage -
                maxVisiblePages +
                1
            );

    }


    for (
        let page = startPage;
        page <= endPage;
        page++
    ) {

        paginationButtons.appendChild(
            createButton(
                String(page),
                page,
                false,
                page === currentPage
            )
        );

    }


    paginationButtons.appendChild(
        createButton(
            "›",
            currentPage + 1,
            currentPage === totalPages,
            false
        )
    );

}