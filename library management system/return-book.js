
/* =========================================================
   RETURN BOOK PAGE
   BACKEND / MONGODB VERSION
   ========================================================= */


/* =========================================================
   CONFIG
   ========================================================= */

const RETURN_API_BASE_URL =
    "http://127.0.0.1:5000";

let returnIssuedBooks = [];

let selectedRequestIndex = null;


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadIssuedBooks();

        loadTodayReturns();

        loadRecentReturns();

    }
);


/* =========================================================
   GET ADMIN TOKEN
   ========================================================= */

function getAdminToken() {

    return (
        localStorage.getItem(
            "adminToken"
        ) || ""
    );

}


/* =========================================================
   CHECK ADMIN LOGIN
   ========================================================= */

function checkAdminToken() {

    const token =
        getAdminToken();

    if (!token) {

        console.error(
            "Admin token not found in localStorage."
        );

        alert(
            "Admin session not found. Please login again."
        );

        return false;
    }

    return true;
}


/* =========================================================
   LOAD ISSUED BOOKS FROM BACKEND
   ========================================================= */

async function loadIssuedBooks() {

    if (!checkAdminToken()) {
        return;
    }

    try {

        const response =
            await fetch(
                RETURN_API_BASE_URL +
                "/api/admin/book-requests",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " +
                            getAdminToken()
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "Book Requests API:",
            data
        );
        console.table(data.requests);


        if (
            !response.ok ||
            !data.success
        ) {

            console.error(
                "Issued Books Error:",
                data
            );

            showNotification(
                data.message ||
                "Unable to load issued books.",
                "error"
            );

            return;
        }


        /*
         * Only currently issued books.
         * Backend status = Approved
         */

        returnIssuedBooks =
            (data.requests || [])
                .filter(
                    function (request) {

                        return (
                            request.status ===
                            "Approved"
                        );

                    }
                );


        console.log(
            "Issued books from backend:",
            returnIssuedBooks
        );


        /*
         * Connect search AFTER
         * backend data is loaded.
         */

        setupSearch();


        updateStats();


    } catch (error) {

        console.error(
            "Load Issued Books Error:",
            error
        );

        showNotification(
            "Unable to connect to backend.",
            "error"
        );

    }

}


/* =========================================================
   SEARCH SETUP
   ========================================================= */
function setupSearch() {

    const input =
        document.querySelector(
            ".search-box input"
        );

    const searchButton =
        document.querySelector(
            ".search-btn"
        );


    if (!input || !searchButton) {

        console.error(
            "Search elements not found."
        );

        return;
    }


    searchButton.onclick =
        performSearch;


    input.onkeydown =
        function (event) {

            if (
                event.key ===
                "Enter"
            ) {

                performSearch();

            }

        };

}

/* =========================================================
   PERFORM SEARCH
   ========================================================= */
