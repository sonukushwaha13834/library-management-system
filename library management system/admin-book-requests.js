/* =========================================================
   ADMIN BOOK REQUESTS JS
   BACKEND / MONGODB VERSION
========================================================= */

const API_URL = "http://localhost:5000";

const adminToken =
    localStorage.getItem("adminToken");


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // Check admin login
        if (!adminToken) {

            window.location.href = "index.html";

            return;
        }


        loadRequests();

        setupSearch();

        setupStatusFilter();

        updateNotificationBadge();

        setupNotificationClose();

    }
);


/* =========================================================
   LOAD REQUESTS FROM BACKEND
========================================================= */

async function loadRequests() {

    const container =
        document.getElementById("requestsContainer");


    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">📚</div>
            <h3>Loading Book Requests...</h3>
            <p>Please wait.</p>
        </div>
    `;


    try {

        const response =
            await fetch(
                API_URL + "/api/admin/book-requests",
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
            "Admin Book Requests Response:",
            data
        );


        if (
            !response.ok ||
            !data.success
        ) {

            console.error(
                "Book Requests API Error:",
                data
            );


            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <h3>Unable to Load Requests</h3>
                    <p>
                        ${
                            escapeHTML(
                                data.message ||
                                "Something went wrong."
                            )
                        }
                    </p>
                </div>
            `;


            updateTotalRequests(0);

            return;
        }


        const requests =
            Array.isArray(data.requests)
            ? data.requests
            : [];


        // Store backend data temporarily
        window.adminBookRequests =
            requests;


        updateTotalRequests(
            requests.length
        );


        renderRequests(requests);


    } catch (error) {

        console.error(
            "Load Book Requests Error:",
            error
        );


        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>

                <h3>
                    Server Connection Failed
                </h3>

                <p>
                    Unable to connect to the library backend.
                </p>
            </div>
        `;


        updateTotalRequests(0);

    }

}


/* =========================================================
   RENDER REQUESTS
========================================================= */

function renderRequests(requests) {

    const container =
        document.getElementById(
            "requestsContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!requests || requests.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📚
                </div>

                <h3>
                    No Book Requests Found
                </h3>

                <p>
                    There are currently no book requests.
                </p>

            </div>

        `;

        return;
    }


    /*
       Newest requests first
    */

    const sortedRequests =
        [...requests].sort(
            function (a, b) {

                const dateA =
                    new Date(
                        a.createdAt ||
                        a.requestedDate ||
                        0
                    );

                const dateB =
                    new Date(
                        b.createdAt ||
                        b.requestedDate ||
                        0
                    );

                return dateB - dateA;

            }
        );


    sortedRequests.forEach(
        function (request) {

            const title =
                request.title ||
                "Unknown Book";


            const author =
                request.author ||
                "Unknown Author";


            const studentName =
                request.studentName ||
                "Unknown Student";


            const studentUsername =
                request.studentUsername ||
                "";


            const requestedDate =
                request.requestedDate ||
                request.createdAt;


            const status =
                request.status ||
                "Pending";


            const requestId =
                request.requestId ||
                "";


            const item =
                document.createElement("div");


            item.className =
                "request-item";


            const statusClass =
                getStatusClass(status);


            let studentDisplay =
                escapeHTML(studentName);


            if (studentUsername) {

                studentDisplay +=
                    ` (${escapeHTML(studentUsername)})`;

            }


            let actionButtons = "";


            /*
               Approve + Reject only for Pending
            */

            if (
                String(status).toLowerCase() ===
                "pending"
            ) {

                actionButtons = `

                    <button
                        type="button"
                        class="action-btn approve-btn"
                        data-request-id="${escapeHTML(requestId)}"
                        onclick="approveRequest('${escapeJS(requestId)}', this)"
                    >
                        ✓ Approve
                    </button>


                    <button
                        type="button"
                        class="action-btn reject-btn"
                        data-request-id="${escapeHTML(requestId)}"
                        onclick="rejectRequest('${escapeJS(requestId)}', this)"
                    >
                        ✕ Reject
                    </button>

                `;

            }


            item.innerHTML = `

                <div class="request-main">

                    <div class="book-icon">
                        📖
                    </div>


                    <div class="request-details">

                        <h3>
                            ${escapeHTML(title)}
                        </h3>


                        <p>
                            <strong>Author:</strong>
                            ${escapeHTML(author)}
                        </p>


                        <p>
                            <strong>Student:</strong>
                            ${studentDisplay}
                        </p>


                        ${
                            requestedDate
                            ?
                            `
                            <small>
                                Requested on:
                                ${escapeHTML(
                                    formatDate(
                                        requestedDate
                                    )
                                )}
                            </small>
                            `
                            :
                            ""
                        }


                        ${
                            request.issueDate
                            ?
                            `
                            <small>
                                Issued on:
                                ${escapeHTML(
                                    formatDate(
                                        request.issueDate
                                    )
                                )}
                            </small>
                            `
                            :
                            ""
                        }


                        ${
                            request.dueDate
                            ?
                            `
                            <small>
                                Due date:
                                ${escapeHTML(
                                    formatDate(
                                        request.dueDate
                                    )
                                )}
                            </small>
                            `
                            :
                            ""
                        }


                        ${
                            request.returnDate
                            ?
                            `
                            <small>
                                Returned on:
                                ${escapeHTML(
                                    formatDate(
                                        request.returnDate
                                    )
                                )}
                            </small>
                            `
                            :
                            ""
                        }

                    </div>

                </div>


                <div class="request-right">

                    <span
                        class="status ${statusClass}"
                    >
                        ${escapeHTML(status)}
                    </span>


                    <div class="action-buttons">

                        ${actionButtons}

                    </div>

                </div>

            `;


            container.appendChild(item);

        }
    );

}


