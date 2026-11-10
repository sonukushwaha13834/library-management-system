// /* =========================================================
//    ISSUE BOOK - JavaScript
//    ========================================================= */


// /* ---------------------------------------------------------
//    BOOK DATA
//    Same books currently available in books.html
// --------------------------------------------------------- */
// const API_URL = "http://localhost:5000";

// const adminToken =
//     localStorage.getItem("adminToken");

// const loggedInUser =
//     JSON.parse(localStorage.getItem("loggedInUser"));

// let adminStudents = [];

// const books = [
//     {
//         id: "978-0072465631",
//         title: "Database Management System",
//         short: "DBMS",
//         isbn: "978-0072465631",
//         category: "Database",
//         author: "Korth",
//         copies: 25
//     },

//     {
//         id: "978-1260440218",
//         title: "Java Programming",
//         short: "Programming",
//         isbn: "978-1260440218",
//         category: "Programming",
//         author: "Herbert Schildt",
//         copies: 18
//     },

//     {
//         id: "978-1119456339",
//         title: "Operating Systems",
//         short: "Computer Science",
//         isbn: "978-1119456339",
//         category: "Computer Science",
//         author: "William Stallings",
//         copies: 12
//     },

//     {
//         id: "978-0132126953",
//         title: "Computer Networks",
//         short: "Networking",
//         isbn: "978-0132126953",
//         category: "Networking",
//         author: "Andrew Tanenbaum",
//         copies: 20
//     },

//     {
//         id: "978-0134494166",
//         title: "Data Structures",
//         short: "Computer Science",
//         isbn: "978-0134494166",
//         category: "Computer Science",
//         author: "Mark Allen Weiss",
//         copies: 15
//     }
// ];


// /* ---------------------------------------------------------
//    PAGE LOAD
// --------------------------------------------------------- */

// document.addEventListener("DOMContentLoaded", function () {

//     loadStudents();

//     loadBooks();

//     setDefaultDates();

//     loadTodayStats();

//     loadRecentIssues();

//     setupEvents();

// });


// /* ---------------------------------------------------------
//    LOCAL STORAGE
// --------------------------------------------------------- */

// function getUsers() {

//     try {

//         return JSON.parse(
//             localStorage.getItem("libraryUsers")
//         ) || [];

//     } catch (error) {

//         return [];

//     }

// }


// function getRequests() {

//     try {

//         return JSON.parse(
//             localStorage.getItem("bookRequests")
//         ) || [];

//     } catch (error) {

//         return [];

//     }

// }

// /* ---------------------------------------------------------
//    LOAD STUDENTS FROM BACKEND
// --------------------------------------------------------- */

// async function loadStudents() {

//     const studentSelect =
//         document.getElementById("studentSelect");

//     if (!studentSelect) return;


//     studentSelect.innerHTML = `
//         <option value="">Select Student</option>
//     `;


//     try {

//         const response =
//             await fetch(
//                 API_URL + "/api/admin/students",
//                 {
//                     method: "GET",

//                     headers: {
//                         "Authorization":
//                             "Bearer " + adminToken
//                     }
//                 }
//             );


//         const data =
//             await response.json();


//         if (!response.ok || !data.success) {

//             console.error(
//                 "Students Load Error:",
//                 data
//             );

//             studentSelect.innerHTML += `
//                 <option value="" disabled>
//                     Unable to load students
//                 </option>
//             `;

//             return;
//         }


//         adminStudents =
//             Array.isArray(data.students)
//                 ? data.students
//                 : [];


//         console.log(
//             "Students from backend:",
//             adminStudents
//         );


//         if (adminStudents.length === 0) {

//             studentSelect.innerHTML += `
//                 <option value="" disabled>
//                     No students registered
//                 </option>
//             `;

//             return;
//         }


//         adminStudents.forEach(function (student, index) {

//             const option =
//                 document.createElement("option");


//             const studentId =
//                 student.studentId ||
//                 student.id ||
//                 student._id ||
//                 student.username ||
//                 `STU${String(index + 1).padStart(3, "0")}`;


//             option.value =
//                 studentId;


//             option.textContent =
//                 `${studentId} - ${
//                     student.fullName ||
//                     student.name ||
//                     student.username ||
//                     "Student"
//                 }`;


//             studentSelect.appendChild(option);

//         });


//     } catch (error) {

//         console.error(
//             "Students Request Error:",
//             error
//         );


//         studentSelect.innerHTML += `
//             <option value="" disabled>
//                 Unable to connect to server
//             </option>
//         `;

//     }

// }


// /* ---------------------------------------------------------
//    LOAD BOOKS
// --------------------------------------------------------- */

// function loadBooks() {

//     const bookSelect =
//         document.getElementById("bookSelect");

//     if (!bookSelect) return;


//     bookSelect.innerHTML = `
//         <option value="">Select Book</option>
//     `;


//     books.forEach(function (book) {

//         const option =
//             document.createElement("option");

//         option.value = book.id;

//         option.textContent =
//             `${book.title} - ${book.author}`;

//         bookSelect.appendChild(option);

//     });

// }


// /* ---------------------------------------------------------
//    DEFAULT DATES
// --------------------------------------------------------- */

// function formatDateForInput(date) {

//     const year = date.getFullYear();

//     const month =
//         String(date.getMonth() + 1).padStart(2, "0");

//     const day =
//         String(date.getDate()).padStart(2, "0");


//     return `${year}-${month}-${day}`;

// }


// function setDefaultDates() {

//     const issueDate =
//         document.getElementById("issueDate");

//     const dueDate =
//         document.getElementById("dueDate");


//     if (!issueDate || !dueDate) return;


//     const today = new Date();


//     const due = new Date(today);

//     due.setDate(due.getDate() + 14);


//     issueDate.value =
//         formatDateForInput(today);