function performSearch() {

    const input =
        document.querySelector(
            ".search-box input"
        );

    const resultsContainer =
        document.getElementById(
            "issued-books-results"
        );


    if (!input || !resultsContainer) {
        return;
    }


    const value =
        input.value
            .trim()
            .toLowerCase();


    if (!value) {

        resultsContainer.innerHTML = "";

        alert(
            "Please enter student name, student ID or book title."
        );

        return;
    }


    const matches =
        returnIssuedBooks.filter(
            function (request) {

                if (
                    request.status !==
                    "Approved"
                ) {
                    return false;
                }


                const studentName =
                    (
                        request.studentName ||
                        ""
                    ).toLowerCase();


                const studentId =
                    (
                        request.studentId ||
                        ""
                    ).toLowerCase();


                const username =
                    (
                        request.studentUsername ||
                        ""
                    ).toLowerCase();


                const title =
                    (
                        request.title ||
                        ""
                    ).toLowerCase();


                return (
                    studentName.includes(value) ||
                    studentId.includes(value) ||
                    username.includes(value) ||
                    title.includes(value)
                );

            }
        );


    if (matches.length === 0) {

        resultsContainer.innerHTML = `

            <div style="
                padding:18px;
                margin-top:15px;
                border-radius:12px;
                background:#fff5f5;
                color:#dc2626;
                border:1px solid #fee2e2;
            ">

                No currently issued book found.

            </div>

        `;

        return;
    }


    /*
     * Show ALL matching issued books
     */

    resultsContainer.innerHTML = `

        <div style="
            margin-top:15px;
            padding:15px;
            border-radius:14px;
            background:#f8fafc;
            border:1px solid #e5e7eb;
        ">

            <div style="
                font-size:14px;
                font-weight:600;
                margin-bottom:12px;
                color:#1f2937;
            ">

                ${matches.length} Issued Book${
                    matches.length > 1 ? "s" : ""
                } Found

            </div>


            <div id="issued-book-list"></div>

        </div>

    `;


    const list =
        document.getElementById(
            "issued-book-list"
        );


    matches.forEach(
        function (request) {

            const originalIndex =
                returnIssuedBooks.indexOf(
                    request
                );


            const item =
                document.createElement(
                    "div"
                );


            item.style.cssText = `
                display:flex;
                align-items:center;
                gap:12px;
                padding:12px;
                margin-bottom:8px;
                background:#ffffff;
                border:1px solid #e5e7eb;
                border-radius:10px;
                cursor:pointer;
                transition:0.2s;
            `;


            item.innerHTML = `

                <div style="
                    width:42px;
                    height:42px;
                    border-radius:10px;
                    background:#eef2ff;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:20px;
                    flex-shrink:0;
                ">

                    📖

                </div>


                <div style="
                    flex:1;
                    min-width:0;
                ">

                    <strong style="
                        display:block;
                        color:#1f2937;
                        font-size:14px;
                    ">

                        ${
                            request.title ||
                            "Unknown Book"
                        }

                    </strong>


                    <span style="
                        display:block;
                        margin-top:3px;
                        color:#6b7280;
                        font-size:12px;
                    ">

                        ${
                            request.studentName ||
                            "Student"
                        }
                        ·
                        ${
                            request.studentId ||
                            "N/A"
                        }

                    </span>


                    <small style="
                        display:block;
                        margin-top:3px;
                        color:#9ca3af;
                        font-size:11px;
                    ">

                        Due:
                        ${
                            formatDate(
                                request.dueDate
                            )
                        }

                    </small>

                </div>


                <div style="
                    color:#2563eb;
                    font-size:12px;
                    font-weight:600;
                ">

                    Select →

                </div>

            `;


            item.addEventListener(
                "click",
                function () {

                    showBookDetails(
                        originalIndex
                    );


                    /*
                     * Highlight selected book
                     */

                    document
                        .querySelectorAll(
                            "#issued-book-list > div"
                        )
                        .forEach(
                            function (el) {

                                el.style.border =
                                    "1px solid #e5e7eb";

                                el.style.background =
                                    "#ffffff";

                            }
                        );


                    item.style.border =
                        "1px solid #2563eb";

                    item.style.background =
                        "#eff6ff";

                }
            );


            item.addEventListener(
                "mouseenter",
                function () {

                    if (
                        item.style.background !==
                        "rgb(239, 246, 255)"
                    ) {

                        item.style.background =
                            "#f8fafc";

                    }

                }
            );


            item.addEventListener(
                "mouseleave",
                function () {

                    if (
                        item.style.background !==
                        "rgb(239, 246, 255)"
                    ) {

                        item.style.background =
                            "#ffffff";

                    }

                }
            );


            list.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   SHOW BOOK DETAILS
   ========================================================= */

function showBookDetails(index) {

    const request =
        returnIssuedBooks[index];


    if (
        !request ||
        request.status !==
        "Approved"
    ) {

        return;
    }


    selectedRequestIndex =
        index;


    /* =================================================
       STUDENT DETAILS
       ================================================= */

    const studentName =
        document.querySelector(
            ".student-details strong"
        );


    const studentInfo =
        document.querySelector(
            ".student-details span"
        );


    const studentEmail =
        document.querySelector(
            ".student-details small"
        );


    const studentAvatar =
        document.querySelector(
            ".student-avatar"
        );


    if (studentName) {

        studentName.textContent =
            request.studentName ||
            "Unknown Student";

    }


    if (studentInfo) {

        studentInfo.textContent =
            `${request.studentId || "N/A"} · ${
                request.studentCourse ||
                "Course not available"
            }`;

    }


    if (studentEmail) {

        studentEmail.textContent =
            request.studentEmail ||
            "Email not available";

    }


    if (studentAvatar) {

        studentAvatar.textContent =
            getInitials(
                request.studentName
            );

    }


    /* =================================================
       STUDENT ACTIVE ISSUED BOOK COUNT
       ================================================= */

    const issuedCount =
        document.querySelector(
            ".issued-count strong"
        );


    if (issuedCount) {

        const count =
            returnIssuedBooks.filter(
                function (item) {

                    return (

                        item.studentId ===
                            request.studentId &&

                        item.status ===
                            "Approved"

                    );

                }
            ).length;


        issuedCount.textContent =
            count;

    }


    /* =================================================
       BOOK DETAILS
       ================================================= */

    const bookName =
        document.querySelector(
            ".book-details strong"
        );


    const bookInfo =
        document.querySelector(
            ".book-details span"
        );


    const isbn =
        document.querySelector(
            ".book-details small"
        );


    if (bookName) {

        bookName.textContent =
            request.title ||
            "Unknown Book";

    }


    if (bookInfo) {

        bookInfo.textContent =
            `${request.author || "Unknown Author"} · ${
                request.category || "General"
            }`;

    }


    if (isbn) {

        isbn.textContent =
            `ISBN: ${request.isbn || "N/A"}`;

    }


    /* =================================================
       BOOK STATUS
       ================================================= */

    const bookStatus =
        document.querySelector(
            ".book-status span"
        );


    if (bookStatus) {

        bookStatus.textContent =
            request.status ===
            "Approved"
                ? "Issued"
                : "Not Issued";

    }


    /* =================================================
       DATES
       ================================================= */

    const dateBoxes =
        document.querySelectorAll(
            ".date-box strong"
        );


    if (
        dateBoxes.length >=
        3
    ) {

        /*
         * Issue Date
         */

        dateBoxes[0].textContent =
            formatDate(
                request.issuedDate ||
                request.issueDate
            );


        /*
         * Due Date
         */

        dateBoxes[1].textContent =
            formatDate(
                request.dueDate
            );


        /*
         * Expected Return Date
         *
         * Since the book is still issued,
         * today's date is shown here.
         */

        dateBoxes[2].textContent =
            formatDate(
                new Date()
            );

    }


    /* =================================================
       FINE
       ================================================= */

    updateFine(
        request
    );

}



/* =========================================================
   UPDATE FINE
   ========================================================= */

function updateFine(request) {

    const fineAmount =
        document.querySelector(
            ".fine-amount strong"
        );


    const fineStatus =
        document.querySelector(
            ".fine-info strong"
        );


    const fineLabel =
        document.querySelector(
            ".fine-info span"
        );


    const fineDescription =
        document.querySelector(
            ".fine-info p"
        );


    let lateDays = 0;

    let fine = 0;


    if (request.dueDate) {

        const dueDate =
            new Date(
                request.dueDate
            );


        const today =
            new Date();


        dueDate.setHours(
            0,
            0,
            0,
            0
        );


        today.setHours(
            0,
            0,
            0,
            0
        );


        if (
            !isNaN(
                dueDate.getTime()
            )
        ) {

            const difference =
                today.getTime() -
                dueDate.getTime();


            lateDays =
                Math.max(
                    0,
                    Math.ceil(
                        difference /
                        (
                            1000 *
                            60 *
                            60 *
                            24
                        )
                    )
                );


            fine =
                lateDays * 10;

        }

    }


    if (fineAmount) {

        fineAmount.textContent =
            `₹${fine}`;

    }


    if (fineStatus) {

        fineStatus.textContent =
            lateDays > 0
                ? `${lateDays} ${
                    lateDays === 1
                        ? "day"
                        : "days"
                  } late`
                : "Returned on time";

    }


    if (fineLabel) {

        fineLabel.textContent =
            lateDays > 0
                ? "LATE RETURN"
                : "ON TIME";

    }


    if (fineDescription) {

        fineDescription.textContent =
            lateDays > 0
                ? "Fine calculated at ₹10 per late day."
                : "No fine is applicable.";

    }

}


/* =========================================================
   RETURN BOOK BUTTON
   ========================================================= */

document.addEventListener(
    "click",
    function (event) {

        if (
            !event.target.closest(
                ".return-btn"
            )
        ) {

            return;
        }


        returnSelectedBook();

    }
);


/* =========================================================
   RETURN SELECTED BOOK
   ========================================================= */

async function returnSelectedBook() {

    if (
        selectedRequestIndex ===
        null
    ) {

        alert(
            "Please search and select an issued book first."
        );

        return;
    }


    const request =
        returnIssuedBooks[
            selectedRequestIndex
        ];


    if (!request) {

        alert(
            "Book record not found."
        );

        return;
    }


    if (
        request.status !==
        "Approved"
    ) {

        alert(
            "This book is not currently issued."
        );

        return;
    }


    const confirmReturn =
        confirm(
            `Do you want to return "${request.title}"?`
        );


    if (!confirmReturn) {
        return;
    }


    if (!checkAdminToken()) {
        return;
    }


    try {

        const response =
            await fetch(
                RETURN_API_BASE_URL +
                "/api/admin/book-requests/" +
                encodeURIComponent(
                    request.requestId
                ) +
                "/return",
                {
                    method: "PUT",

                    headers: {
                        "Authorization":
                            "Bearer " +
                            getAdminToken()
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "Return Book API:",
            data
        );


        if (
            !response.ok ||
            !data.success
        ) {

            alert(
                data.message ||
                "Unable to return book."
            );

            return;
        }


        alert(
            `"${request.title}" returned successfully!\n\n` +
            `Late Days: ${
                data.lateDays || 0
            }\n` +
            `Fine: ₹${
                data.fine || 0
            }`
        );


        selectedRequestIndex =
            null;


        clearReturnDetails();


        await loadIssuedBooks();

        await loadTodayReturns();

        await loadRecentReturns();

    } catch (error) {

        console.error(
            "Return Book Error:",
            error
        );


        alert(
            "Unable to connect to backend."
        );

    }

}


/* =========================================================
   TODAY'S RETURNS
   ========================================================= */

async function loadTodayReturns() {

    if (!checkAdminToken()) {
        return;
    }


    try {

        const response =
            await fetch(
                RETURN_API_BASE_URL +
                "/api/admin/book-requests",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " +
                            getAdminToken()
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
                "Today's Returns Error:",
                data
            );

            return;
        }


        const today =
            new Date();


        today.setHours(
            0,
            0,
            0,
            0
        );


        const tomorrow =
            new Date(
                today
            );


        tomorrow.setDate(
            tomorrow.getDate() + 1
        );


        const count =
            (data.requests || [])
                .filter(
                    function (request) {

                        if (
                            request.status !==
                            "Returned"
                        ) {

                            return false;
                        }


                        const returnedDate =
                            new Date(
                                request.returnedDate ||
                                request.returnDate
                            );


                        return (
                            !isNaN(
                                returnedDate.getTime()
                            ) &&
                            returnedDate >= today &&
                            returnedDate < tomorrow
                        );

                    }
                )
                .length;


        const number =
            document.querySelector(
                ".big-number"
            );


        if (number) {

            number.textContent =
                count;

        }

    } catch (error) {

        console.error(
            "Today's Returns Error:",
            error
        );

    }

}


/* =========================================================
   RECENT RETURNS
   ========================================================= */

async function loadRecentReturns() {

    if (!checkAdminToken()) {
        return;
    }


    try {

        const response =
            await fetch(
                RETURN_API_BASE_URL +
                "/api/admin/book-requests",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " +
                            getAdminToken()
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
                "Recent Returns Error:",
                data
            );

            return;
        }


        const returned =
            (data.requests || [])
                .filter(
                    function (request) {

                        return (
                            request.status ===
                            "Returned"
                        );

                    }
                )
                .sort(
                    function (a, b) {

                        return (
                            new Date(
                                b.returnedDate ||
                                b.returnDate ||
                                b.updatedAt
                            ) -
                            new Date(
                                a.returnedDate ||
                                a.returnDate ||
                                a.updatedAt
                            )
                        );

                    }
                )
                .slice(
                    0,
                    3
                );


        const recentCard =
            document.querySelector(
                ".recent-card"
            );


        if (!recentCard) {
            return;
        }


        let html = `

            <div class="recent-header">

                <h3>
                    Recent Returns
                </h3>

                <a href="admin-book-history.html">
                    View All
                </a>

            </div>

        `;


        if (
            returned.length ===
            0
        ) {

            html += `

                <p style="
                    padding:20px;
                    color:#6b7280;
                ">

                    No recent returns.

                </p>

            `;

        } else {

            returned.forEach(
                function (request) {

                    const returnedDate =
                        request.returnedDate ||
                        request.returnDate;


                    html += `

                        <div class="recent-item">

                            <div class="mini-avatar">

                                ${getInitials(
                                    request.studentName
                                )}

                            </div>


                            <div>

                                <strong>

                                    ${
                                        request.studentName ||
                                        "Student"
                                    }

                                </strong>


                                <span>

                                    ${
                                        request.title ||
                                        "Book"
                                    }

                                </span>

                            </div>


                            <small>

                                ${formatDate(
                                    returnedDate
                                )}

                            </small>

                        </div>

                    `;

                }
            );

        }


        recentCard.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Recent Returns Error:",
            error
        );

    }

}


/* =========================================================
   UPDATE PAGE STATS
   ========================================================= */

function updateStats() {

    /*
     * Current page doesn't have
     * an issued-books counter outside
     * the selected student section.
     *
     * This function is kept so the
     * backend loading flow remains clean.
     */

}


/* =========================================================
   CLEAR RETURN DETAILS
   ========================================================= */

function clearReturnDetails() {

    selectedRequestIndex =
        null;


    const studentName =
        document.querySelector(
            ".student-details strong"
        );


    const studentInfo =
        document.querySelector(
            ".student-details span"
        );


    const studentEmail =
        document.querySelector(
            ".student-details small"
        );


    const studentAvatar =
        document.querySelector(
            ".student-avatar"
        );


    const issuedCount =
        document.querySelector(
            ".issued-count strong"
        );


    const bookName =
        document.querySelector(
            ".book-details strong"
        );


    const bookInfo =
        document.querySelector(
            ".book-details span"
        );


    const isbn =
        document.querySelector(
            ".book-details small"
        );


    const bookStatus =
        document.querySelector(
            ".book-status span"
        );


    const dateBoxes =
        document.querySelectorAll(
            ".date-box strong"
        );


    const fineAmount =
        document.querySelector(
            ".fine-amount strong"
        );


    const fineLabel =
        document.querySelector(
            ".fine-info span"
        );


    const fineStatus =
        document.querySelector(
            ".fine-info strong"
        );


    const fineDescription =
        document.querySelector(
            ".fine-info p"
        );


    if (studentName)
        studentName.textContent =
            "No Student";


    if (studentInfo)
        studentInfo.textContent =
            "-";


    if (studentEmail)
        studentEmail.textContent =
            "-";


    if (studentAvatar)
        studentAvatar.textContent =
            "ST";


    if (issuedCount)
        issuedCount.textContent =
            "0";


    if (bookName)
        bookName.textContent =
            "No Issued Book";


    if (bookInfo)
        bookInfo.textContent =
            "-";


    if (isbn)
        isbn.textContent =
            "ISBN: -";


    if (bookStatus)
        bookStatus.textContent =
            "Not Selected";


    dateBoxes.forEach(
        function (box) {
            box.textContent =
                "-";
        }
    );


    if (fineAmount)
        fineAmount.textContent =
            "₹0";


    if (fineLabel)
        fineLabel.textContent =
            "ON TIME";


    if (fineStatus)
        fineStatus.textContent =
            "Returned on time";


    if (fineDescription)
        fineDescription.textContent =
            "No fine is applicable.";


    const input =
        document.querySelector(
            ".search-box input"
        );


    if (input) {
        input.value = "";
    }

}


/* =========================================================
   GET INITIALS
   ========================================================= */

function getInitials(name) {

    if (!name) {
        return "ST";
    }


    return name
        .split(" ")
        .filter(
            function (word) {
                return word.length > 0;
            }
        )
        .map(
            function (word) {
                return word.charAt(0);
            }
        )
        .join("")
        .substring(
            0,
            2
        )
        .toUpperCase();

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }


    const date =
        new Date(
            dateValue
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "-";
    }


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   SIDEBAR
   ========================================================= */

function toggleSidebar() {

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (!sidebar) {

        console.log(
            "Sidebar not found"
        );

        return;
    }


    sidebar.classList.toggle(
        "open"
    );

}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function openNotifications() {

    alert(
        "No new notifications."
    );

}


/* =========================================================
   ADMIN PROFILE MENU
   ========================================================= */

function toggleProfileMenu(event) {

    if (event) {

        event.preventDefault();

        event.stopPropagation();

    }


    const oldMenu =
        document.getElementById(
            "admin-profile-menu"
        );


    if (oldMenu) {

        oldMenu.remove();

        return;
    }


    const menu =
        document.createElement(
            "div"
        );


    menu.id =
        "admin-profile-menu";


    menu.style.position =
        "fixed";

    menu.style.top =
        "75px";

    menu.style.right =
        "25px";

    menu.style.width =
        "220px";

    menu.style.background =
        "#ffffff";

    menu.style.border =
        "1px solid #e5e7eb";

    menu.style.borderRadius =
        "12px";

    menu.style.boxShadow =
        "0 10px 30px rgba(0,0,0,0.15)";

    menu.style.padding =
        "10px";

    menu.style.zIndex =
        "999999";


    menu.innerHTML = `

        <div style="
            padding:12px;
            border-bottom:1px solid #eeeeee;
        ">

            <strong style="
                display:block;
                font-size:15px;
                color:#222;
            ">

                Admin

            </strong>


            <span style="
                display:block;
                margin-top:4px;
                font-size:12px;
                color:#888;
            ">

                Library Administrator

            </span>

        </div>


        <a
            href="#"
            onclick="openAdminProfile(event)"
            style="
                display:block;
                padding:12px;
                text-decoration:none;
                color:#333;
                font-size:14px;
            "
        >

            👤 &nbsp; My Profile

        </a>


        <a
            href="settings.html"
            style="
                display:block;
                padding:12px;
                text-decoration:none;
                color:#333;
                font-size:14px;
            "
        >

            ⚙️ &nbsp; Settings

        </a>


        <a
            href="index.html"
            style="
                display:block;
                padding:12px;
                text-decoration:none;
                color:#e53935;
                font-size:14px;
                border-top:1px solid #eeeeee;
            "
        >

            🚪 &nbsp; Logout

        </a>

    `;


    document.body.appendChild(
        menu
    );

}


/* =========================================================
   ADMIN PROFILE DETAILS
   ========================================================= */

function openAdminProfile(event) {

    if (event) {

        event.preventDefault();

        event.stopPropagation();

    }


    const menu =
        document.getElementById(
            "admin-profile-menu"
        );


    if (menu) {
        menu.remove();
    }


    const oldProfile =
        document.getElementById(
            "admin-profile-details"
        );


    if (oldProfile) {

        oldProfile.remove();

        return;
    }


    const profile =
        document.createElement(
            "div"
        );


    profile.id =
        "admin-profile-details";


    profile.style.position =
        "fixed";

    profile.style.top =
        "50%";

    profile.style.left =
        "50%";

    profile.style.transform =
        "translate(-50%, -50%)";

    profile.style.width =
        "360px";

    profile.style.maxWidth =
        "calc(100% - 30px)";

    profile.style.background =
        "#ffffff";

    profile.style.borderRadius =
        "15px";

    profile.style.padding =
        "25px";

    profile.style.boxShadow =
        "0 15px 40px rgba(0,0,0,0.2)";

    profile.style.zIndex =
        "100000";


    profile.innerHTML = `

        <div style="
            text-align:center;
            border-bottom:1px solid #eeeeee;
            padding-bottom:18px;
            margin-bottom:18px;
        ">

            <div style="
                width:70px;
                height:70px;
                border-radius:50%;
                background:#2563eb;
                color:white;
                display:flex;
                align-items:center;
                justify-content:center;
                margin:0 auto 12px;
                font-size:28px;
                font-weight:600;
            ">

                A

            </div>


            <h2 style="
                margin:0;
                color:#222;
                font-size:20px;
            ">

                Admin

            </h2>


            <p style="
                margin:5px 0 0;
                color:#888;
                font-size:13px;
            ">

                Library Administrator

            </p>

        </div>


        <div style="
            margin-bottom:12px;
            color:#444;
            font-size:14px;
        ">

            <strong>
                Role:
            </strong>

            Admin

        </div>


        <div style="
            margin-bottom:20px;
            color:#444;
            font-size:14px;
        ">

            <strong>
                Account:
            </strong>

            Library Administrator

        </div>


        <button
            type="button"
            onclick="
                document
                .getElementById(
                    'admin-profile-details'
                )
                .remove()
            "
            style="
                width:100%;
                padding:11px;
                border:none;
                border-radius:8px;
                background:#2563eb;
                color:white;
                font-size:14px;
                cursor:pointer;
            "
        >

            Close

        </button>

    `;


    document.body.appendChild(
        profile
    );

}


/* =========================================================
   CLOSE PROFILE MENU
   ========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const menu =
            document.getElementById(
                "admin-profile-menu"
            );


        if (
            menu &&
            !event.target.closest(
                ".admin-profile"
            ) &&
            !event.target.closest(
                "#admin-profile-menu"
            )
        ) {

            menu.remove();

        }

    }
);
