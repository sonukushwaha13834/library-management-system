// const API_URL = "http://localhost:5000";

// const adminToken =
//     localStorage.getItem("adminToken");

const API_URL = API_BASE_URL;

const adminToken =
    localStorage.getItem("adminToken");

const loggedInUser =
    JSON.parse(localStorage.getItem("loggedInUser"));

    /* =========================================================
   ADMIN SESSION CHECK
========================================================= */

if (!adminToken || !loggedInUser) {

    window.location.replace("index.html");

} else if (loggedInUser.role !== "Admin") {

    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("adminToken");

    window.location.replace("index.html");

} else {

    console.log(
        "Admin:",
        loggedInUser.username
    );

    console.log(
        "Admin Name:",
        loggedInUser.name
    );

    console.log(
        "College ID:",
        loggedInUser.collegeId
    );

}


/* =========================================================
   INITIALIZE DASHBOARD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeDashboard();

    }
);

function initializeDashboard() {

    const welcome =
        document.getElementById("adminWelcome");

    if (welcome && loggedInUser) {

        welcome.textContent =
            "Welcome back, " +
            (
                loggedInUser.name ||
                loggedInUser.username ||
                "Admin"
            ) +
            "! 👋";
    }


    /* ADMIN AVATAR */

    const adminAvatar =
        document.getElementById("adminAvatar");

    if (adminAvatar && loggedInUser) {

        const adminName =
            loggedInUser.name ||
            loggedInUser.username ||
            "Admin";

        adminAvatar.textContent =
            adminName.trim().charAt(0).toUpperCase();
    }


    /* ADMIN PROFILE NAME */

    const adminProfileName =
        document.getElementById("adminProfileName");

    if (adminProfileName && loggedInUser) {

        adminProfileName.textContent =
            loggedInUser.name ||
            loggedInUser.username ||
            "Admin";
    }


    /* LOAD DASHBOARD */

    loadAdminCollege();
    loadDashboardStats();
    loadAdminStudents();
    loadAdminRequests();
    loadBookStats();
    loadAdminBooks();
    loadRecentActivity();
    loadAdminNotifications();
    
}
/* =========================================================
   LOAD DASHBOARD STATS
========================================================= */

async function loadDashboardStats() {

    try {

        const response = await fetch(
            API_URL + "/api/admin/dashboard-stats",
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

            console.error(
                "Dashboard Stats Error:",
                data
            );

            return;
        }

        console.log(
            "Dashboard Stats:",
            data.stats
        );

        /*
           Yahan tumhare existing
           dashboard count elements
           ko data.stats se connect karenge.
        */

    } catch (error) {

        console.error(
            "Dashboard Stats Request Error:",
            error
        );
    }
}