//     dueDate.value =
//         formatDateForInput(due);


//     dueDate.min =
//         formatDateForInput(today);

// }


// /* ---------------------------------------------------------
//    STUDENT SELECTION
// --------------------------------------------------------- */

// function showStudentPreview(studentId) {

//     const preview =
//         document.getElementById("studentPreview");

//     if (!preview) return;

//     const student =
//     adminStudents.find(function (user) {

//         const id =
//             user.studentId ||
//             user.id ||
//             user._id ||
//             user.username;

//         return String(id) === String(studentId);

//     });




//     if (!student) {

//         preview.style.display = "none";

//         return;

//     }


//     const studentName =
//         student.fullName ||
//         student.name ||
//         student.username ||
//         "Student";


//     const studentCourse =
//         student.course ||
//         student.program ||
//         "Student";


//     const requests =
//         getRequests();


//     const activeBooks =
//         requests.filter(function (request) {

//             const requestStudentId =
//                 request.studentId ||
//                 request.userId ||
//                 request.username;


//             return (
//                 String(requestStudentId) ===
//                 String(studentId)
//                 &&
//                 request.status === "Approved"
//             );

//         }).length;


//     const avatar =
//         preview.querySelector(".preview-avatar");

//     const details =
//         preview.querySelector(".preview-details");

//     const limit =
//         preview.querySelector(".book-limit strong");


//     if (avatar) {

//         avatar.textContent =
//             getInitials(studentName);

//     }


//     if (details) {

//         details.innerHTML = `
//             <strong>${escapeHTML(studentName)}</strong>
//             <span>${escapeHTML(studentId)} · ${escapeHTML(studentCourse)}</span>
//         `;

//     }


//     if (limit) {

//         limit.textContent =
//             `${activeBooks} / 5`;

//     }


//     preview.style.display = "flex";

// }


// /* ---------------------------------------------------------
//    BOOK SELECTION
// --------------------------------------------------------- */

// function showBookPreview(bookId) {

//     const preview =
//         document.getElementById("bookPreview");

//     if (!preview) return;


//     const book =
//         books.find(function (item) {

//             return item.id === bookId;

//         });


//     if (!book) {

//         preview.style.display = "none";

//         return;

//     }


//     const available =
//         getAvailableCopies(book);


//     const cover =
//         preview.querySelector(".book-cover");

//     const details =
//         preview.querySelector(".preview-details");

//     const availability =
//         preview.querySelector(".availability strong");


//     if (cover) {

//         cover.textContent = "📖";

//     }


//     if (details) {

//         details.innerHTML = `
//             <strong>${escapeHTML(book.title)}</strong>
//             <span>${escapeHTML(book.author)} · ${escapeHTML(book.category)}</span>
//             <small>ISBN ${escapeHTML(book.isbn)}</small>
//         `;

//     }


//     if (availability) {

//         availability.textContent =
//             available;

//     }


//     preview.style.display = "flex";

// }


// /* ---------------------------------------------------------
//    AVAILABLE COPIES
// --------------------------------------------------------- */

// function getAvailableCopies(book) {

//     const requests =
//         getRequests();


//     const issuedCopies =
//         requests.filter(function (request) {

//             const requestBookId =
//                 request.bookId ||
//                 request.isbn;


//             return (
//                 String(requestBookId) ===
//                 String(book.id)
//                 &&
//                 request.status === "Approved"
//             );

//         }).length;


//     return Math.max(
//         0,
//         book.copies - issuedCopies
//     );

// }


// /* ---------------------------------------------------------
//    ISSUE BOOK
// --------------------------------------------------------- */

// function issueBook() {

//     const studentSelect =
//         document.getElementById("studentSelect");

//     const bookSelect =
//         document.getElementById("bookSelect");

//     const issueDateInput =
//         document.getElementById("issueDate");

//     const dueDateInput =
//         document.getElementById("dueDate");


//     const studentId =
//         studentSelect.value;

//     const bookId =
//         bookSelect.value;

//     const issueDate =
//         issueDateInput.value;

//     const dueDate =
//         dueDateInput.value;


//     /* Basic validation */

//     if (!studentId) {

//         alert("Please select a student.");

//         return;

//     }


//     if (!bookId) {

//         alert("Please select a book.");

//         return;

//     }


//     if (!issueDate) {

//         alert("Please select the issue date.");

//         return;

//     }


//     if (!dueDate) {

//         alert("Please select the due date.");

//         return;

//     }


//     /* Due date validation */

//     if (dueDate < issueDate) {

//         alert(
//             "Due date cannot be before the issue date."
//         );

//         return;

//     }


//     const users =
//         getUsers();


//     const student =
//         adminstudents.find(function (user) {

//             const id =
//                 user.studentId ||
//                 user.id ||
//                 user.username;

//             return String(id) ===
//                 String(studentId);

//         });


//     if (!student) {

//         alert("Student not found.");

//         return;

//     }


//     const book =
//         books.find(function (item) {

//             return item.id === bookId;

//         });


//     if (!book) {

//         alert("Book not found.");

//         return;

//     }


//     const requests =
//         getRequests();


//     /* -----------------------------------------------------
//        CHECK 5 BOOK LIMIT
//     ----------------------------------------------------- */

//     const activeBooks =
//         requests.filter(function (request) {

//             const requestStudentId =
//                 request.studentId ||
//                 request.userId ||
//                 request.username;


//             return (
//                 String(requestStudentId) ===
//                 String(studentId)
//                 &&
//                 request.status === "Approved"
//             );

//         });


//     if (activeBooks.length >= 5) {

//         alert(
//             "This student already has 5 active books."
//         );

//         return;

//     }


//     /* -----------------------------------------------------
//        CHECK DUPLICATE ACTIVE BOOK
//     ----------------------------------------------------- */

//     const alreadyIssued =
//         requests.some(function (request) {

