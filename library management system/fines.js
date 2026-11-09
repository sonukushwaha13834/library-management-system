
/* =========================================================
   FINES MANAGEMENT - BACKEND VERSION
   MongoDB / Backend based
   No library-data localStorage used
   ========================================================= */

const FINES_API_BASE_URL =
    "http://127.0.0.1:5000";

let fineRecords = [];
let filteredFineRecords = [];

const FINE_PER_DAY = 10;
const RECORDS_PER_PAGE = 10;

let currentPage = 1;


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadFineRecords();

        setupFineSearch();

        setupFineFilter();

        setupExport();

        setupAdminProfile();

        setupNotifications();

        setupSidebar();

    }
);


/* =========================================================
   ADMIN TOKEN
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
            "Admin token not found."
        );

        alert(
            "Admin session not found. Please login again."
        );

        return false;
    }

    return true;
}


/* =========================================================
   LOAD FINE RECORDS FROM BACKEND
   ========================================================= */

async function loadFineRecords() {

    if (!checkAdminToken()) {
        return;
    }

    try {

        const response =
            await fetch(
                FINES_API_BASE_URL +
                "/api/admin/book-requests",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " +
                            getAdminToken(),

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            let errorData = {};

            try {
                errorData =
                    await response.json();
            } catch (error) {
                errorData = {};
            }

            throw new Error(
                errorData.message ||
                "Unable to load fine records."
            );

        }


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to load fine records."
            );

        }


        /*
         * Backend returns all BookRequest records.
         * We convert them into fine records here.
         */

        fineRecords =
            (data.requests || [])
                .map(
                    createFineRecord
                )
                .filter(
                    function (record) {

                        return (
                            record.fine > 0 ||
                            record.lateDays > 0
                        );

                    }
                );


        filteredFineRecords =
            [...fineRecords];


        currentPage = 1;


        updateStatistics();

        renderFineTable();

    }
    catch (error) {

        console.error(
            "Load Fine Records Error:",
            error
        );

        fineRecords = [];

        filteredFineRecords = [];

        updateStatistics();

        renderFineTable();

        showMessage(
            error.message ||
            "Unable to load fine records.",
            "error"
        );

    }

}


/* =========================================================
   CREATE FINE RECORD
   ========================================================= */

function createFineRecord(request) {

    const dueDate =
        request.dueDate
            ? new Date(request.dueDate)
            : null;


    let returnDate = null;


    if (request.returnedDate) {

        returnDate =
            new Date(
                request.returnedDate
            );

    }


    /*
     * If returned, calculate fine using
     * returned date.
     *
     * If still issued, calculate fine
     * using today's date.
     */

    let calculationDate =
        returnDate ||
        new Date();


    let lateDays = 0;


    if (
        dueDate &&
        !isNaN(
            dueDate.getTime()
        )
    ) {

        const difference =
            calculationDate.getTime() -
            dueDate.getTime();


        if (difference > 0) {

            lateDays =
                Math.ceil(
                    difference /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    )
                );

        }

    }


    /*
     * Prefer backend-stored fine if available.
     * Otherwise calculate it.
     */

    const backendFine =
        Number(
            request.fine
        ) || 0;


    const calculatedFine =
        lateDays *
        FINE_PER_DAY;


    const finalFine =
        backendFine > 0
            ? backendFine
            : calculatedFine;


    return {

        requestId:
            request.requestId || "",

        studentId:
            request.studentId || "N/A",

        studentName:
            request.studentName ||
            "Unknown Student",

        studentUsername:
            request.studentUsername ||
            "",

        studentEmail:
            request.studentEmail ||
            "",

        studentCourse:
            request.studentCourse ||
            "",

        bookId:
            request.bookId || "",

        title:
            request.title ||
            "Unknown Book",

        author:
            request.author ||
            "Unknown Author",

        category:
            request.category ||
            "General",

        isbn:
            request.isbn ||
            "N/A",

        issuedDate:
            request.issuedDate ||
            request.issueDate ||
            null,

        dueDate:
            request.dueDate ||
            null,

        returnedDate:
            request.returnedDate ||
            null,

        lateDays:
            lateDays,

        fine:
            finalFine,

        requestStatus:
            request.status ||
            "",

        /*
         * Current backend has no paid-status field.
         * Therefore every unpaid fine is Pending.
         */
       
        paymentStatus:
    request.paymentStatus ||
    request.fineStatus ||
    "Pending"

    };

}


