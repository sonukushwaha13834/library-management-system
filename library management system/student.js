document.addEventListener("DOMContentLoaded", async function () {

    // ==========================================================
    // STUDENT TOKEN
    // ==========================================================

    const token = localStorage.getItem("studentToken");

    if (!token) {
        window.location.href = "index.html";
        return;
    }

    // ==========================================================
    // LOAD STUDENT PROFILE FROM BACKEND
    // ==========================================================

    try {

        const response = await fetch(
           `${API_BASE_URL}/api/student/me`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const data = await response.json();

      console.log(
    "Student profile:",
    JSON.stringify(data, null, 2)
);

        // ======================================================
        // AUTHENTICATION ERROR
        // ======================================================

        if (!response.ok || !data.success) {

            console.error(
                "Student profile error:",
                data.message
            );

            if (response.status === 401) {
                localStorage.removeItem("studentToken");
                localStorage.removeItem("loggedInStudent");
                localStorage.removeItem("loggedInUser");

                window.location.href = "index.html";
            }

            return;
        }

        // ======================================================
        // SAVE BACKEND DATA
        // ======================================================

        const student = data.student;
        const college = data.college;
        const admin = data.admin;

        localStorage.setItem(
            "loggedInStudent",
            JSON.stringify({
                ...data.student,
                college: data.college,
                admin: data.admin
            })
        );
        console.log("Student profile data:", student);

        // Keep compatibility with existing dashboard code
        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(student)
        );

        // ======================================================
        // STUDENT NAME
        // ======================================================

        const studentName =
            student.fullName ||
            student.username ||
            "Student";

        const welcomeHeading =
            document.querySelector(".welcome-text h2");

        if (welcomeHeading) {

            welcomeHeading.textContent =
                `Welcome back, ${studentName}! 👋`;
        }

        // ======================================================
        // PROFILE NAME
        // ======================================================

        const profileName =
            document.querySelector(".profile-info strong");

        if (profileName) {

            profileName.textContent =
                studentName;
        }

        // ======================================================
        // PROFILE AVATAR
        // ======================================================

        const avatar =
            document.querySelector(".profile-avatar");

        if (avatar) {

            avatar.textContent =
                studentName
                    .charAt(0)
                    .toUpperCase();
        }

        // ======================================================
        // COLLEGE INFORMATION
        // ======================================================

        const collegeNameElement =
            document.getElementById(
                "student-college-name"
            );

        const collegeIdElement =
            document.getElementById(
                "student-college-id"
            );

        if (college) {

            if (collegeNameElement) {
                collegeNameElement.textContent =
                    college.collegeName || "Not available";
            }

            if (collegeIdElement) {
                collegeIdElement.textContent =
                    college.collegeId || "Not available";
            }

        } else {

            if (collegeNameElement) {
                collegeNameElement.textContent =
                    "College information unavailable";
            }

            if (collegeIdElement) {
                collegeIdElement.textContent =
                    student.collegeId || "Not available";
            }
        }

        // ======================================================
        // ADMIN INFORMATION
        // ======================================================

        const adminNameElement =
            document.getElementById(
                "student-admin-name"
            );

        const adminEmailElement =
            document.getElementById(
                "student-admin-email"
            );

        if (admin) {

            if (adminNameElement) {

                adminNameElement.textContent =
                    admin.name || "Not available";
            }

            if (adminEmailElement) {

                adminEmailElement.textContent =
                    admin.email || "Not available";
            }

        } else {

            if (adminNameElement) {
                adminNameElement.textContent =
                    "Admin not assigned";
            }

            if (adminEmailElement) {
                adminEmailElement.textContent =
                    "Not available";
            }
        }

        // ======================================================
        // LOAD EXISTING STUDENT DASHBOARD DATA
        // ======================================================

        loadStudentDashboard(student);

    } catch (error) {

        console.error(
            "Student dashboard error:",
            error
        );
    }
});


// ==========================================================
// EXISTING DASHBOARD BOOK DATA
// ==========================================================


// ==========================================================
// LOAD STUDENT DASHBOARD DATA FROM BACKEND
// ==========================================================