//             const requestStudentId =
//                 request.studentId ||
//                 request.userId ||
//                 request.username;

//             const requestBookId =
//                 request.bookId ||
//                 request.isbn;


//             return (
//                 String(requestStudentId) ===
//                 String(studentId)
//                 &&
//                 String(requestBookId) ===
//                 String(bookId)
//                 &&
//                 request.status === "Approved"
//             );

//         });


//     if (alreadyIssued) {

//         alert(
//             "This book is already issued to this student."
//         );

//         return;

//     }


//     /* -----------------------------------------------------
//        CHECK BOOK AVAILABILITY
//     ----------------------------------------------------- */

//     const available =
//         getAvailableCopies(book);


//     if (available <= 0) {

//         alert(
//             `"${book.title}" is currently unavailable.`
//         );

//         return;

//     }


//     /* -----------------------------------------------------
//        STUDENT NAME
//     ----------------------------------------------------- */

//     const studentName =
//         student.fullName ||
//         student.name ||
//         student.username ||
//         "Student";


//     const studentCourse =
//         student.course ||
//         student.program ||
//         "";


//     /* -----------------------------------------------------
//        CREATE ISSUE RECORD
//     ----------------------------------------------------- */
// const newIssue = {

//     collegeId:
//         loggedInUser &&
//         loggedInUser.collegeId,

//     studentId: studentId,
//     studentName: studentName,
//     studentCourse: studentCourse,

//     bookId: book.id,
//     title: book.title,
//     author: book.author,
//     category: book.category,
//     isbn: book.isbn,

//     requestedDate: issueDate,
//     issueDate: issueDate,
//     dueDate: dueDate,

//     returnDate: "",
//     lateDays: 0,
//     fine: 0,

//     status: "Approved",
//     issuedBy: "Admin"
// };


//     requests.push(newIssue);


//     localStorage.setItem(
//         "bookRequests",
//         JSON.stringify(requests)
//     );


//     /* -----------------------------------------------------
//        SUCCESS
//     ----------------------------------------------------- */

//     alert(
//         `"${book.title}" has been issued to ${studentName}.`
//     );


//     /* Refresh page data */

//     loadStudents();

//     loadBooks();

//     showStudentPreview(studentId);

//     showBookPreview(bookId);

//     loadTodayStats();

//     loadRecentIssues();

// }


// /* ---------------------------------------------------------
//    EVENT SETUP
// --------------------------------------------------------- */

// function setupEvents() {

//     const studentSelect =
//         document.getElementById("studentSelect");

//     const bookSelect =
//         document.getElementById("bookSelect");

//     const issueForm =
//         document.getElementById("issueForm");

//     const cancelBtn =
//         document.getElementById("cancelBtn");

//     const issueDate =
//         document.getElementById("issueDate");

//     const dueDate =
//         document.getElementById("dueDate");


//     if (studentSelect) {

//         studentSelect.addEventListener(
//             "change",
//             function () {

//                 showStudentPreview(
//                     this.value
//                 );

//             }
//         );

//     }


//     if (bookSelect) {

//         bookSelect.addEventListener(
//             "change",
//             function () {

//                 showBookPreview(
//                     this.value
//                 );

//             }
//         );

//     }


//     if (issueForm) {

//         issueForm.addEventListener(
//             "submit",
//             function (event) {

//                 event.preventDefault();

//                 issueBook();

//             }
//         );

//     }


//     if (cancelBtn) {

//         cancelBtn.addEventListener(
//             "click",
//             function () {

//                 resetIssueForm();

//             }
//         );

//     }


//     if (issueDate && dueDate) {

//         issueDate.addEventListener(
//             "change",
//             function () {

//                 dueDate.min =
//                     this.value;


//                 if (
//                     dueDate.value &&
//                     dueDate.value < this.value
//                 ) {

//                     dueDate.value =
//                         this.value;

//                 }

//             }
//         );

//     }

// }


// /* ---------------------------------------------------------
//    RESET FORM
// --------------------------------------------------------- */

// function resetIssueForm() {

//     const form =
//         document.getElementById("issueForm");

//     const studentPreview =
//         document.getElementById("studentPreview");

//     const bookPreview =
//         document.getElementById("bookPreview");


//     if (form) {

//         form.reset();

//     }


//     if (studentPreview) {

//         studentPreview.style.display =
//             "none";

//     }


//     if (bookPreview) {

//         bookPreview.style.display =
//             "none";

//     }


//     setDefaultDates();

// }


// /* ---------------------------------------------------------
//    TODAY'S ISSUES
// --------------------------------------------------------- */

// function loadTodayStats() {

//     const todayNumber =
//         document.querySelector(".today-number");

//     if (!todayNumber) return;


//     const requests =
//         getRequests();


//     const today =
//         formatDateForInput(
//             new Date()
//         );


//     const todayIssues =
//         requests.filter(function (request) {

//             return (
//                 request.status === "Approved"
//                 &&
//                 request.issueDate === today
//             );

//         }).length;


//     todayNumber.textContent =
//         todayIssues;

// }


// /* ---------------------------------------------------------
//    RECENT ISSUES
// --------------------------------------------------------- */

// function loadRecentIssues() {

//     const container =
//         document.getElementById("recentIssues");

//     if (!container) return;


//     const requests =
//         getRequests();


//     const approvedIssues =
//         requests
//             .filter(function (request) {

//                 return request.status === "Approved";

//             })
//             .reverse()
//             .slice(0, 3);


//     if (approvedIssues.length === 0) {

//         container.innerHTML = `
//             <div class="empty-recent">
//                 No recent issues.
//             </div>
//         `;

//         return;

//     }


//     container.innerHTML = "";


//     approvedIssues.forEach(function (issue) {

//         const item =
//             document.createElement("div");

//         item.className =
//             "recent-issue-item";


