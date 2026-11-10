
/* =========================================================
   ADMIN BOOK HISTORY
   Backend / MongoDB based
   ========================================================= */

const BOOK_HISTORY_API_BASE_URL =
    API_BASE_URL;

/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadAdminBookHistory();

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
   LOAD BOOK HISTORY
   ========================================================= */

async function loadAdminBookHistory() {

    if (!checkAdminToken()) {
        return;
    }


    const historyList =
        document.getElementById(
            "admin-history-list"
        );


    const emptyHistory =
        document.getElementById(
            "empty-history"
        );


    if (!historyList) {
        console.error(
            "Admin history list not found."
        );
        return;
    }


    try {

        const response =
            await fetch(
                BOOK_HISTORY_API_BASE_URL +
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


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load book history."
            );

        }


        const requests =
            data.requests || [];


        if (
            requests.length === 0
        ) {

            historyList.innerHTML = "";

            if (emptyHistory) {

                emptyHistory.style.display =
                    "block";

            }

            return;

        }


        if (emptyHistory) {

            emptyHistory.style.display =
                "none";

        }


        historyList.innerHTML = "";


        /*
         * Latest records first.
         * Backend already sorts by createdAt,
         * but we preserve the newest-first behaviour.
         */

        requests.forEach(
            function (request) {

                const row =
                    document.createElement(
                        "tr"
                    );


                const studentName =
                    request.studentName ||
                    "Unknown Student";


                const bookTitle =
                    request.title ||
                    "Unknown Book";


                const issueDate =
                    formatDate(
                        request.issuedDate ||
                        request.issueDate
                    );


                const dueDate =
                    formatDate(
                        request.dueDate
                    );


                const returnDate =
                    request.returnedDate
                        ? formatDate(
                            request.returnedDate
                        )
                        : "-";


                const fine =
                    Number(
                        request.fine
                    ) || 0;


                const status =
                    request.status ||
                    "Pending";


                let statusClass =
                    "status-pending";


                if (
                    status === "Approved"
                ) {

                    statusClass =
                        "status-approved";

                }
                else if (
                    status === "Returned"
                ) {

                    statusClass =
                        "status-returned";

                }
                else if (
                    status === "Rejected"
                ) {

                    statusClass =
                        "status-rejected";

                }


                row.innerHTML = `

                    <td>
                        <span class="student-name">
                            ${escapeHtml(
                                studentName
                            )}
                        </span>
                    </td>

                    <td>
                        <span class="book-title">
                            ${escapeHtml(
                                bookTitle
                            )}
                        </span>
                    </td>

                    <td>
                        ${issueDate}
                    </td>

                    <td>
                        ${dueDate}
                    </td>

                    <td>
                        ${returnDate}
                    </td>

                    <td>
                        ${
                            fine > 0
                                ? `
                                    <span class="fine">
                                        ₹${fine}
                                    </span>
                                  `
                                : `
                                    <span class="no-fine">
                                        ₹0
                                    </span>
                                  `
                        }
                    </td>

                    <td>
                        <span class="status ${statusClass}">
                            ${escapeHtml(
                                status
                            )}
                        </span>
                    </td>

                `;


                historyList.appendChild(
                    row
                );

            }
        );


    }
    catch (error) {

        console.error(
            "Admin Book History Error:",
            error
        );


        historyList.innerHTML = "";


        if (emptyHistory) {

            emptyHistory.style.display =
                "block";

            emptyHistory.textContent =
                "Unable to load book history.";

        }

    }

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