async function loadStudentDashboard(loggedInUser) {

    const token =
        localStorage.getItem("studentToken");


    if (!token) {
        return;
    }


    try {

        // ==================================================
        // GET DASHBOARD STATS
        // ==================================================

        const response =
            await fetch(
               `${API_BASE_URL}/api/student/dashboard-stats`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        const data =
            await response.json();

            console.log(
    "Student dashboard stats:",
    JSON.stringify(data, null, 2)
);




        // ==================================================
        // AUTHENTICATION ERROR
        // ==================================================

        if (
            !response.ok ||
            !data.success
        ) {

            console.error(
                "Dashboard stats error:",
                data.message
            );


            if (
                response.status === 401
            ) {

                localStorage.removeItem(
                    "studentToken"
                );

                localStorage.removeItem(
                    "loggedInStudent"
                );

                localStorage.removeItem(
                    "loggedInUser"
                );

                window.location.href =
                    "index.html";
            }

            return;
        }


        const stats =
            data.stats;


        // ==================================================
        // STAT CARDS
        // ==================================================

        const statCards =
            document.querySelectorAll(
                ".stat-card"
            );


        if (
            statCards.length >= 4
        ) {

            // ----------------------------------------------
            // AVAILABLE BOOKS
            // ----------------------------------------------

            statCards[0]
                .querySelector("h3")
                .textContent =
                stats.availableBooks;


            // ----------------------------------------------
            // ISSUED BOOKS
            // ----------------------------------------------

            statCards[1]
                .querySelector("h3")
                .textContent =
                stats.issuedBooks;


            // ----------------------------------------------
            // DUE SOON
            // ----------------------------------------------

            statCards[2]
                .querySelector("h3")
                .textContent =
                stats.dueSoon;


            // ----------------------------------------------
            // FINE
            // ----------------------------------------------

            statCards[3]
                .querySelector("h3")
                .textContent =
                `₹${stats.totalFine}`;

        }


        // ==================================================
        // LOAD ISSUED BOOKS
        // ==================================================

        await loadIssuedBooks(token);

    } catch (error) {

        console.error(
            "Student dashboard error:",
            error
        );

    }

}


// ==========================================================
// LOAD ISSUED BOOKS FROM BACKEND
// ==========================================================

async function loadIssuedBooks(token) {

    const bookList =
        document.querySelector(
            ".book-list"
        );


    if (!bookList) {
        return;
    }


    try {

        const response =
            await fetch(
               `${API_BASE_URL}/api/student/book-requests`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        const data =
            await response.json();


       console.log(
    "Student book requests:",
    JSON.stringify(data, null, 2)
);

        if (
            !response.ok ||
            !data.success
        ) {

            console.error(
                "Book requests error:",
                data.message
            );

            return;
        }


        // Only approved / currently issued books
        const issuedBooks =
            (data.requests || [])
                .filter(function (book) {

                    return (
                        book.status ===
                        "Approved"
                    );

                });


        bookList.innerHTML = "";


        // ==================================================
        // NO ISSUED BOOKS
        // ==================================================

        if (
            issuedBooks.length === 0
        ) {

            bookList.innerHTML = `
                <div style="
                    padding:20px;
                    text-align:center;
                    color:#777;
                ">
                    No books currently issued.
                </div>
            `;

            return;
        }


        // ==================================================
        // DISPLAY MAX 3 BOOKS
        // ==================================================

        issuedBooks
            .slice(0, 3)
            .forEach(function (book) {

                const bookItem =
                    document.createElement(
                        "div"
                    );


                bookItem.className =
                    "book-item";


                // ------------------------------------------
                // DUE STATUS
                // ------------------------------------------

                let dueStatusClass =
                    "safe-status";


                let dueStatusText =
                    "Active";


                if (
                    book.dueDate
                ) {

                    const today =
                        new Date();


                    const dueDate =
                        new Date(
                            book.dueDate
                        );


                    const difference =
                        Math.ceil(
                            (
                                dueDate -
                                today
                            ) /
                            (
                                1000 *
                                60 *
                                60 *
                                24
                            )
                        );


                    if (
                        difference >= 0 &&
                        difference <= 3
                    ) {

                        dueStatusClass =
                            "due-status";


                        dueStatusText =
                            "Due Soon";

                    }


                    if (
                        difference < 0
                    ) {

                        dueStatusClass =
                            "due-status";


                        dueStatusText =
                            "Overdue";

                    }

                }


                // ------------------------------------------
                // BOOK HTML
                // ------------------------------------------

                bookItem.innerHTML = `

                    <div class="book-cover">
                        📘
                    </div>


                    <div class="book-info">

                        <strong>
                            ${book.title || "Unknown Book"}
                        </strong>


                        <span>
                            Author:
                            ${book.author || "Unknown"}
                        </span>


                        <small>
                            Due:
                            ${
                                book.dueDate
                                    ? new Date(
                                        book.dueDate
                                    ).toLocaleDateString()
                                    : "—"
                            }
                        </small>

                    </div>


                    <span class="${dueStatusClass}">
                        ${dueStatusText}
                    </span>

                `;


                bookList.appendChild(
                    bookItem
                );

            });


    } catch (error) {

        console.error(
            "Issued books error:",
            error
        );

    }

}

// ==========================================================
// LOAD AVAILABLE BOOKS FROM BACKEND
// ==========================================================

async function loadAvailableBooks(token) {

    const recommendedContainer =
        document.querySelector(".recommended-books");

    if (!recommendedContainer) {
        return;
    }

    try {

        const response = await fetch(
           `${API_BASE_URL}/api/student/books`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const data = await response.json();

        console.log(
            "Student available books:",
            JSON.stringify(data, null, 2)
        );

        if (!response.ok || !data.success) {

            console.error(
                "Available books error:",
                data.message
            );

            return;
        }

        const books = data.books || [];

        // ==================================================
        // NO BOOKS
        // ==================================================

        if (books.length === 0) {

            recommendedContainer.innerHTML = `
                <div style="
                    width:100%;
                    padding:30px;
                    text-align:center;
                    color:#777;
                ">
                    No books are currently available.
                </div>
            `;

            return;
        }

        // ==================================================
        // CLEAR OLD HARDCODED BOOKS
        // ==================================================

        recommendedContainer.innerHTML = "";

        // ==================================================
        // SHOW MAX 4 RECOMMENDED BOOKS
        // ==================================================

        books.slice(0, 4).forEach(function (book) {

            const bookElement =
                document.createElement("div");

            bookElement.className =
                "recommended-book";

            // ----------------------------------------------
            // COVER
            // ----------------------------------------------

            let coverHTML = `
                <div class="large-book blue-book">
                    📚
                </div>
            `;

            if (book.coverData) {

                coverHTML = `
                    <div
                        class="large-book"
                        style="
                            background:#f5f7ff;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            overflow:hidden;
                        "
                    >
                        <img
                            src="${book.coverData}"
                            alt="${escapeBookText(book.title)}"
                           style="
    width:100%;
    height:100%;
    object-fit:contain;
    border-radius:inherit;
    display:block;
"
                            onerror="
                                this.style.display='none';
                                this.parentElement.innerHTML='📚';
                            "
                        >
                    </div>
                `;
            }

            // ----------------------------------------------
            // BOOK CARD
            // ----------------------------------------------

            bookElement.innerHTML = `

                ${coverHTML}

                <h4>
                    ${escapeBookText(
                        book.title || "Unknown Book"
                    )}
                </h4>

                <p>
                    ${escapeBookText(
                        book.category || "General"
                    )}
                </p>

            `;

            // ----------------------------------------------
            // CLICK BOOK
            // ----------------------------------------------

            bookElement.style.cursor = "pointer";

            bookElement.addEventListener(
                "click",
                function () {

                    // localStorage.setItem(
                    //     "selectedBook",
                    //     JSON.stringify(book)
                    // );

                    // window.location.href =
                    //     "book-details.html";
                    window.location.href =
    `book-details.html?bookId=${encodeURIComponent(book.bookId)}`;
                }
            );

            recommendedContainer.appendChild(
                bookElement
            );

        });

    } catch (error) {

        console.error(
            "Available books loading error:",
            error
        );

    }
}


// ==========================================================
// ESCAPE BOOK TEXT
// ==========================================================

function escapeBookText(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================================
// BROWSE BOOKS NAVIGATION
// ==========================================================

function setupStudentBookNavigation() {

    const browseButtons =
        document.querySelectorAll(
            ".browse-button, .recommended-card .card-header a"
        );

    browseButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                window.location.href =
                    "student-books.html";

            }
        );

    });


    // ======================================================
    // SIDEBAR BROWSE BOOKS
    // ======================================================

    const navLinks =
        document.querySelectorAll(
            ".nav-link"
        );

    navLinks.forEach(function (link) {

        const text =
            link.textContent
                .trim()
                .toLowerCase();

        if (
            text.includes("browse books")
        ) {

            link.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    window.location.href =
                        "student-books.html";

                }
            );

        }

    });


    // ======================================================
    // QUICK ACTION BROWSE BOOKS
    // ======================================================

    const quickActions =
        document.querySelectorAll(
            ".quick-actions .action"
        );

    quickActions.forEach(function (action) {

        const text =
            action.textContent
                .trim()
                .toLowerCase();

        if (
            text.includes("browse books")
        ) {

            action.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    window.location.href =
                        "student-books.html";

                }
            );

        }

    });

}


// ==========================================================
// LOAD BACKEND BOOKS AFTER DASHBOARD LOAD
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const token =
            localStorage.getItem(
                "studentToken"
            );

        if (!token) {
            return;
        }

        await loadAvailableBooks(token);

        setupStudentBookNavigation();

    }
);

// ==========================================================
// STUDENT DASHBOARD MOBILE MENU
// ==========================================================

document.addEventListener("DOMContentLoaded", function () {

    const menuButton = document.querySelector(".mobile-menu");
    const sidebar = document.querySelector(".sidebar");

    if (!menuButton || !sidebar) {
        return;
    }

    menuButton.addEventListener("click", function (event) {
        event.stopPropagation();
        sidebar.classList.toggle("active");
    });

    document.addEventListener("click", function (event) {

        if (
            window.innerWidth <= 650 &&
            !sidebar.contains(event.target) &&
            !menuButton.contains(event.target)
        ) {
            sidebar.classList.remove("active");
        }

    });

    // Close menu after selecting a sidebar link
    sidebar.querySelectorAll(".nav-link, .logout").forEach(function (link) {

        link.addEventListener("click", function () {
            if (window.innerWidth <= 650) {
                sidebar.classList.remove("active");
            }
        });

    });

});