//         item.innerHTML = `
//             <div class="recent-avatar">
//                 ${getInitials(issue.studentName || "S")}
//             </div>

//             <div class="recent-info">

//                 <strong>
//                     ${escapeHTML(issue.studentName || "Student")}
//                 </strong>

//                 <span>
//                     ${escapeHTML(issue.title || "Book")}
//                 </span>

//             </div>

//             <div class="recent-date">
//                 ${escapeHTML(issue.issueDate || "")}
//             </div>
//         `;


//         container.appendChild(item);

//     });

// }


// /* ---------------------------------------------------------
//    MOBILE SIDEBAR
// --------------------------------------------------------- */

// function toggleSidebar() {

//     const sidebar =
//         document.getElementById("sidebar");

//     if (!sidebar) return;


//     sidebar.classList.toggle("open");

// }


// /* ---------------------------------------------------------
//    ADMIN MENU
// --------------------------------------------------------- */

// function toggleAdminMenu(event) {

//     if (event) {

//         event.stopPropagation();

//     }


//     const menu =
//         document.getElementById("adminMenu");

//     if (!menu) return;


//     menu.classList.toggle("show");

// }


// /* Close admin menu when clicking elsewhere */

// document.addEventListener(
//     "click",
//     function (event) {

//         const menu =
//             document.getElementById("adminMenu");

//         const profile =
//             document.querySelector(".admin-profile");


//         if (
//             menu &&
//             profile &&
//             !profile.contains(event.target)
//         ) {

//             menu.classList.remove("show");

//         }

//     }
// );


// /* ---------------------------------------------------------
//    NOTIFICATIONS
// --------------------------------------------------------- */

// function openNotifications() {

//     const requests =
//         getRequests();


//     const pending =
//         requests.filter(function (request) {

//             return request.status === "Pending";

//         }).length;


//     if (pending > 0) {

//         alert(
//             `You have ${pending} pending book request${pending === 1 ? "" : "s"}.`
//         );

//     } else {

//         alert(
//             "No new notifications."
//         );

//     }

// }


// /* ---------------------------------------------------------
//    HELPERS
// --------------------------------------------------------- */

// function getInitials(name) {

//     if (!name) return "S";


//     const words =
//         String(name)
//             .trim()
//             .split(/\s+/);


//     if (words.length === 1) {

//         return words[0]
//             .substring(0, 2)
//             .toUpperCase();

//     }


//     return (
//         words[0][0] +
//         words[words.length - 1][0]
//     ).toUpperCase();

// }


// function escapeHTML(value) {

//     return String(value ?? "")
//         .replace(/&/g, "&amp;")
//         .replace(/</g, "&lt;")
//         .replace(/>/g, "&gt;")
//         .replace(/"/g, "&quot;")
//         .replace(/'/g, "&#039;");

// }


/* =========================================================
   ISSUE BOOK - JavaScript
   Backend Students + LocalStorage Book Issue System
   ========================================================= */


/* =========================================================
   ADMIN SESSION
========================================================= */

const API_URL = API_BASE_URL;

const adminToken =
    localStorage.getItem("adminToken");

const loggedInUser =
    JSON.parse(
        localStorage.getItem("loggedInUser")
    );

let adminStudents = [];
let adminBooks = [];


/* =========================================================
   BOOK DATA
========================================================= */

const books = [

    {
        id: "978-0072465631",
        title: "Database Management System",
        short: "DBMS",
        isbn: "978-0072465631",
        category: "Database",
        author: "Korth",
        copies: 25
    },

    {
        id: "978-1260440218",
        title: "Java Programming",
        short: "Programming",
        isbn: "978-1260440218",
        category: "Programming",
        author: "Herbert Schildt",
        copies: 18
    },

    {
        id: "978-1119456339",
        title: "Operating Systems",
        short: "Computer Science",
        isbn: "978-1119456339",
        category: "Computer Science",
        author: "William Stallings",
        copies: 12
    },

    {
        id: "978-0132126953",
        title: "Computer Networks",
        short: "Networking",
        isbn: "978-0132126953",
        category: "Networking",
        author: "Andrew Tanenbaum",
        copies: 20
    },

    {
        id: "978-0134494166",
        title: "Data Structures",
        short: "Computer Science",
        isbn: "978-0134494166",
        category: "Computer Science",
        author: "Mark Allen Weiss",
        copies: 15
    }

];


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadStudents();

        loadBooks();

        setDefaultDates();

        loadTodayStats();

        loadRecentIssues();

        setupEvents();

    }
);


/* =========================================================
   LOCAL STORAGE
========================================================= */

function getRequests() {

    try {

        return JSON.parse(
            localStorage.getItem("bookRequests")
        ) || [];

    } catch (error) {

        console.error(
            "Book Requests Parse Error:",
            error
        );

        return [];

    }

}


/* =========================================================
   LOAD STUDENTS FROM BACKEND
========================================================= */