/* =========================================================
   UPDATE STATISTICS
   ========================================================= */

function updateStatistics() {

    let totalFines = 0;

    let paidFines = 0;

    let pendingFines = 0;

    let pendingStudentsSet =
        new Set();

    let overdueCount = 0;


    fineRecords.forEach(
        function (record) {

            const fine =
                Number(
                    record.fine
                ) || 0;


            totalFines += fine;


            /*
             * Paid status is not yet available
             * in the backend schema.
             */

            if (
                record.paymentStatus ===
                "Paid"
            ) {

                paidFines += fine;

            }
            else {

                pendingFines += fine;

                pendingStudentsSet.add(
                    record.studentId
                );

            }


            /*
             * Count currently overdue books.
             */

            if (
                record.requestStatus ===
                    "Approved" &&
                record.lateDays > 0
            ) {

                overdueCount++;

            }

        }
    );


    const totalElement =
        document.getElementById(
            "total-fines"
        );


    const paidElement =
        document.getElementById(
            "paid-fines"
        );


    const pendingElement =
        document.getElementById(
            "pending-fines"
        );


    const overdueElement =
        document.getElementById(
            "overdue-count"
        );


    const paidPercentage =
        document.getElementById(
            "paid-percentage"
        );


    const pendingStudents =
        document.getElementById(
            "pending-students"
        );


    if (totalElement) {

        totalElement.textContent =
            formatCurrency(
                totalFines
            );

    }


    if (paidElement) {

        paidElement.textContent =
            formatCurrency(
                paidFines
            );

    }


    if (pendingElement) {

        pendingElement.textContent =
            formatCurrency(
                pendingFines
            );

    }


    if (overdueElement) {

        overdueElement.textContent =
            overdueCount;

    }


    const percentage =
        totalFines > 0
            ? Math.round(
                (
                    paidFines /
                    totalFines
                ) * 100
            )
            : 0;


    if (paidPercentage) {

        paidPercentage.textContent =
            percentage +
            "% collected";

    }


    if (pendingStudents) {

        pendingStudents.textContent =
            pendingStudentsCount(
                pendingStudents
            );

    }

}


/* =========================================================
   PENDING STUDENT COUNT
   ========================================================= */

function pendingStudentsCount(
    element
) {

    const students =
        new Set();


    fineRecords.forEach(
        function (record) {

            if (
                record.paymentStatus ===
                "Pending"
            ) {

                students.add(
                    record.studentId
                );

            }

        }
    );


    return (
        students.size +
        (
            students.size === 1
                ? " student"
                : " students"
        )
    );

}


/* =========================================================
   RENDER TABLE
   ========================================================= */

function renderFineTable() {

    const list =
        document.getElementById(
            "fine-list"
        );


    const noFines =
        document.getElementById(
            "no-fines"
        );


    const paginationInfo =
        document.getElementById(
            "pagination-info"
        );


    if (!list) {
        return;
    }


    list.innerHTML = "";


    const totalRecords =
        filteredFineRecords.length;


    if (totalRecords === 0) {

        if (noFines) {

            noFines.style.display =
                "block";

        }


        if (paginationInfo) {

            paginationInfo.textContent =
                "Showing 0 records";

        }


        renderPagination();

        return;

    }


    if (noFines) {

        noFines.style.display =
            "none";

    }


    const totalPages =
        Math.ceil(
            totalRecords /
            RECORDS_PER_PAGE
        );


    if (
        currentPage >
        totalPages
    ) {

        currentPage =
            totalPages;

    }


    const startIndex =
        (
            currentPage - 1
        ) *
        RECORDS_PER_PAGE;


    const endIndex =
        Math.min(
            startIndex +
            RECORDS_PER_PAGE,
            totalRecords
        );


    const pageRecords =
        filteredFineRecords.slice(
            startIndex,
            endIndex
        );


    pageRecords.forEach(
        function (record) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    <div class="student-cell">

                        <strong>
                            ${escapeHtml(
                                record.studentName
                            )}
                        </strong>

                        <small>
                            ${escapeHtml(
                                record.studentId
                            )}
                        </small>

                    </div>
                </td>


                <td>
                    <div class="book-cell">

                        <strong>
                            ${escapeHtml(
                                record.title
                            )}
                        </strong>

                        <small>
                            ${escapeHtml(
                                record.bookId
                            )}
                        </small>

                    </div>
                </td>


                <td>
                    ${formatDate(
                        record.issuedDate
                    )}
                </td>


                <td>
                    ${formatDate(
                        record.dueDate
                    )}
                </td>


                <td>
                    ${
                        record.returnedDate
                            ? formatDate(
                                record.returnedDate
                            )
                            : "-"
                    }
                </td>


                <td>
                    <span class="${
                        record.lateDays > 0
                            ? "late-days"
                            : "on-time"
                    }">

                        ${record.lateDays}

                    </span>
                </td>


                <td>
                    <strong class="fine-value">
                        ${formatCurrency(
                            record.fine
                        )}
                    </strong>
                </td>


                <td>
                    <span class="status-badge ${
                        record.paymentStatus ===
                        "Paid"
                            ? "paid"
                            : "pending"
                    }">

                        ${
                            record.paymentStatus ===
                            "Paid"
                                ? "Paid"
                                : "Pending"
                        }

                    </span>
                </td>
              <td>
    <button
        type="button"
        class="view-fine-btn"
        data-request-id="${
            escapeHtml(
                record.requestId
            )
        }"
    >
        View
    </button>
