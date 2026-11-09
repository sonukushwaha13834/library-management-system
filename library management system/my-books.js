
// ==========================================================
// MY BOOKS - STUDENT
// Backend / MongoDB based
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    const token =
        localStorage.getItem("studentToken");

    if (!token) {
        window.location.href = "index.html";
        return;
    }

    loadMyBooks(token);

});


// ==========================================================
// LOAD MY BOOKS / REQUESTS
// ==========================================================

async function loadMyBooks(token) {

    const container =
        document.getElementById("requested-books");

    const section =
        document.getElementById(
            "requested-books-section"
        );

    if (!container || !section) {
        return;
    }


    container.innerHTML = `
        <div style="
            text-align:center;
            padding:40px;
            color:#8a95a5;
            font-size:13px;
        ">
            Loading your books...
        </div>
    `;


    try {

        const response =
            await fetch(
                "http://127.0.0.1:5000/api/student/book-requests",
                {
                    method: "GET",
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to load your books."
            );

        }


        const requests =
            Array.isArray(data.requests)
                ? data.requests
                : [];


        updateSummaryCards(requests);


        if (requests.length === 0) {

            section.style.display = "block";

            container.innerHTML = `
                <div style="
                    text-align:center;
                    padding:40px;
                    color:#8a95a5;
                    font-size:13px;
                ">
                    You have not requested any books yet.

                    <br><br>

                    <a
                        href="student-books.html"
                        style="
                            display:inline-block;
                            padding:10px 18px;
                            background:#2563eb;
                            color:white;
                            text-decoration:none;
                            border-radius:8px;
                            font-weight:600;
                        "
                    >
                        Browse Books
                    </a>
                </div>
            `;

            return;
        }


        section.style.display = "block";

        renderRequests(requests);


    } catch (error) {

        console.error(
            "My Books error:",
            error
        );


        section.style.display = "block";


        container.innerHTML = `
            <div style="
                text-align:center;
                padding:40px;
                color:#e05a5a;
                font-size:13px;
            ">
                Unable to load your books.

                <br>

                <small>
                    ${escapeHtml(
                        error.message ||
                        "Please check your backend connection."
                    )}
                </small>
            </div>
        `;
    }
}


// ==========================================================
// UPDATE SUMMARY CARDS
// ==========================================================

function updateSummaryCards(requests) {

    const totalBooks =
        requests.length;


    const activeBooks =
        requests.filter(
            request =>
                request.status === "Approved"
        ).length;


    const dueSoonBooks =
        requests.filter(request => {

            if (
                request.status !==
                "Approved"
            ) {
                return false;
            }


            if (!request.dueDate) {
                return false;
            }


            const dueDate =
                new Date(
                    request.dueDate
                );


            if (
                isNaN(
                    dueDate.getTime()
                )
            ) {
                return false;
            }


            const today =
                new Date();


            today.setHours(
                0, 0, 0, 0
            );


            const difference =
                dueDate.getTime() -
                today.getTime();


            const days =
                Math.ceil(
                    difference /
                    (1000 * 60 * 60 * 24)
                );


            return (
                days >= 0 &&
                days <= 3
            );

        }).length;


    const renewedBooks =
        0;


    const summaryCards =
        document.querySelectorAll(
            ".summary-card strong"
        );


    if (summaryCards.length >= 4) {

        summaryCards[0].textContent =
            totalBooks;

        summaryCards[1].textContent =
            activeBooks;

        summaryCards[2].textContent =
            dueSoonBooks;

        summaryCards[3].textContent =
            renewedBooks;
    }
}


// ==========================================================
// RENDER REQUESTS
// ==========================================================