async function loadStudents() {

    const studentSelect =
        document.getElementById(
            "studentSelect"
        );

    if (!studentSelect) {
        return;
    }


    /*
       Reset dropdown
    */

    studentSelect.innerHTML = `
        <option value="">
            Select Student
        </option>
    `;


    /*
       Check Admin Login
    */

    if (!adminToken) {

        studentSelect.innerHTML += `
            <option value="" disabled>
                Admin session expired
            </option>
        `;

        console.error(
            "Admin token not found."
        );

        return;

    }


    try {

        const response =
            await fetch(
                API_URL +
                "/api/admin/students",
                {
                    method: "GET",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            adminToken,

                        "Content-Type":
                            "application/json"

                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "Admin Students API Response:",
            data
        );


        if (
            !response.ok ||
            !data.success
        ) {

            console.error(
                "Students Load Error:",
                data
            );


            studentSelect.innerHTML += `
                <option value="" disabled>
                    Unable to load students
                </option>
            `;

            return;

        }


        /*
           Store backend students
        */

        adminStudents =
            Array.isArray(
                data.students
            )
                ? data.students
                : [];


        console.log(
            "Students for current college:",
            adminStudents
        );


        /*
           No students
        */

        if (
            adminStudents.length === 0
        ) {

            studentSelect.innerHTML += `
                <option value="" disabled>
                    No students registered
                </option>
            `;

            return;

        }


        /*
           Add students to dropdown
        */

        adminStudents.forEach(
            function (student, index) {

                const option =
                    document.createElement(
                        "option"
                    );


                /*
                   Student ID priority
                */

                const studentId =
                    student.studentId ||
                    student.id ||
                    student._id ||
                    student.username ||
                    `STU${String(
                        index + 1
                    ).padStart(3, "0")}`;


                /*
                   Student name
                */

                const studentName =
                    student.fullName ||
                    student.name ||
                    student.username ||
                    "Student";


                /*
                   Student course
                */

                const studentCourse =
                    student.course ||
                    student.program ||
                    "";


                option.value =
                    studentId;


                option.textContent =
                    studentCourse
                        ? `${studentId} - ${studentName} (${studentCourse})`
                        : `${studentId} - ${studentName}`;


                studentSelect.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "Students Request Error:",
            error
        );


        studentSelect.innerHTML += `
            <option value="" disabled>
                Unable to connect to server
            </option>
        `;

    }

}


/* =========================================================
   LOAD BOOKS
========================================================= */
// async function loadBooks() {
//     const bookSelect = document.getElementById("bookSelect");

//     if (!bookSelect) {
//         console.error("bookSelect element not found.");
//         return;
//     }

//     bookSelect.innerHTML = `
//         <option value="">Select Book</option>
//     `;

//     if (!adminToken) {
//         console.error("Admin token not found.");
//         bookSelect.innerHTML += `
//             <option value="" disabled>
//                 Admin session expired
//             </option>
//         `;
//         return;
//     }

//     try {
//         const response = await fetch(
//             API_URL + "/api/admin/books",
//             {
//                 method: "GET",
//                 headers: {
//                     "Authorization": "Bearer " + adminToken
//                 }
//             }
//         );

//         const data = await response.json();

//         console.log("Admin Books API Response:", data);

//         if (!response.ok || !data.success) {
//             console.error("Books Load Error:", data);

//             bookSelect.innerHTML += `
//                 <option value="" disabled>
//                     Unable to load books
//                 </option>
//             `;

//             return;
//         }

//         const backendBooks =
//             Array.isArray(data.books)
//                 ? data.books
//                 : [];
//                 adminBooks = backendBooks;

//         console.log(
//             "Books from backend:",
//             backendBooks
//         );

//         if (backendBooks.length === 0) {
//             bookSelect.innerHTML += `
//                 <option value="" disabled>
//                     No books available
//                 </option>
//             `;

//             return;
//         }

//         backendBooks.forEach(function (book) {

//             const bookId = book.bookId;

//             const title =
//                 book.title || "Unknown Book";

//             const author =
//                 book.author || "Unknown Author";

//             const availableCopies =
//                 Number(book.availableCopies || 0);

//             const option =
//                 document.createElement("option");

//             option.value = bookId;

//             option.textContent =
//                 `${title} - ${author} (${availableCopies} available)`;

//             bookSelect.appendChild(option);
//         });

//         console.log(
//             "Books added to dropdown:",
//             bookSelect.options.length - 1
//         );

//     } catch (error) {

//         console.error(
//             "Books Request Error:",
//             error
//         );

//         bookSelect.innerHTML += `
//             <option value="" disabled>
//                 Unable to connect to server
//             </option>
//         `;
//     }
// }

/* =========================================================
   LOAD BOOKS
========================================================= */
async function loadBooks() {

    const bookSelect =
        document.getElementById("bookSelect");

    if (!bookSelect) {
        console.error(
            "bookSelect element not found."
        );
        return;
    }

    if (!adminToken) {
        bookSelect.innerHTML = `
            <option value="">
                Admin session expired
            </option>
        `;
        return;
    }

    // Immediately show loading state
    bookSelect.innerHTML = `
        <option value="">
            Loading books...
        </option>
    `;

    try {

        const response =
            await fetch(
                API_URL +
                "/api/admin/books",
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

        console.log(
            "Admin Books API Response:",
            data
        );

        if (
            !response.ok ||
            !data.success
        ) {

            console.error(
                "Books Load Error:",
                data
            );

            bookSelect.innerHTML = `
                <option value="">
                    Unable to load books
                </option>
            `;

            return;
        }

        const backendBooks =
            Array.isArray(data.books)
                ? data.books
                : [];

        adminBooks =
            backendBooks;

        console.log(
            "Books from backend:",
            backendBooks
        );

        if (
            backendBooks.length === 0
        ) {

            bookSelect.innerHTML = `
                <option value="">
                    No books available
                </option>
            `;

            return;
        }

        // Clear loading option
        bookSelect.innerHTML = `
            <option value="">
                Select Book
            </option>
        `;

        // Add backend books
        backendBooks.forEach(
            function (book) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    book.bookId;

                const title =
                    book.title ||
                    "Unknown Book";

                const author =
                    book.author ||
                    "Unknown Author";

                const availableCopies =
                    Number(
                        book.availableCopies ||
                        0
                    );

                option.textContent =
                    `${title} - ${author} (${availableCopies} available)`;

                bookSelect.appendChild(
                    option
                );
            }
        );

        console.log(
            "Books added to dropdown:",
            backendBooks.length
        );

    } catch (error) {

        console.error(
            "Books Request Error:",
            error
        );

        bookSelect.innerHTML = `
            <option value="">
                Unable to connect to server
            </option>
        `;
    }
}
/* =========================================================
   DATE FUNCTIONS
========================================================= */

function formatDateForInput(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


function setDefaultDates() {

    const issueDate =
        document.getElementById(
            "issueDate"
        );

    const dueDate =
        document.getElementById(
            "dueDate"
        );


    if (
        !issueDate ||
        !dueDate
    ) {
        return;
    }


    const today =
        new Date();


    const due =
        new Date(
            today
        );


    due.setDate(
        due.getDate() + 14
    );


    issueDate.value =
        formatDateForInput(
            today
        );


    dueDate.value =
        formatDateForInput(
            due
        );


    dueDate.min =
        formatDateForInput(
            today
        );

}


/* =========================================================
   FIND STUDENT
========================================================= */

function findAdminStudent(studentId) {

    return adminStudents.find(
        function (student) {

            const id =
                student.studentId ||
                student.id ||
                student._id ||
                student.username;


            return (
                String(id) ===
                String(studentId)
            );

        }
    );

}

/* =========================================================
   STUDENT PREVIEW
========================================================= */

async function showStudentPreview(studentId) {

    const preview =
        document.getElementById("studentPreview");

    if (!preview) {
        return;
    }


    /* No student selected */

    if (!studentId) {

        preview.style.display = "none";

        return;

    }


    /* Find selected student */

    const student =
        findAdminStudent(studentId);


    if (!student) {

        preview.style.display = "none";

        return;

    }


    const studentName =
        student.fullName ||
        student.name ||
        student.username ||
        "Student";


    const studentCourse =
        student.course ||
        student.program ||
        "Student";


    /*
       =====================================================
       LOAD REAL ISSUED BOOKS FROM MONGODB
       =====================================================
    */

    let activeBooks = 0;


    if (adminToken) {

        try {

            const response =
                await fetch(
                    API_URL +
                    "/api/admin/book-requests",
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


            console.log(
                "Student Book Requests:",
                data
            );


            if (
                response.ok &&
                data.success &&
                Array.isArray(data.requests)
            ) {

                /*
                   Count only:

                   Same student
                   +
                   Status = Approved

                   Approved means currently
                   issued/active book.
                */

                activeBooks =
                    data.requests.filter(
                        function (request) {

                            const requestStudentId =
                                request.studentId ||
                                request.userId ||
                                request.username;


                            return (
                                String(
                                    requestStudentId
                                ) ===
                                String(studentId)
                                &&
                                request.status ===
                                "Approved"
                            );

                        }
                    ).length;

            }

        } catch (error) {

            console.error(
                "Student Books Load Error:",
                error
            );

            activeBooks = 0;

        }

    }


    /*
       =====================================================
       UPDATE EXISTING PREVIEW
       =====================================================
    */

    const avatar =
        preview.querySelector(
            ".preview-avatar"
        );


    const details =
        preview.querySelector(
            ".preview-details"
        );


    const limit =
        preview.querySelector(
            ".book-limit strong"
        );


    /* Avatar */

    if (avatar) {

        avatar.textContent =
            getInitials(
                studentName
            );

    }


    /* Student details */

    if (details) {

        details.innerHTML = `
            <strong>
                ${escapeHTML(studentName)}
            </strong>

            <span>
                ${escapeHTML(studentId)}
                ·
                ${escapeHTML(studentCourse)}
            </span>
        `;

    }


    /* Books count */

    if (limit) {

        limit.textContent =
            `${activeBooks} / 5`;

    }


    /*
       Show existing preview
    */

    preview.style.display =
        "flex";


    console.log(
        "Student:",
        studentName,
        "| Active Books:",
        activeBooks,
        "/ 5"
    );

}
/* =========================================================
   BOOK PREVIEW
========================================================= */
function showBookPreview(bookId) {

    const preview =
        document.getElementById("bookPreview");

    if (!preview) return;

    if (!bookId) {
        preview.innerHTML = "";
        return;
    }

    const book =
        adminBooks.find(function (item) {
            return item.bookId === bookId;
        });

    if (!book) {
        preview.innerHTML = `
            <div class="preview-error">
                📚 Book not found
            </div>
        `;
        return;
    }

    const availableCopies =
        Number(book.availableCopies || 0);

    preview.innerHTML = `
        <div class="book-preview-content">

            <div class="book-preview-icon">
                📖
            </div>

            <div class="book-preview-details">

                <h4>${escapeHTML(book.title || "Unknown Book")}</h4>

                <p>
                    <strong>Author:</strong>
                    ${escapeHTML(book.author || "Unknown Author")}
                </p>

                <p>
                    <strong>Category:</strong>
                    ${escapeHTML(book.category || "General")}
                </p>

                <p>
                    <strong>ISBN:</strong>
                    ${escapeHTML(book.isbn || "N/A")}
                </p>

                <p>
                    <strong>Available:</strong>
                    ${availableCopies} copies
                </p>

            </div>

        </div>
    `;
}


/* =========================================================
   AVAILABLE COPIES
========================================================= */
function getAvailableCopies(book) {

    if (!book) {
        return 0;
    }

    /*
       Backend already maintains the
       real available copy count.
    */

    const availableCopies =
        Number(book.availableCopies || 0);

    return Math.max(
        0,
        availableCopies
    );
}

/* =========================================================
   ISSUE BOOK
========================================================= */
/* =========================================================
   ISSUE BOOK
========================================================= */

async function issueBook() {

    const studentSelect =
        document.getElementById(
            "studentSelect"
        );

    const bookSelect =
        document.getElementById(
            "bookSelect"
        );

    const issueDateInput =
        document.getElementById(
            "issueDate"
        );

    const dueDateInput =
        document.getElementById(
            "dueDate"
        );


    if (
        !studentSelect ||
        !bookSelect ||
        !issueDateInput ||
        !dueDateInput
    ) {

        console.error(
            "Issue form elements not found."
        );

        return;

    }


    const studentId =
        studentSelect.value;

    const bookId =
        bookSelect.value;

    const issueDate =
        issueDateInput.value;

    const dueDate =
        dueDateInput.value;


    /* -----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (!studentId) {

        alert(
            "Please select a student."
        );

        return;

    }


    if (!bookId) {

        alert(
            "Please select a book."
        );

        return;

    }


    if (!issueDate) {

        alert(
            "Please select the issue date."
        );

        return;

    }


    if (!dueDate) {

        alert(
            "Please select the due date."
        );

        return;

    }


    if (dueDate < issueDate) {

        alert(
            "Due date cannot be before the issue date."
        );

        return;

    }


    /* -----------------------------------------
       FIND STUDENT
    ----------------------------------------- */

    const student =
        findAdminStudent(
            studentId
        );


    if (!student) {

        alert(
            "Student not found."
        );

        console.error(
            "Selected Student ID:",
            studentId
        );

        console.log(
            "Available Students:",
            adminStudents
        );

        return;

    }


    /* -----------------------------------------
       FIND BOOK
    ----------------------------------------- */

    const book =
        adminBooks.find(
            function (item) {

                return (
                    String(item.bookId) ===
                    String(bookId)
                );

            }
        );


    if (!book) {

        alert(
            "Book not found."
        );

        console.error(
            "Selected Book ID:",
            bookId
        );

        console.log(
            "Available Backend Books:",
            adminBooks
        );

        return;

    }


    /* -----------------------------------------
       CHECK BOOK AVAILABILITY
       Frontend quick check
    ----------------------------------------- */

    const available =
        Number(
            book.availableCopies || 0
        );


    if (available <= 0) {

        alert(
            `"${book.title}" is currently unavailable.`
        );

        return;

    }


    /* -----------------------------------------
       STUDENT DETAILS
    ----------------------------------------- */

    const studentName =
        student.fullName ||
        student.name ||
        student.username ||
        "Student";


    const studentUsername =
        student.username ||
        "";


    const studentEmail =
        student.email ||
        "";


    /* -----------------------------------------
       DISABLE BUTTON
       Prevent double-click
    ----------------------------------------- */

    const submitButton =
        document.querySelector(
            '#issueForm button[type="submit"]'
        );


    if (submitButton) {

        submitButton.disabled =
            true;

    }


    try {

        /* -----------------------------------------
           SEND ISSUE TO BACKEND
        ----------------------------------------- */

        const response =
            await fetch(
                API_URL +
                "/api/admin/issue-book",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " +
                            adminToken

                    },

                    body:
                        JSON.stringify({

                            studentId:
                                studentId,

                            bookId:
                                bookId,

                            studentName:
                                studentName,

                            studentUsername:
                                studentUsername,

                            studentEmail:
                                studentEmail,

                            issueDate:
                                issueDate,

                            dueDate:
                                dueDate

                        })

                }
            );


        const data =
            await response.json();


        console.log(
            "Issue Book API Response:",
            data
        );


        /* -----------------------------------------
           BACKEND ERROR
        ----------------------------------------- */

        if (
            !response.ok ||
            !data.success
        ) {

            alert(
                data.message ||
                "Unable to issue book."
            );

            return;

        }


        /* -----------------------------------------
           SUCCESS
        ----------------------------------------- */

        alert(
            `"${book.title}" has been issued to ${studentName}.`
        );


        /* -----------------------------------------
           REFRESH BACKEND DATA
        ----------------------------------------- */

        await loadStudents();

        await loadBooks();


        showStudentPreview(
            studentId
        );


        showBookPreview(
            bookId
        );


        loadTodayStats();

        loadRecentIssues();


    } catch (error) {

        console.error(
            "Issue Book Request Error:",
            error
        );

        alert(
            "Unable to connect to the server."
        );

    } finally {

        /* -----------------------------------------
           ENABLE BUTTON AGAIN
        ----------------------------------------- */

        if (submitButton) {

            submitButton.disabled =
                false;

        }

    }

}

/* =========================================================
   EVENT SETUP
========================================================= */

function setupEvents() {

    const studentSelect =
        document.getElementById(
            "studentSelect"
        );


    const bookSelect =
        document.getElementById(
            "bookSelect"
        );


    const issueForm =
        document.getElementById(
            "issueForm"
        );


    const cancelBtn =
        document.getElementById(
            "cancelBtn"
        );


    const issueDate =
        document.getElementById(
            "issueDate"
        );


    const dueDate =
        document.getElementById(
            "dueDate"
        );


    if (studentSelect) {

        studentSelect.addEventListener(
            "change",
            function () {

                showStudentPreview(
                    this.value
                );

            }
        );

    }


    if (bookSelect) {

        bookSelect.addEventListener(
            "change",
            function () {

                showBookPreview(
                    this.value
                );

            }
        );

    }


    if (issueForm) {

        issueForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                issueBook();

            }
        );

    }


    if (cancelBtn) {

        cancelBtn.addEventListener(
            "click",
            function () {

                resetIssueForm();

            }
        );

    }


    if (
        issueDate &&
        dueDate
    ) {

        issueDate.addEventListener(
            "change",
            function () {

                dueDate.min =
                    this.value;


                if (
                    dueDate.value &&
                    dueDate.value <
                    this.value
                ) {

                    dueDate.value =
                        this.value;

                }

            }
        );

    }

}