/* =========================================================
   APPROVE REQUEST
========================================================= */

async function approveRequest(
    requestId,
    button
) {

    if (!requestId) {

        console.error(
            "Request ID missing."
        );

        return;
    }


    try {

        button.disabled = true;

        button.textContent =
            "Approving...";


        const response =
            await fetch(
                API_URL +
                "/api/admin/book-requests/" +
                encodeURIComponent(requestId) +
                "/approve",
                {
                    method: "PUT",

                    headers: {
                        "Authorization":
                            "Bearer " + adminToken
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "Approve Response:",
            data
        );


        if (
            !response.ok ||
            !data.success
        ) {

            alert(
                data.message ||
                "Unable to approve book request."
            );


            button.disabled = false;

            button.textContent =
                "✓ Approve";

            return;
        }


        alert(
            "Book request approved successfully."
        );


        /*
           Reload real backend data
        */

        await loadRequests();


        /*
           Update notification badge
        */

        updateNotificationBadge();


        /*
           Refresh dashboard if functions
           are available globally
        */

        if (
            typeof loadBookStats ===
            "function"
        ) {

            loadBookStats();

        }


    } catch (error) {

        console.error(
            "Approve Request Error:",
            error
        );


        alert(
            "Server error while approving request."
        );


        button.disabled = false;

        button.textContent =
            "✓ Approve";

    }

}


/* =========================================================
   REJECT REQUEST
========================================================= */

async function rejectRequest(
    requestId,
    button
) {

    if (!requestId) {

        console.error(
            "Request ID missing."
        );

        return;
    }


    try {

        button.disabled = true;

        button.textContent =
            "Rejecting...";


        const response =
            await fetch(
                API_URL +
                "/api/admin/book-requests/" +
                encodeURIComponent(requestId) +
                "/reject",
                {
                    method: "PUT",

                    headers: {
                        "Authorization":
                            "Bearer " + adminToken
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "Reject Response:",
            data
        );


        if (
            !response.ok ||
            !data.success
        ) {

            alert(
                data.message ||
                "Unable to reject book request."
            );


            button.disabled = false;

            button.textContent =
                "✕ Reject";

            return;
        }


        alert(
            "Book request rejected successfully."
        );


        /*
           Reload real backend data
        */

        await loadRequests();


        updateNotificationBadge();


    } catch (error) {

        console.error(
            "Reject Request Error:",
            error
        );


        alert(
            "Server error while rejecting request."
        );


        button.disabled = false;

        button.textContent =
            "✕ Reject";

    }

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (!searchInput) {
        return;
    }


    searchInput.addEventListener(
        "input",
        function () {

            filterRequests();

        }
    );

}


/* =========================================================
   STATUS FILTER
========================================================= */

function setupStatusFilter() {

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    if (!statusFilter) {
        return;
    }


    statusFilter.addEventListener(
        "change",
        function () {

            filterRequests();

        }
    );

}


/* =========================================================
   FILTER REQUESTS
========================================================= */

function filterRequests() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const searchText =
        searchInput
        ?
        searchInput.value
            .trim()
            .toLowerCase()
        :
        "";


    const selectedStatus =
        statusFilter
        ?
        statusFilter.value
        :
        "all";


    const allRequests =
        Array.isArray(
            window.adminBookRequests
        )
        ?
        window.adminBookRequests
        :
        [];


    const filteredRequests =
        allRequests.filter(
            function (request) {

                const title =
                    (
                        request.title ||
                        ""
                    ).toLowerCase();


                const student =
                    (
                        request.studentName ||
                        request.studentUsername ||
                        ""
                    ).toLowerCase();


                const status =
                    String(
                        request.status ||
                        "Pending"
                    );


                const matchesSearch =
                    title.includes(searchText) ||
                    student.includes(searchText);


                const matchesStatus =
                    selectedStatus === "all" ||
                    status.toLowerCase() ===
                    selectedStatus.toLowerCase();


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    updateTotalRequests(
        filteredRequests.length
    );


    renderRequests(
        filteredRequests
    );

}


/* =========================================================
   TOTAL REQUESTS
========================================================= */

function updateTotalRequests(count) {

    const total =
        document.getElementById(
            "totalRequests"
        );


    if (total) {

        total.textContent =
            String(count);

    }

}


/* =========================================================
   STATUS CLASS
========================================================= */

function getStatusClass(status) {

    switch (
        String(status).toLowerCase()
    ) {

        case "approved":
            return "status-approved";

        case "rejected":
            return "status-rejected";

        case "returned":
            return "status-returned";

        default:
            return "status-pending";

    }

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(date) {

    if (!date) {
        return "Not available";
    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return String(date);

    }


    return parsedDate.toLocaleString();

}


/* =========================================================
   PROFILE MENU
========================================================= */

function toggleProfileMenu(event) {

    if (event) {
        event.stopPropagation();
    }


    const menu =
        document.getElementById(
            "profileMenu"
        );


    if (!menu) {
        return;
    }


    menu.classList.toggle("show");

}


/* =========================================================
   CLOSE PROFILE MENU
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const menu =
            document.getElementById(
                "profileMenu"
            );


        const button =
            document.querySelector(
                ".admin-profile"
            );


        if (
            menu &&
            button &&
            !menu.contains(event.target) &&
            !button.contains(event.target)
        ) {

            menu.classList.remove(
                "show"
            );

        }

    }
);


/* =========================================================
   ADMIN NOTIFICATIONS
========================================================= */

function openNotifications(event) {

    if (event) {

        event.stopPropagation();

    }


    const profileMenu =
        document.getElementById(
            "profileMenu"
        );


    if (profileMenu) {

        profileMenu.classList.remove(
            "show"
        );

    }


    let notificationMenu =
        document.getElementById(
            "notificationMenu"
        );


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


            <div
                id="notificationContent"
                class="notification-content-list"
            >

                <div class="notification-loading">
                    Loading...
                </div>

            </div>

        `;


        document.body.appendChild(
            notificationMenu
        );

    }


    notificationMenu.classList.toggle(
        "show"
    );


    if (
        notificationMenu.classList.contains(
            "show"
        )
    ) {

        updateNotificationText();

    }

}


/* =========================================================
   CLOSE NOTIFICATIONS
========================================================= */

function closeNotifications(event) {

    if (event) {

        event.stopPropagation();

    }


    const notificationMenu =
        document.getElementById(
            "notificationMenu"
        );


    if (notificationMenu) {

        notificationMenu.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   UPDATE ADMIN NOTIFICATION BADGE
========================================================= */

function updateNotificationBadge() {

    const requests =
        Array.isArray(
            window.adminBookRequests
        )
        ?
        window.adminBookRequests
        :
        [];


    const pendingRequests =
        requests.filter(
            function (request) {

                return (
                    String(
                        request.status ||
                        "Pending"
                    ).toLowerCase() ===
                    "pending"
                );

            }
        );


    const badge =
        document.getElementById(
            "notificationBadge"
        );


    if (badge) {

        badge.textContent =
            String(
                pendingRequests.length
            );


        badge.style.display =
            pendingRequests.length > 0
            ?
            "flex"
            :
            "none";

    }


    updateNotificationText();

}


/* =========================================================
   NOTIFICATION TEXT
========================================================= */

function updateNotificationText() {

    const content =
        document.getElementById(
            "notificationContent"
        );


    if (!content) {
        return;
    }


    const requests =
        Array.isArray(
            window.adminBookRequests
        )
        ?
        window.adminBookRequests
        :
        [];


    const pending =
        requests.filter(
            function (request) {

                return (
                    String(
                        request.status ||
                        "Pending"
                    ).toLowerCase() ===
                    "pending"
                );

            }
        );


    if (pending.length === 0) {

        content.innerHTML = `

            <div class="notification-item">

                <div class="notification-icon">
                    📚
                </div>

                <div class="notification-content">

                    <strong>
                        Book Requests
                    </strong>

                    <p>
                        No new pending book requests.
                    </p>

                </div>

            </div>

        `;

        return;
    }


    /*
       Show latest pending requests
    */

    const latest =
        pending
            .slice()
            .sort(
                function (a, b) {

                    return (
                        new Date(
                            b.createdAt ||
                            b.requestedDate ||
                            0
                        ) -
                        new Date(
                            a.createdAt ||
                            a.requestedDate ||
                            0
                        )
                    );

                }
            )
            .slice(0, 5);


    content.innerHTML = "";


    latest.forEach(
        function (request) {

            const item =
                document.createElement("div");


            item.className =
                "notification-item";


            item.innerHTML = `

                <div class="notification-icon">
                    📚
                </div>

                <div class="notification-content">

                    <strong>
                        New Book Request
                    </strong>

                    <p>
                        ${
                            escapeHTML(
                                request.studentName ||
                                "Student"
                            )
                        }
                        requested
                        <strong>
                            ${
                                escapeHTML(
                                    request.title ||
                                    "a book"
                                )
                            }
                        </strong>
                    </p>

                    <small>
                        ${
                            escapeHTML(
                                formatDate(
                                    request.createdAt ||
                                    request.requestedDate
                                )
                            )
                        }
                    </small>

                </div>

            `;


            content.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   CLOSE NOTIFICATION WHEN CLICKING OUTSIDE
========================================================= */

function setupNotificationClose() {

    document.addEventListener(
        "click",
        function (event) {

            const menu =
                document.getElementById(
                    "notificationMenu"
                );


            const button =
                document.querySelector(
                    ".notification-btn"
                );


            if (
                menu &&
                button &&
                !menu.contains(event.target) &&
                !button.contains(event.target)
            ) {

                menu.classList.remove(
                    "show"
                );

            }

        }
    );

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
        return;
    }


    sidebar.classList.toggle(
        "open"
    );

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
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

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


/* =========================================================
   JAVASCRIPT STRING ESCAPE
========================================================= */

function escapeJS(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /\r/g,
            "\\r"
        )
        .replace(
            /\n/g,
            "\\n"
        );

}