/* =========================================================
   LOAD ISSUED & RETURNED BOOKS
   College-wise
========================================================= */
async function loadBookStats() {

    try {

        const response = await fetch(
            API_URL + "/api/admin/book-requests",
            {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + adminToken
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            console.error("Book Stats Error:", data);
            return;
        }

        const requests = Array.isArray(data.requests)
            ? data.requests
            : [];

        const issuedBooks = requests.filter(function (request) {
            return request.status === "Approved";
        }).length;

        const returnedBooks = requests.filter(function (request) {
            return request.status === "Returned";
        }).length;

        const issuedElement =
            document.getElementById("issuedBooks");

        const returnedElement =
            document.getElementById("returnedBooks");

        if (issuedElement) {
            issuedElement.textContent = String(issuedBooks);
        }

        if (returnedElement) {
            returnedElement.textContent = String(returnedBooks);
        }

        console.log("Issued Books:", issuedBooks);
        console.log("Returned Books:", returnedBooks);

    } catch (error) {

        console.error(
            "Book Stats Request Error:",
            error
        );
    }
}


async function loadAdminRequests() {
    const requestList = document.getElementById("admin-request-list");

    if (!requestList) return;

    try {
        requestList.innerHTML =
            '<p class="empty-request">Loading book requests...</p>';

        const response = await fetch(
            API_URL + "/api/admin/book-requests",
            {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + adminToken
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            console.error("Admin Book Requests Error:", data);

            requestList.innerHTML =
                '<p class="empty-request">Unable to load book requests.</p>';

            return;
        }

        const requests = Array.isArray(data.requests)
            ? data.requests
            : [];

        if (requests.length === 0) {
            requestList.innerHTML =
                '<p class="empty-request">No book requests available.</p>';
            return;
        }

        requestList.innerHTML = "";

        requests.forEach(function (request) {

            const card = document.createElement("div");
            card.className = "request-card";

            const title = request.title || "Unknown Book";
            const studentName =
                request.studentName || "Unknown Student";

            const requestedDate =
                request.requestedDate ||
                request.createdAt ||
                new Date();

            const status =
                request.status || "Pending";

            card.innerHTML = `
                <div class="request-info">
                    <h3>${escapeHTML(title)}</h3>

                    <p>
                        <strong>Requested by:</strong>
                        ${escapeHTML(studentName)}
                    </p>

                    <p>
                        <strong>Requested Date:</strong>
                        ${escapeHTML(
                            new Date(requestedDate).toLocaleString()
                        )}
                    </p>
                </div>

                <div class="request-right">

                    <div class="request-status ${status.toLowerCase()}">
                        ${escapeHTML(status)}
                    </div>

                    ${
                        status === "Pending"
                            ? `
                                <div class="request-actions">

                                    <button
                                        class="approve-request-btn"
                                        data-request-id="${escapeHTML(request.requestId)}"
                                    >
                                        ✓ Approve
                                    </button>

                                    <button
                                        class="reject-request-btn"
                                        data-request-id="${escapeHTML(request.requestId)}"
                                    >
                                        ✕ Reject
                                    </button>

                                </div>
                            `
                            : ""
                    }

                </div>
            `;

            requestList.appendChild(card);
        });

        // APPROVE BUTTONS
        document
            .querySelectorAll(".approve-request-btn")
            .forEach(function (button) {

                button.addEventListener("click", function () {

                    const requestId =
                        button.getAttribute("data-request-id");

                    approveBookRequest(requestId, button);
                });
            });

        // REJECT BUTTONS
        document
            .querySelectorAll(".reject-request-btn")
            .forEach(function (button) {

                button.addEventListener("click", function () {

                    const requestId =
                        button.getAttribute("data-request-id");

                    rejectBookRequest(requestId, button);
                });
            });

        console.log("Admin Book Requests:", requests);

    } catch (error) {

        console.error(
            "Admin Book Requests Request Error:",
            error
        );

        requestList.innerHTML =
            '<p class="empty-request">Unable to load book requests.</p>';
    }
}
async function approveBookRequest(requestId, button) {

    if (!requestId) return;

    try {

        button.disabled = true;
        button.textContent = "Approving...";

        const response = await fetch(
            API_URL +
            "/api/admin/book-requests/" +
            encodeURIComponent(requestId) +
            "/approve",
            {
                method: "PUT",
                headers: {
                    "Authorization": "Bearer " + adminToken
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            alert(
                data.message ||
                "Unable to approve book request."
            );

            button.disabled = false;
            button.textContent = "✓ Approve";

            return;
        }

        alert("Book request approved successfully.");

        // Refresh request list
        await loadAdminRequests();

        // Refresh dashboard numbers
        await loadBookStats();
        await loadAdminBooks();

        // Refresh recent activity if function exists
        if (typeof loadRecentActivity === "function") {
            await loadRecentActivity();
        }

        // Refresh notifications if function exists
        if (typeof loadAdminNotifications === "function") {
            await loadAdminNotifications();
        }

    } catch (error) {

        console.error(
            "Approve Book Request Error:",
            error
        );

        alert("Server error while approving request.");

        button.disabled = false;
        button.textContent = "✓ Approve";
    }
}
async function rejectBookRequest(requestId, button) {

    if (!requestId) return;

    try {

        button.disabled = true;
        button.textContent = "Rejecting...";

        const response = await fetch(
            API_URL +
            "/api/admin/book-requests/" +
            encodeURIComponent(requestId) +
            "/reject",
            {
                method: "PUT",
                headers: {
                    "Authorization": "Bearer " + adminToken
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            alert(
                data.message ||
                "Unable to reject book request."
            );

            button.disabled = false;
            button.textContent = "✕ Reject";

            return;
        }

        alert("Book request rejected.");

        // Refresh request list
        await loadAdminRequests();

        // Refresh dashboard
        await loadBookStats();

        if (typeof loadRecentActivity === "function") {
            await loadRecentActivity();
        }

        if (typeof loadAdminNotifications === "function") {
            await loadAdminNotifications();
        }

    } catch (error) {

        console.error(
            "Reject Book Request Error:",
            error
        );

        alert("Server error while rejecting request.");

        button.disabled = false;
        button.textContent = "✕ Reject";
    }
}
/* =========================================================
   LOAD ADMIN BOOKS - DEBUG VERSION
========================================================= */

// async function loadAdminBooks() {

//     try {

//         console.log("=================================");
//         console.log("LOADING ADMIN BOOKS");
//         console.log("College ID:", loggedInUser.collegeId);
//         console.log("=================================");


//         const response = await fetch(
//             API_URL + "/api/admin/books",
//             {
//                 method: "GET",
//                 headers: {
//                     "Authorization": "Bearer " + adminToken
//                 }
//             }
//         );


//         console.log(
//             "Books API Status:",
//             response.status
//         );


//         const text = await response.text();


//         console.log(
//             "Books API Raw Response:",
//             text
//         );


//         let data;

//         try {

//             data = JSON.parse(text);

//         } catch (error) {

//             console.error(
//                 "Books API JSON Error:",
//                 error
//             );

//             return;
//         }


//         console.log(
//             "Books API Data:",
//             data
//         );


//         if (!response.ok || !data.success) {

//             console.error(
//                 "Books API Failed:",
//                 data
//             );

//             return;
//         }


//         const books =
//             Array.isArray(data.books)
//                 ? data.books
//                 : [];


//         console.log(
//             "Books Array:",
//             books
//         );


//         console.log(
//             "Number of book records:",
//             books.length
//         );


//         let totalBooks = 0;


//         books.forEach(function (book, index) {

//             console.log(
//                 "Book " + (index + 1) + ":",
//                 book
//             );


//             console.log(
//                 "totalCopies:",
//                 book.totalCopies
//             );


//             console.log(
//                 "copies:",
//                 book.copies
//             );


//             totalBooks +=
//                 Number(
//                     book.totalCopies ||
//                     book.copies ||
//                     0
//                 );

//         });


//         console.log(
//             "FINAL TOTAL BOOKS:",
//             totalBooks
//         );


//         const totalBooksElement =
//             document.getElementById("totalBooks");


//         if (totalBooksElement) {

//             totalBooksElement.textContent =
//                 totalBooks;

//         } else {

//             console.error(
//                 'Element id="totalBooks" not found.'
//             );

//         }

//     } catch (error) {

//         console.error(
//             "Admin Books Request Error:",
//             error
//         );

//     }

// }

async function loadAdminBooks() {

    try {

        const response = await fetch(
            API_URL + "/api/admin/books",
            {
                method: "GET",
                headers: {
                    "Authorization":
                        "Bearer " + adminToken
                }
            }
        );


        if (!response.ok) {

            console.error(
                "Admin Books HTTP Error:",
                response.status
            );

            return;
        }


        const data = await response.json();


        if (!data.success) {

            console.error(
                "Admin Books Error:",
                data
            );

            return;
        }


        const books =
            Array.isArray(data.books)
                ? data.books
                : [];


        /*
           IMPORTANT:
           totalCopies = total physical copies
           of all books in this college.
        */

        const totalBooks =
            books.reduce(function (total, book) {

                return total +
                    Number(book.totalCopies || 0);

            }, 0);


        const totalBooksElement =
            document.getElementById("totalBooks");


        if (!totalBooksElement) {

            console.error(
                "totalBooks element not found."
            );

            return;
        }


        /*
           Update dashboard directly.
        */

        totalBooksElement.textContent =
            String(totalBooks);


        console.log(
            "Dashboard Total Books:",
            totalBooks
        );

    } catch (error) {

        console.error(
            "Admin Books Request Error:",
            error
        );

    }
}
// =========================================================
// LOAD ADMIN STUDENTS
// =========================================================

async function loadAdminStudents() {

    try {

        const response = await fetch(
            API_URL + "/api/admin/students",
            {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + adminToken
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            console.error(
                "Students Error:",
                data
            );

            return;
        }

        console.log(
            "Students for current college:",
            data.students
        );

        const totalStudents =
            document.getElementById("totalStudents");

        if (totalStudents) {

            totalStudents.textContent =
                data.students.length;

        }

    } catch (error) {

        console.error(
            "Students Request Error:",
            error
        );

    }
}
/* =========================================================
   LOAD RECENT ACTIVITY
   REAL DATA FROM MONGODB
========================================================= */

async function loadRecentActivity() {

    const activityBody =
        document.getElementById("recentActivityBody");

    if (!activityBody) {
        return;
    }

    try {

        activityBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center;">
                    Loading recent activity...
                </td>
            </tr>
        `;

        const response = await fetch(
            API_URL + "/api/admin/book-requests",
            {
                method: "GET",

                headers: {
                    "Authorization":
                        "Bearer " + adminToken
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            console.error(
                "Recent Activity Error:",
                data
            );

            activityBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center;">
                        Unable to load recent activity.
                    </td>
                </tr>
            `;

            return;
        }

        const requests =
            Array.isArray(data.requests)
                ? data.requests
                : [];

        if (requests.length === 0) {

            activityBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center;">
                        No recent activity available.
                    </td>
                </tr>
            `;

            return;
        }

        /*
           Sort newest activity first
        */

        requests.sort(function (a, b) {

            const dateA =
                new Date(
                    a.issueDate ||
                    a.returnDate ||
                    a.requestedDate ||
                    a.createdAt ||
                    0
                );

            const dateB =
                new Date(
                    b.issueDate ||
                    b.returnDate ||
                    b.requestedDate ||
                    b.createdAt ||
                    0
                );

            return dateB - dateA;

        });


        /*
           Show latest 4 activities
        */

        const recentRequests =
            requests.slice(0, 4);


        activityBody.innerHTML = "";


        recentRequests.forEach(function (request) {

            const studentName =
                request.studentName ||
                "Unknown Student";

            const bookTitle =
                request.title ||
                "Unknown Book";

            let activity =
                "Requested";

            let activityDate =
                request.requestedDate ||
                request.createdAt;


            /*
               Decide activity from request status
            */

            if (request.status === "Approved") {

                activity = "Issued";

                activityDate =
                    request.issueDate ||
                    request.requestedDate ||
                    request.createdAt;

            } else if (request.status === "Returned") {

                activity = "Returned";

                activityDate =
                    request.returnDate ||
                    request.issueDate ||
                    request.requestedDate ||
                    request.createdAt;

            } else if (request.status === "Rejected") {

                activity = "Rejected";

                activityDate =
                    request.updatedAt ||
                    request.requestedDate ||
                    request.createdAt;

            } else {

                activity = "Requested";

                activityDate =
                    request.requestedDate ||
                    request.createdAt;

            }


            /*
               Student avatar
            */

            const avatar =
                studentName
                    .trim()
                    .charAt(0)
                    .toUpperCase() || "S";


            /*
               Format date
            */

            let formattedDate = "—";

            if (activityDate) {

                const date =
                    new Date(activityDate);

                if (!isNaN(date.getTime())) {

                    formattedDate =
                        date.toLocaleDateString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            }
                        );
                }
            }


            /*
               Status class
            */

            let statusClass =
                "issued";

            if (activity === "Returned") {

                statusClass = "returned";

            } else if (
                activity === "Rejected"
            ) {

                statusClass = "rejected";

            } else if (
                activity === "Requested"
            ) {

                statusClass = "requested";
            }


            const row =
                document.createElement("tr");

            row.innerHTML = `

                <td>

                    <div class="student-name">

                        <span class="student-avatar">
                            ${escapeHTML(avatar)}
                        </span>

                        ${escapeHTML(studentName)}

                    </div>

                </td>


                <td>
                    ${escapeHTML(bookTitle)}
                </td>


                <td>

                    <span class="status ${statusClass}">
                        ${escapeHTML(activity)}
                    </span>

                </td>


                <td>
                    ${escapeHTML(formattedDate)}
                </td>

            `;


            activityBody.appendChild(row);

        });


        console.log(
            "Recent Activity:",
            recentRequests
        );


    } catch (error) {

        console.error(
            "Recent Activity Request Error:",
            error
        );

        activityBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center;">
                    Unable to load recent activity.
                </td>
            </tr>
        `;
    }
}
/* =========================================================
   LOAD ADMIN COLLEGE
========================================================= */

async function loadAdminCollege() {

    try {

        const collegeId =
            loggedInUser &&
            loggedInUser.collegeId;

        if (!collegeId) {

            console.error(
                "College ID not found in admin session."
            );

            return;
        }


        const response =
            await fetch(
                API_URL +
                "/api/admin/college/" +
                encodeURIComponent(collegeId),
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

            console.error(
                "College Error:",
                data
            );

            return;
        }


        const collegeName =
            document.getElementById(
                "adminCollegeName"
            );


        if (collegeName) {

            collegeName.textContent =
                data.college.collegeName;

        }


        console.log(
            "Admin College:",
            data.college
        );


    } catch (error) {

        console.error(
            "College Request Error:",
            error
        );

    }
}

/* =========================================================
   PROFILE DROPDOWN
   ========================================================= */

function toggleProfileMenu(event) {
    if (event) {
        event.stopPropagation();
    }

    const profileMenu = document.getElementById("profileMenu");

    if (!profileMenu) {
        return;
    }

    profileMenu.classList.toggle("show");

    // Close notification if it is open
    const notificationMenu = document.getElementById("notificationMenu");

    if (notificationMenu) {
        notificationMenu.classList.remove("show");
    }
}


function setupProfileMenu() {
    const profileMenu = document.getElementById("profileMenu");

    if (!profileMenu) {
        return;
    }

    const profileLinks = profileMenu.querySelectorAll("a");

    profileLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            profileMenu.classList.remove("show");
        });
    });
}


/* =========================================================
   CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
   ========================================================= */

document.addEventListener("click", function (event) {

    const profileMenu = document.getElementById("profileMenu");
    const profileButton = document.querySelector(".admin-profile");

    if (
        profileMenu &&
        profileButton &&
        !profileMenu.contains(event.target) &&
        !profileButton.contains(event.target)
    ) {
        profileMenu.classList.remove("show");
    }


    const notificationMenu =
        document.getElementById("notificationMenu");

  const notificationButton =
    document.querySelector(".notification");
    if (
        notificationMenu &&
        notificationButton &&
        !notificationMenu.contains(event.target) &&
        !notificationButton.contains(event.target)
    ) {
        notificationMenu.classList.remove("show");
    }


    /* Close mobile sidebar when clicking outside */

    const sidebar = document.querySelector(".sidebar");
    const menuButton = document.querySelector(".menu-btn");

    if (
        sidebar &&
        menuButton &&
        window.innerWidth <= 900 &&
        sidebar.classList.contains("open") &&
        !sidebar.contains(event.target) &&
        !menuButton.contains(event.target)
    ) {
        sidebar.classList.remove("open");
    }

});

/* =========================================================
   LOAD ADMIN NOTIFICATIONS
========================================================= */

async function loadAdminNotifications() {

    try {

        const response = await fetch(
            API_URL + "/api/admin/notifications",
            {
                method: "GET",
                headers: {
                    "Authorization":
                        "Bearer " + adminToken
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            console.error(
                "Admin Notifications Error:",
                data
            );

            return;
        }

        console.log(
            "Admin Notifications:",
            data.notifications
        );

        /* -----------------------------------------
           UPDATE NOTIFICATION DOT
        ----------------------------------------- */

        const notificationDot =
            document.querySelector(".notification-dot");

        if (notificationDot) {

            if (Number(data.unreadCount || 0) > 0) {

                notificationDot.style.display =
                    "block";

            } else {

                notificationDot.style.display =
                    "none";
            }
        }

        /* -----------------------------------------
           IF NOTIFICATION MENU IS ALREADY OPEN,
           UPDATE ITS CONTENT
        ----------------------------------------- */

        const notificationMenu =
            document.getElementById(
                "notificationMenu"
            );

        if (
            notificationMenu &&
            notificationMenu.classList.contains("show")
        ) {

            renderAdminNotifications(
                data.notifications || []
            );
        }

    } catch (error) {

        console.error(
            "Admin Notifications Request Error:",
            error
        );
    }
}
/* =========================================================
   RENDER ADMIN NOTIFICATIONS
========================================================= */

function renderAdminNotifications(notifications) {

    const notificationMenu =
        document.getElementById("notificationMenu");

    if (!notificationMenu) {
        return;
    }

    const notificationBody =
        notificationMenu.querySelector(".notification-body");

    if (!notificationBody) {
        return;
    }

    if (!Array.isArray(notifications) || notifications.length === 0) {

        notificationBody.innerHTML = `
            <div class="notification-empty">
                No notifications available.
            </div>
        `;

        return;
    }

    /*
       Newest notification first
    */

    notifications.sort(function (a, b) {

        return new Date(b.createdAt || 0) -
               new Date(a.createdAt || 0);

    });

    notificationBody.innerHTML = "";

    notifications.forEach(function (notification) {

        const item =
            document.createElement("div");

        item.className =
            "notification-item";

        let formattedTime = "Recently";

        if (notification.createdAt) {

            const date =
                new Date(notification.createdAt);

            if (!isNaN(date.getTime())) {

                formattedTime =
                    date.toLocaleString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    );
            }
        }

        item.innerHTML = `

            <div class="notification-icon">
                ${escapeHTML(notification.icon || "🔔")}
            </div>

            <div class="notification-content">

                <strong>
                    ${escapeHTML(
                        notification.title ||
                        "Notification"
                    )}
                </strong>

                <p>
                    ${escapeHTML(
                        notification.message ||
                        ""
                    )}
                </p>

                <small>
                    ${escapeHTML(formattedTime)}
                </small>

            </div>
        `;

        notificationBody.appendChild(item);

    });
}
/* =========================================================
   NOTIFICATION BELL
========================================================= */

async function openNotifications(event) {

    if (event) {
        event.stopPropagation();
    }

    const profileMenu =
        document.getElementById("profileMenu");

    if (profileMenu) {
        profileMenu.classList.remove("show");
    }

    let notificationMenu =
        document.getElementById("notificationMenu");


    /* -----------------------------------------------------
       CREATE NOTIFICATION MENU
    ----------------------------------------------------- */

    if (!notificationMenu) {

        notificationMenu =
            document.createElement("div");

        notificationMenu.id =
            "notificationMenu";

        notificationMenu.className =
            "notification-menu";

        notificationMenu.innerHTML = `

            <div class="notification-header">

                <strong>
                    Notifications
                </strong>

                <button
                    type="button"
                    class="notification-close"
                    onclick="closeNotifications(event)"
                >
                    ×
                </button>

            </div>

            <div class="notification-body">

                <div class="notification-empty">
                    Loading notifications...
                </div>

            </div>
        `;


        /* -------------------------------------------------
           PLACE MENU BESIDE NOTIFICATION BUTTON
        ------------------------------------------------- */

        const notificationButton =
            document.querySelector(".notification");

        if (notificationButton) {

            const notificationContainer =
                notificationButton.parentElement;

            if (notificationContainer) {

                notificationContainer.style.position =
                    "relative";

                notificationContainer.appendChild(
                    notificationMenu
                );

            } else {

                document.body.appendChild(
                    notificationMenu
                );
            }

        } else {

            document.body.appendChild(
                notificationMenu
            );
        }


        /* -------------------------------------------------
           ADD NOTIFICATION STYLES
        ------------------------------------------------- */

        addNotificationStyles();
    }


    /* -----------------------------------------------------
       OPEN MENU
    ----------------------------------------------------- */

    notificationMenu.classList.add("show");


    /* -----------------------------------------------------
       LOAD REAL ADMIN NOTIFICATIONS
    ----------------------------------------------------- */

    await loadAdminNotifications();
}


/* =========================================================
   CLOSE NOTIFICATIONS
   ========================================================= */

function closeNotifications(event) {

    if (event) {
        event.stopPropagation();
    }

    const notificationMenu =
        document.getElementById("notificationMenu");

    if (notificationMenu) {
        notificationMenu.classList.remove("show");
    }
}


/* =========================================================
   NOTIFICATION STYLES
   ========================================================= */

function addNotificationStyles() {

    if (document.getElementById("notification-js-styles")) {
        return;
    }

    const style = document.createElement("style");

    style.id = "notification-js-styles";

    style.textContent = `

    .notification-menu {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: 320px;
        max-width: calc(100vw - 30px);
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 10px 28px rgba(0,0,0,0.14);
        border: 1px solid #e5e7eb;
        z-index: 9999;
        display: none;
        overflow: hidden;
    }

    .notification-menu.show {
        display: block;
    }

    .notification-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 15px;
        border-bottom: 1px solid #e5e7eb;
        font-size: 14px;
        font-weight: 600;
    }

    .notification-close {
        border: none;
        background: transparent;
        font-size: 20px;
        cursor: pointer;
        line-height: 1;
        color: #6b7280;
        padding: 2px 5px;
    }

    .notification-close:hover {
        color: #111827;
    }

    .notification-body {
        max-height: 350px;
        overflow-y: auto;
    }

    .notification-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 11px 14px;
        border-bottom: 1px solid #f1f5f9;
        transition: background 0.2s ease;
    }

    .notification-item:hover {
        background: #f8fafc;
    }

    .notification-item:last-child {
        border-bottom: none;
    }

    .notification-icon {
        width: 32px;
        height: 32px;
        min-width: 32px;
        border-radius: 50%;
        background: #eef4ff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
    }

    .notification-content {
        flex: 1;
        min-width: 0;
    }

    .notification-content strong {
        display: block;
        font-size: 12.5px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 3px;
    }

    .notification-content p {
        margin: 0 0 3px;
        font-size: 11.5px;
        color: #6b7280;
        line-height: 1.4;
    }

    .notification-content small {
        display: block;
        color: #9ca3af;
        font-size: 10px;
    }

    .notification-empty {
        padding: 25px 15px;
        text-align: center;
        color: #9ca3af;
        font-size: 12px;
    }

    @media (max-width: 600px) {

        .notification-menu {
            position: fixed;
            top: 70px;
            right: 15px;
            width: calc(100vw - 30px);
            max-width: none;
        }

    }

`;

    document.head.appendChild(style);
}


/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */

function toggleSidebar() {

    const sidebar = document.querySelector(".sidebar");

    if (!sidebar) {
        return;
    }

    sidebar.classList.toggle("open");
}


/* =========================================================
   SIDEBAR SETUP
   ========================================================= */

function setupSidebar() {

    const navLinks =
        document.querySelectorAll(".nav-link");

    navLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            /*
               Sidebar should close on mobile.
            */

            const sidebar =
                document.querySelector(".sidebar");

            if (
                sidebar &&
                window.innerWidth <= 900
            ) {
                sidebar.classList.remove("open");
            }

        });

    });

}