/* =========================================================
   RESET FORM
========================================================= */

function resetIssueForm() {

    const form =
        document.getElementById(
            "issueForm"
        );


    const studentPreview =
        document.getElementById(
            "studentPreview"
        );


    const bookPreview =
        document.getElementById(
            "bookPreview"
        );


    if (form) {

        form.reset();

    }


    if (studentPreview) {

        studentPreview.style.display =
            "none";

    }


    if (bookPreview) {

        bookPreview.style.display =
            "none";

    }


    setDefaultDates();

}


/* =========================================================
   TODAY'S ISSUES
========================================================= */
async function loadTodayStats() {

    const todayNumber =
        document.querySelector(
            ".today-number"
        );

    if (!todayNumber) {
        return;
    }


    if (!adminToken) {

        todayNumber.textContent = "0";

        return;

    }


    try {

        const response =
            await fetch(
                API_URL +
                "/api/admin/book-requests",
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

            console.error(
                "Today's Issues Load Error:",
                data
            );

            todayNumber.textContent = "0";

            return;

        }


        const requests =
            Array.isArray(data.requests)
                ? data.requests
                : [];


        const today =
            formatDateForInput(
                new Date()
            );


        const todayIssues =
            requests.filter(
                function (request) {

                    if (
                        request.status !==
                        "Approved"
                    ) {
                        return false;
                    }


                    /*
                       Backend uses issuedDate.
                    */

                    if (
                        !request.issuedDate
                    ) {
                        return false;
                    }


                    const issuedDate =
                        formatDateForInput(
                            new Date(
                                request.issuedDate
                            )
                        );


                    return (
                        issuedDate ===
                        today
                    );

                }
            ).length;


        todayNumber.textContent =
            todayIssues;


        console.log(
            "Today's Issues:",
            todayIssues
        );


    } catch (error) {

        console.error(
            "Today's Issues Request Error:",
            error
        );

        todayNumber.textContent =
            "0";

    }

}
/* =========================================================
   RECENT ISSUES
========================================================= */
async function loadRecentIssues() {

    const container =
        document.getElementById(
            "recentIssues"
        );


    if (!container) {
        return;
    }


    if (!adminToken) {

        container.innerHTML = `
            <div class="empty-recent">
                Unable to load recent issues.
            </div>
        `;

        return;

    }


    try {

        const response =
            await fetch(
                API_URL +
                "/api/admin/book-requests",
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

            console.error(
                "Recent Issues Load Error:",
                data
            );

            container.innerHTML = `
                <div class="empty-recent">
                    Unable to load recent issues.
                </div>
            `;

            return;

        }


        const requests =
            Array.isArray(data.requests)
                ? data.requests
                : [];


        /*
           Only currently issued books.
           Returned books are excluded.
        */

        const approvedIssues =
            requests
                .filter(
                    function (request) {

                        return (
                            request.status ===
                            "Approved"
                            &&
                            request.issuedDate
                        );

                    }
                )
                .sort(
                    function (a, b) {

                        return (
                            new Date(
                                b.issuedDate
                            ) -
                            new Date(
                                a.issuedDate
                            )
                        );

                    }
                )
                .slice(
                    0,
                    3
                );


        if (
            approvedIssues.length === 0
        ) {

            container.innerHTML = `
                <div class="empty-recent">
                    No recent issues.
                </div>
            `;

            return;

        }


        container.innerHTML = "";


        approvedIssues.forEach(
            function (issue) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "recent-issue-item";


                const studentName =
                    issue.studentName ||
                    "Student";


                const bookTitle =
                    issue.title ||
                    "Book";


                const issuedDate =
                    issue.issuedDate
                        ? formatDateForInput(
                            new Date(
                                issue.issuedDate
                            )
                        )
                        : "";


                item.innerHTML = `

                    <div class="recent-avatar">
                        ${getInitials(
                            studentName
                        )}
                    </div>

                    <div class="recent-info">

                        <strong>
                            ${escapeHTML(
                                studentName
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                bookTitle
                            )}
                        </span>

                    </div>

                    <div class="recent-date">
                        ${escapeHTML(
                            issuedDate
                        )}
                    </div>

                `;


                container.appendChild(
                    item
                );

            }
        );


        console.log(
            "Recent Issues:",
            approvedIssues
        );


    } catch (error) {

        console.error(
            "Recent Issues Request Error:",
            error
        );

        container.innerHTML = `
            <div class="empty-recent">
                Unable to connect to server.
            </div>
        `;

    }

}

