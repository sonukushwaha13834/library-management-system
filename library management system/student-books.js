
// ==========================================================
// STUDENT - BROWSE BOOKS
// Backend / MongoDB based
// ==========================================================

let allBooks = [];
let filteredBooks = [];


// ==========================================================
// PAGE LOAD
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    const token =
        localStorage.getItem("studentToken");

    if (!token) {
        window.location.href = "index.html";
        return;
    }

    loadStudentBooks(token);
    setupFilters();

});


// ==========================================================
// LOAD BOOKS FROM BACKEND
// ==========================================================

async function loadStudentBooks(token) {

    const booksGrid =
        document.querySelector(".books-grid");

    if (!booksGrid) return;

    booksGrid.innerHTML = `
        <div style="
            grid-column: 1 / -1;
            text-align: center;
            padding: 50px;
            color: #8a95a5;
            font-size: 12px;
        ">
            Loading books...
        </div>
    `;

    try {

        const response =
            await fetch(
               `${API_BASE_URL}/api/student/books`,
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
                "Failed to load books."
            );
        }

        allBooks =
            Array.isArray(data.books)
                ? data.books
                : [];

        filteredBooks =
            [...allBooks];

        updateBookCount(
            filteredBooks.length
        );

        renderBooks(
            filteredBooks
        );

    } catch (error) {

        console.error(
            "Student books error:",
            error
        );

        booksGrid.innerHTML = `
            <div style="
                grid-column: 1 / -1;
                text-align: center;
                padding: 50px;
                color: #e05a5a;
                font-size: 12px;
            ">

                Unable to load books.

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
// RENDER BOOKS
// ==========================================================

function renderBooks(books) {

    const booksGrid =
        document.querySelector(".books-grid");

    if (!booksGrid) return;


    if (!books || books.length === 0) {

        booksGrid.innerHTML = `
            <div style="
                grid-column: 1 / -1;
                text-align: center;
                padding: 50px;
                color: #8a95a5;
                font-size: 12px;
            ">
                No books found.
            </div>
        `;

        return;
    }


    booksGrid.innerHTML =
        books.map(book => {

            const availableCopies =
                Number(
                    book.availableCopies || 0
                );

            const totalCopies =
                Number(
                    book.totalCopies || 0
                );


            const isAvailable =
                availableCopies > 0 &&
                book.status === "Available";


            // --------------------------------------------------
            // COVER
            // --------------------------------------------------

            let coverHTML;

            if (book.coverData) {

                coverHTML = `
                   
<img
    src="${escapeHtml(book.coverData)}"
    alt="${escapeHtml(book.title || "Book Cover")}"
    class="book-cover-image"
    style="
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
    "
>


                `;

            } else {

                coverHTML = `
                    <div class="default-book-cover">
                        📚
                    </div>
                `;
            }


            // --------------------------------------------------
            // AVAILABILITY
            // --------------------------------------------------

            const availabilityHTML =
                isAvailable

                    ? `
                        <span class="available">
                            ● Available (${availableCopies})
                        </span>
                    `

                    : `
                        <span class="issued">
                            ● Currently Issued
                        </span>
                    `;


            // --------------------------------------------------
            // DETAILS BUTTON
            // --------------------------------------------------

            const detailsHTML =
                `
                    <a
                        href="book-details.html?bookId=${encodeURIComponent(
                            book.bookId
                        )}"
                        class="details-btn"
                    >
                        View Details
                    </a>
                `;


            // --------------------------------------------------
            // CARD
            // --------------------------------------------------

            return `
                <div class="book-card">

                    <div class="book-cover blue">

                        ${coverHTML}

                    </div>


                    <div class="book-content">

                        <span class="book-category">

                            ${escapeHtml(
                                (
                                    book.category ||
                                    "GENERAL"
                                ).toUpperCase()
                            )}

                        </span>


                        <h3>
                            ${escapeHtml(
                                book.title ||
                                "Unknown Book"
                            )}
                        </h3>


                        <p class="author">

                            ${escapeHtml(
                                book.author ||
                                "Unknown Author"
                            )}

                        </p>


                        <div class="book-info">

                            <span>

                                ISBN:
                                ${escapeHtml(
                                    book.isbn ||
                                    "Not Available"
                                )}

                            </span>

                            ${availabilityHTML}

                        </div>


                        <div class="book-footer">

                            <span>
                                📚
                                ${availableCopies}
                                Available
                            </span>

                            ${detailsHTML}

                        </div>

                    </div>

                </div>
            `;

        }).join("");
}


// ==========================================================
// FILTER / SEARCH SETUP
// ==========================================================

function setupFilters() {

    const searchInput =
        document.querySelector(
            ".search-box input"
        );

    const searchButton =
        document.querySelector(
            ".search-btn"
        );

    const categorySelect =
        document.querySelector(
            ".category-select"
        );

    const availabilitySelect =
        document.querySelector(
            ".availability-select"
        );

    const sortSelect =
        document.querySelector(
            ".sort-select"
        );


    // ------------------------------------------------------
    // SEARCH BUTTON
    // ------------------------------------------------------

    if (searchButton) {

        searchButton.addEventListener(
            "click",
            applyFilters
        );

    }


    // ------------------------------------------------------
    // ENTER SEARCH
    // ------------------------------------------------------

    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    applyFilters();

                }

            }
        );

    }


    // ------------------------------------------------------
    // CATEGORY SELECT
    // ------------------------------------------------------

    if (categorySelect) {

        categorySelect.addEventListener(
            "change",
            applyFilters
        );

    }


    // ------------------------------------------------------
    // AVAILABILITY SELECT
    // ------------------------------------------------------

    if (availabilitySelect) {

        availabilitySelect.addEventListener(
            "change",
            applyFilters
        );

    }


    // ------------------------------------------------------
    // SORT
    // ------------------------------------------------------

    if (sortSelect) {

        sortSelect.addEventListener(
            "change",
            applyFilters
        );

    }


    // ------------------------------------------------------
    // CATEGORY BUTTONS
    // ------------------------------------------------------

    document
        .querySelectorAll(".category")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".category"
                        )
                        .forEach(btn => {

                            btn.classList.remove(
                                "active"
                            );

                        });


                    button.classList.add(
                        "active"
                    );


                    const selectedCategory =
                        button.textContent
                            .trim()
                            .toLowerCase();


                    if (
                        selectedCategory ===
                        "all books"
                    ) {

                        if (categorySelect) {

                            categorySelect.value =
                                "All Categories";

                        }

                    } else {

                        if (categorySelect) {

                            categorySelect.value =
                                findCategoryValue(
                                    selectedCategory
                                );

                        }

                    }


                    applyFilters();

                }
            );

        });
}


// ==========================================================
// APPLY SEARCH + FILTER + SORT
// ==========================================================

function applyFilters() {

    const searchInput =
        document.querySelector(
            ".search-box input"
        );

    const categorySelect =
        document.querySelector(
            ".category-select"
        );

    const availabilitySelect =
        document.querySelector(
            ".availability-select"
        );

    const sortSelect =
        document.querySelector(
            ".sort-select"
        );


    const searchText =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedCategory =
        categorySelect
            ? categorySelect.value
                .trim()
                .toLowerCase()
            : "all categories";


    const selectedAvailability =
        availabilitySelect
            ? availabilitySelect.value
                .trim()
                .toLowerCase()
            : "all books";


    // ------------------------------------------------------
    // FILTER
    // ------------------------------------------------------

    filteredBooks =
        allBooks.filter(book => {

            const title =
                String(
                    book.title || ""
                ).toLowerCase();

            const author =
                String(
                    book.author || ""
                ).toLowerCase();

            const isbn =
                String(
                    book.isbn || ""
                ).toLowerCase();

            const category =
                String(
                    book.category || ""
                ).toLowerCase();


            const matchesSearch =
                !searchText ||
                title.includes(searchText) ||
                author.includes(searchText) ||
                isbn.includes(searchText);


            const matchesCategory =
                selectedCategory ===
                    "all categories" ||

                category ===
                    selectedCategory;


            const availableCopies =
                Number(
                    book.availableCopies || 0
                );


            const isAvailable =
                availableCopies > 0 &&
                book.status === "Available";


            const matchesAvailability =
                selectedAvailability ===
                    "all books" ||

                (
                    selectedAvailability ===
                    "available" &&
                    isAvailable
                ) ||

                (
                    selectedAvailability ===
                    "issued" &&
                    !isAvailable
                );


            return (
                matchesSearch &&
                matchesCategory &&
                matchesAvailability
            );

        });


    // ------------------------------------------------------
    // SORT
    // ------------------------------------------------------

    const sortValue =
        sortSelect
            ? sortSelect.value
            : "Sort: Most Popular";


    if (
        sortValue ===
        "Sort: A-Z"
    ) {

        filteredBooks.sort(
            (a, b) =>
                String(a.title || "")
                    .localeCompare(
                        String(b.title || "")
                    )
        );

    } else if (
        sortValue ===
        "Sort: Recently Added"
    ) {

        filteredBooks.sort(
            (a, b) =>
                new Date(
                    b.createdAt || 0
                ) -
                new Date(
                    a.createdAt || 0
                )
        );

    }


    updateBookCount(
        filteredBooks.length
    );

    renderBooks(
        filteredBooks
    );
}


// ==========================================================
// CATEGORY VALUE HELPER
// ==========================================================

function findCategoryValue(
    category
) {

    const select =
        document.querySelector(
            ".category-select"
        );

    if (!select) {
        return category;
    }


    const option =
        Array.from(
            select.options
        ).find(
            option =>
                option.textContent
                    .trim()
                    .toLowerCase() ===
                category
        );


    return option
        ? option.value
        : category;
}


// ==========================================================
// BOOK COUNT
// ==========================================================

function updateBookCount(
    count
) {

    const countElement =
        document.querySelector(
            ".books-heading span"
        );

    if (!countElement) return;


    countElement.textContent =
        `Showing ${count} book${
            count === 1
                ? ""
                : "s"
        }`;
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

// MOBILE SIDEBAR MENU
document.addEventListener("DOMContentLoaded", () => {
    const menuButton = document.querySelector(".mobile-menu");
    const sidebar = document.querySelector(".sidebar");

    if (!menuButton || !sidebar) return;

    menuButton.addEventListener("click", () => {
        sidebar.classList.toggle("active");
    });
});