/* =========================================================
   DASHBOARD NAVIGATION
   ========================================================= */

/*
   IMPORTANT:

   Earlier this function used:
       window.history.back();

   That was causing:

   Admin Profile
        ↓
   Dashboard
        ↓
   Click Dashboard again
        ↓
   Admin Profile ❌

   Now Dashboard ALWAYS opens admin-dashboard.html.
*/

function goBack(event) {

    if (event) {
        event.preventDefault();
    }

    window.location.href = "admin-dashboard.html";
}


/* =========================================================
   LOGOUT
   ========================================================= */
function logoutAdmin(event) {

    if (event) {
        event.preventDefault();
    }

    localStorage.removeItem(
        "loggedInUser"
    );

    localStorage.removeItem(
        "adminToken"
    );

    window.location.href =
        "index.html";
}

/* =========================================================
   LOGOUT SETUP
   ========================================================= */

function setupLogout() {

    const logoutLinks =
        document.querySelectorAll(
            'a[href="index.html"]'
        );

    logoutLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function (event) {

                logoutAdmin(event);

            }
        );

    });

}


/* =========================================================
   HTML SAFETY
   ========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


/* =========================================================
   WINDOW RESIZE
   ========================================================= */

window.addEventListener(
    "resize",
    function () {

        const sidebar =
            document.querySelector(".sidebar");

        if (!sidebar) {
            return;
        }

        if (window.innerWidth > 900) {
            sidebar.classList.remove("open");
        }

    }
);