/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function toggleSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    if (!sidebar) {
        return;
    }


    sidebar.classList.toggle(
        "open"
    );

}


/* =========================================================
   ADMIN MENU
========================================================= */

function toggleAdminMenu(event) {

    if (event) {
        event.stopPropagation();
    }


    const menu =
        document.getElementById(
            "adminMenu"
        );


    if (!menu) {
        return;
    }


    menu.classList.toggle(
        "show"
    );

}


document.addEventListener(
    "click",
    function (event) {

        const menu =
            document.getElementById(
                "adminMenu"
            );


        const profile =
            document.querySelector(
                ".admin-profile"
            );


        if (
            menu &&
            profile &&
            !profile.contains(
                event.target
            )
        ) {

            menu.classList.remove(
                "show"
            );

        }

    }
);


/* =========================================================
   NOTIFICATIONS
========================================================= */

function openNotifications() {

    const requests =
        getRequests();


    const pending =
        requests.filter(
            function (request) {

                return (
                    request.status ===
                    "Pending"
                );

            }
        ).length;


    if (pending > 0) {

        alert(
            `You have ${pending} pending book request${
                pending === 1
                    ? ""
                    : "s"
            }.`
        );

    } else {

        alert(
            "No new notifications."
        );

    }

}


/* =========================================================
   HELPERS
========================================================= */

function getInitials(name) {

    if (!name) {
        return "S";
    }


    const words =
        String(name)
            .trim()
            .split(/\s+/);


    if (
        words.length === 1
    ) {

        return words[0]
            .substring(
                0,
                2
            )
            .toUpperCase();

    }


    return (

        words[0][0] +

        words[
            words.length - 1
        ][0]

    ).toUpperCase();

}


function escapeHTML(value) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}