</td>
            `;


            list.appendChild(
                row
            );

        }
    );


    if (paginationInfo) {

        paginationInfo.textContent =
            `Showing ${
                startIndex + 1
            }-${
                endIndex
            } of ${
                totalRecords
            } records`;

    }
setupViewButtons();

renderPagination();
}


/* =========================================================
   SEARCH
   ========================================================= */

function setupFineSearch() {

    const input =
        document.getElementById(
            "fine-search"
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "input",
        function () {

            applyFilters();

        }
    );

}


/* =========================================================
   STATUS FILTER
   ========================================================= */

function setupFineFilter() {

    const filter =
        document.getElementById(
            "fine-status-filter"
        );


    if (!filter) {
        return;
    }


    filter.addEventListener(
        "change",
        function () {

            applyFilters();

        }
    );

}


/* =========================================================
   APPLY SEARCH + FILTER
   ========================================================= */

function applyFilters() {

    const searchInput =
        document.getElementById(
            "fine-search"
        );


    const statusFilter =
        document.getElementById(
            "fine-status-filter"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const status =
        statusFilter
            ? statusFilter.value
            : "all";


    filteredFineRecords =
        fineRecords.filter(
            function (record) {

                const matchesSearch =
                    !search ||
                    record.studentName
                        .toLowerCase()
                        .includes(search) ||
                    record.studentId
                        .toLowerCase()
                        .includes(search) ||
                    record.title
                        .toLowerCase()
                        .includes(search) ||
                    record.bookId
                        .toLowerCase()
                        .includes(search);


                const matchesStatus =
                    status === "all" ||
                    (
                        status === "pending" &&
                        record.paymentStatus ===
                        "Pending"
                    ) ||
                    (
                        status === "paid" &&
                        record.paymentStatus ===
                        "Paid"
                    );


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    currentPage = 1;

    renderFineTable();

}


/* =========================================================
   PAGINATION
   ========================================================= */

function renderPagination() {

    const container =
        document.getElementById(
            "pagination-buttons"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const totalPages =
        Math.ceil(
            filteredFineRecords.length /
            RECORDS_PER_PAGE
        );


    if (
        totalPages <= 1
    ) {

        return;

    }


    const previousButton =
        document.createElement(
            "button"
        );


    previousButton.type =
        "button";


    previousButton.textContent =
        "‹";


    previousButton.disabled =
        currentPage === 1;


    previousButton.addEventListener(
        "click",
        function () {

            if (
                currentPage > 1
            ) {

                currentPage--;

                renderFineTable();

            }

        }
    );


    container.appendChild(
        previousButton
    );


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.textContent =
            page;


        if (
            page === currentPage
        ) {

            button.classList.add(
                "active"
            );

        }


        button.addEventListener(
            "click",
            function () {

                currentPage =
                    page;

                renderFineTable();

            }
        );


        container.appendChild(
            button
        );

    }


    const nextButton =
        document.createElement(
            "button"
        );


    nextButton.type =
        "button";


    nextButton.textContent =
        "›";


    nextButton.disabled =
        currentPage ===
        totalPages;


    nextButton.addEventListener(
        "click",
        function () {

            if (
                currentPage <
                totalPages
            ) {

                currentPage++;

                renderFineTable();

            }

        }
    );


    container.appendChild(
        nextButton
    );

}


/* =========================================================
   VIEW FINE
   ========================================================= */

function setupViewButtons() {

    const buttons =
        document.querySelectorAll(
            ".view-fine-btn"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const requestId =
                        button.getAttribute(
                            "data-request-id"
                        );


                    const record =
                        fineRecords.find(
                            function (item) {

                                return (
                                    item.requestId ===
                                    requestId
                                );

                            }
                        );


                    if (!record) {
                        return;
                    }


                    showFineDetails(
                        record
                    );

                }
            );

        }
    );

}

// /* =========================================================
//    MARK FINE AS PAID
//    ========================================================= */

// function setupMarkPaidButtons() {
//     const buttons = document.querySelectorAll(".mark-paid-btn");

//     buttons.forEach(function (button) {
//         button.addEventListener("click", async function () {
//             const requestId =
//                 button.getAttribute("data-request-id");

//             const record = fineRecords.find(function (item) {
//                 return item.requestId === requestId;
//             });

//             if (!record || record.paymentStatus === "Paid") {
//                 return;
//             }

//             const confirmed = confirm(
//                 "Confirm cash received?\n\n" +
//                 "Student: " + record.studentName + "\n" +
//                 "Book: " + record.title + "\n" +
//                 "Fine: " + formatCurrency(record.fine)
//             );

//             if (!confirmed) return;

//             try {
//                 button.disabled = true;
//                 button.textContent = "Saving...";

//                 const response = await fetch(
//                     FINES_API_BASE_URL +
//                     "/api/admin/fines/" +
//                     encodeURIComponent(requestId) +
//                     "/pay",
//                     {
//                         method: "PUT",
//                         headers: {
//                             "Authorization":
//                                 "Bearer " + getAdminToken(),
//                             "Content-Type": "application/json"
//                         },
//                         body: JSON.stringify({
//                             paymentMethod: "Cash"
//                         })
//                     }
//                 );

//                 const data = await response.json();

//                 if (!response.ok || !data.success) {
//                     throw new Error(
//                         data.message || "Payment save nahi hui."
//                     );
//                 }

//                 alert("Cash payment successfully recorded.");

//                 await loadFineRecords();
//                 applyFilters();

//             } catch (error) {
//                 console.error("Payment Error:", error);

//                 alert(error.message || "Payment save nahi hui.");

//                 button.disabled = false;
//                 button.textContent = "Mark as Paid";
//             }
//         });
//     });
// }

/* =========================================================
   SHOW FINE DETAILS
   ========================================================= */

function showFineDetails(
    record
) {

    const message =
        [
            "Fine Details",
            "",
            "Student: " +
                record.studentName,
            "Student ID: " +
                record.studentId,
            "",
            "Book: " +
                record.title,
            "Book ID: " +
                record.bookId,
            "",
            "Issue Date: " +
                formatDate(
                    record.issuedDate
                ),
            "Due Date: " +
                formatDate(
                    record.dueDate
                ),
            "Return Date: " +
                (
                    record.returnedDate
                        ? formatDate(
                            record.returnedDate
                        )
                        : "Not returned"
                ),
            "",
            "Late Days: " +
                record.lateDays,
            "Fine: " +
                formatCurrency(
                    record.fine
                ),
            "",
            "Status: " +
                record.paymentStatus
        ]
        .join("\n");


    alert(message);

}


/* =========================================================
   EXPORT
   ========================================================= */

function setupExport() {

    const button =
        document.getElementById(
            "export-btn"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        exportFineRecords
    );

}


/* =========================================================
   EXPORT CSV
   ========================================================= */

function exportFineRecords() {

    if (
        filteredFineRecords.length === 0
    ) {

        alert(
            "No fine records available to export."
        );

        return;

    }


    const headers = [

        "Student Name",
        "Student ID",
        "Book",
        "Book ID",
        "Issue Date",
        "Due Date",
        "Return Date",
        "Late Days",
        "Fine",
        "Status"

    ];


    const rows =
        filteredFineRecords.map(
            function (record) {

                return [

                    csvValue(
                        record.studentName
                    ),

                    csvValue(
                        record.studentId
                    ),

                    csvValue(
                        record.title
                    ),

                    csvValue(
                        record.bookId
                    ),

                    csvValue(
                        formatDate(
                            record.issuedDate
                        )
                    ),

                    csvValue(
                        formatDate(
                            record.dueDate
                        )
                    ),

                    csvValue(
                        record.returnedDate
                            ? formatDate(
                                record.returnedDate
                            )
                            : "-"
                    ),

                    csvValue(
                        record.lateDays
                    ),

                    csvValue(
                        record.fine
                    ),

                    csvValue(
                        record.paymentStatus
                    )

                ].join(",");

            }
        );


    const csv =
        [
            headers.join(","),
            ...rows
        ].join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "library-fines.csv";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


/* =========================================================
   CSV VALUE
   ========================================================= */

function csvValue(value) {

    const text =
        String(
            value ?? ""
        );


    return (
        '"' +
        text.replace(
            /"/g,
            '""'
        ) +
        '"'
    );

}


/* =========================================================
   FORMAT CURRENCY
   ========================================================= */

function formatCurrency(
    amount
) {

    const value =
        Number(amount) || 0;


    return (
        "₹" +
        value.toLocaleString(
            "en-IN"
        )
    );

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(
    dateValue
) {

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
   ESCAPE HTML
   ========================================================= */

function escapeHtml(
    value
) {

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


/* =========================================================
   MESSAGE
   ========================================================= */

function showMessage(
    message,
    type
) {

    /*
     * Use alert as a safe fallback.
     * This avoids depending on a missing
     * showNotification() function.
     */

    alert(message);

}


/* =========================================================
   ADMIN PROFILE
   ========================================================= */

function setupAdminProfile() {

    /*
     * Existing HTML already calls
     * toggleProfileMenu(event).
     * Keep a global function for it.
     */

    window.toggleProfileMenu =
        function (event) {

            if (event) {
                event.stopPropagation();
            }

            const existingMenu =
                document.querySelector(
                    ".profile-dropdown"
                );


            if (existingMenu) {

                existingMenu.remove();

                return;

            }


            const profile =
                document.querySelector(
                    ".admin-profile"
                );


            if (!profile) {
                return;
            }


            const menu =
                document.createElement(
                    "div"
                );


            menu.className =
                "profile-dropdown";


            menu.innerHTML = `
                <div>
                    <strong>Library Administrator</strong>
                </div>

                <button
                    type="button"
                    onclick="window.location.href='settings.html'"
                >
                    ⚙️ Settings
                </button>

                <button
                    type="button"
                    onclick="logoutAdmin()"
                >
                    🚪 Logout
                </button>
            `;


            menu.style.position =
                "absolute";

            menu.style.right =
                "20px";

            menu.style.top =
                "70px";

            menu.style.background =
                "#ffffff";

            menu.style.padding =
                "14px";

            menu.style.borderRadius =
                "12px";

            menu.style.boxShadow =
                "0 10px 30px rgba(0,0,0,0.15)";

            menu.style.zIndex =
                "9999";


            document.body.appendChild(
                menu
            );

        };


    document.addEventListener(
        "click",
        function () {

            const menu =
                document.querySelector(
                    ".profile-dropdown"
                );

            if (menu) {
                menu.remove();
            }

        }
    );

}


/* =========================================================
   LOGOUT
   ========================================================= */

function logoutAdmin() {

    localStorage.removeItem(
        "adminToken"
    );

    window.location.href =
        "index.html";

}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function setupNotifications() {

    window.openNotifications =
        function () {

            /*
             * Keep existing notification
             * button functional without
             * introducing localStorage data.
             */

            window.location.href =
                "admin-dashboard.html";

        };

}


/* =========================================================
   SIDEBAR
   ========================================================= */

function setupSidebar() {

    window.toggleSidebar =
        function () {

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

        };

}


/* =========================================================
   INITIAL SAFE GLOBALS
   ========================================================= */

window.loadFineRecords =
    loadFineRecords;

window.applyFilters =
    applyFilters;

window.exportFineRecords =
    exportFineRecords;