function renderRequests(requests) {

    const container =
        document.getElementById(
            "requested-books"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        requests.map(
            (request, index) => {

                const status =
                    request.status ||
                    "Pending";


                const requestedDate =
                    formatDate(
                        request.requestedDate
                    );


                const issuedDate =
                    formatDate(
                        request.issuedDate
                    );


                const dueDate =
                    formatDate(
                        request.dueDate
                    );


                const returnedDate =
                    formatDate(
                        request.returnedDate
                    );


                const availableCover =
                    request.coverData
                        ? `
                            <img
                                src="${escapeHtml(
                                    request.coverData
                                )}"
                                alt="${escapeHtml(
                                    request.title
                                )}"
                                style="
                                    width:100%;
                                    height:100%;
                                    object-fit:cover;
                                    display:block;
                                "
                            >
                          `
                        : "📚";


                // ------------------------------------------
                // STATUS CONTENT
                // ------------------------------------------

                let statusContent = "";


                if (
                    status ===
                    "Approved"
                ) {

                    statusContent = `
                        <div class="issued-dates">

                            <p>
                                <strong>
                                    Issue Date:
                                </strong>
                                ${issuedDate}
                            </p>

                            <p>
                                <strong>
                                    Due Date:
                                </strong>
                                ${dueDate}
                            </p>

                            <button
                                type="button"
                                class="return-book-btn"
                                onclick="returnBook('${escapeHtml(
                                    request.requestId
                                )}')"
                            >
                                Return Book
                            </button>

                        </div>
                    `;

                } else if (
                    status ===
                    "Returned"
                ) {

                    statusContent = `
                        <div class="returned-info">

                            <p>
                                Book returned successfully.
                            </p>

                            <p>
                                <strong>
                                    Return Date:
                                </strong>
                                ${returnedDate}
                            </p>

                            ${
                                Number(
                                    request.fine || 0
                                ) > 0

                                    ? `
                                        <p>
                                            <strong>
                                                Fine:
                                            </strong>
                                            ₹${Number(
                                                request.fine
                                            )}
                                        </p>
                                      `

                                    : ""
                            }

                        </div>
                    `;

                } else if (
                    status ===
                    "Pending"
                ) {

                    statusContent = `
                        <p>
                            Waiting for admin approval
                        </p>
                    `;

                } else if (
                    status ===
                    "Rejected"
                ) {

                    statusContent = `
                        <p>
                            Your request was rejected.
                        </p>
                    `;

                }


                // ------------------------------------------
                // CARD
                // ------------------------------------------

                return `
                    <div class="request-card">

                        <div
                            class="request-book-icon"
                            style="
                                overflow:hidden;
                                padding:0;
                            "
                        >
                            ${availableCover}
                        </div>


                        <div class="request-book-info">

                            <span class="book-category">
                                ${escapeHtml(
                                    (
                                        request.category ||
                                        "GENERAL"
                                    ).toUpperCase()
                                )}
                            </span>


                            <h3>
                                ${escapeHtml(
                                    request.title ||
                                    "Unknown Book"
                                )}
                            </h3>


                            <p>
                                ${escapeHtml(
                                    request.author ||
                                    "Unknown Author"
                                )}
                            </p>


                            <small>
                                Requested:
                                ${requestedDate}
                            </small>


                            ${
                                request.bookId
                                    ? `
                                        <small>
                                            Book ID:
                                            ${escapeHtml(
                                                request.bookId
                                            )}
                                        </small>
                                      `
                                    : ""
                            }

                        </div>


                        <div class="request-status">

                            <span
                                class="pending-status ${status.toLowerCase()}"
                            >
                                ● ${escapeHtml(status)}
                            </span>


                            ${statusContent}

                        </div>

                    </div>
                `;

            }
        ).join("");
}


// ==========================================================
// RETURN BOOK
// ==========================================================

async function returnBook(
    requestId
) {

    const token =
        localStorage.getItem(
            "studentToken"
        );


    if (!token) {

        window.location.href =
            "index.html";

        return;
    }


    if (!requestId) {

        alert(
            "Request ID is missing."
        );

        return;
    }


    const confirmReturn =
        confirm(
            "Do you want to return this book?"
        );


    if (!confirmReturn) {
        return;
    }


    try {

        const response =
            await fetch(
                `http://127.0.0.1:5000/api/student/book-requests/${encodeURIComponent(
                    requestId
                )}/return`,
                {
                    method: "PUT",
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
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
                "Unable to return book."
            );

        }


        const fine =
            Number(
                data.request?.fine ||
                0
            );


        alert(
            "Book returned successfully!" +
            `\n\nFine: ₹${fine}`
        );


        loadMyBooks(token);


    } catch (error) {

        console.error(
            "Return book error:",
            error
        );


        alert(
            error.message ||
            "Unable to return book."
        );
    }
}


// ==========================================================
// FORMAT DATE
// ==========================================================

function formatDate(
    dateValue
) {

    if (!dateValue) {
        return "Not Available";
    }


    const date =
        new Date(dateValue);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "Not Available";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// ==========================================================
// HTML ESCAPE
// ==========================================================

function escapeHtml(
    value
) {

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

