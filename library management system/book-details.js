// const books = {

//     // 1. Database Management System
//     dbms: {
//         category: "DATABASE",
//         title: "Database Management System",
//         author: "Korth",
//         description:
//             "This book provides a comprehensive introduction to database management systems. It covers database architecture, relational models, SQL, transaction management, database design and other important concepts.",
//         isbn: "9781234567890",
//         publisher: "McGraw Hill",
//         edition: "7th Edition",
//         published: "2020",
//         bookId: "BK-1024",
//         language: "English",
//         pages: "1248",
//         shelf: "A-12",
//         available: "4",
//         total: "5",
//         duration: "14 Days",
//         fine: "₹10 / Day"
//     },


//     // 2. Java
//     java: {
//         category: "PROGRAMMING",
//         title: "Java: The Complete Reference",
//         author: "Herbert Schildt",
//         description:
//             "Java: The Complete Reference provides a detailed introduction to Java programming. It covers object-oriented programming, classes, inheritance, exceptions, threads, collections and other important Java concepts.",
//         isbn: "9789876543210",
//         publisher: "McGraw Hill",
//         edition: "12th Edition",
//         published: "2021",
//         bookId: "BK-1025",
//         language: "English",
//         pages: "1248",
//         shelf: "B-08",
//         available: "3",
//         total: "4",
//         duration: "14 Days",
//         fine: "₹10 / Day"
//     },


//     // 3. Data Structures & Algorithms
//     dsa: {
//         category: "DATA STRUCTURES",
//         title: "Data Structures & Algorithms",
//         author: "Narasimha Karumanchi",
//         description:
//             "This book explains important data structures and algorithms in a simple and practical way. It covers arrays, linked lists, stacks, queues, trees, graphs, sorting, searching and algorithm analysis.",
//         isbn: "9788126558093",
//         publisher: "CareerMonk",
//         edition: "5th Edition",
//         published: "2022",
//         bookId: "BK-1026",
//         language: "English",
//         pages: "828",
//         shelf: "C-14",
//         available: "0",
//         total: "3",
//         duration: "14 Days",
//         fine: "₹10 / Day"
//     },


//     // 4. Computer Networks
//     network: {
//         category: "NETWORKING",
//         title: "Computer Networks",
//         author: "Andrew S. Tanenbaum",
//         description:
//             "Computer Networks introduces the fundamental concepts of computer networking. It covers network architecture, protocols, data communication, routing, wireless networks and network security.",
//         isbn: "9780132126953",
//         publisher: "Pearson",
//         edition: "5th Edition",
//         published: "2011",
//         bookId: "BK-1027",
//         language: "English",
//         pages: "960",
//         shelf: "D-05",
//         available: "2",
//         total: "4",
//         duration: "14 Days",
//         fine: "₹10 / Day"
//     },


//     // 5. Operating System
//     os: {
//         category: "OPERATING SYSTEM",
//         title: "Operating System Concepts",
//         author: "Abraham Silberschatz",
//         description:
//             "Operating System Concepts provides a detailed understanding of operating systems. It covers processes, threads, memory management, file systems, storage management and security.",
//         isbn: "9781118063330",
//         publisher: "Wiley",
//         edition: "9th Edition",
//         published: "2012",
//         bookId: "BK-1028",
//         language: "English",
//         pages: "976",
//         shelf: "E-09",
//         available: "3",
//         total: "5",
//         duration: "14 Days",
//         fine: "₹10 / Day"
//     },


//     // 6. C Programming
//     c: {
//         category: "PROGRAMMING",
//         title: "The C Programming Language",
//         author: "Brian W. Kernighan",
//         description:
//             "The C Programming Language introduces the fundamentals of C programming. It covers data types, operators, control statements, functions, pointers, arrays, structures and file handling.",
//         isbn: "9780131103627",
//         publisher: "Prentice Hall",
//         edition: "2nd Edition",
//         published: "1988",
//         bookId: "BK-1029",
//         language: "English",
//         pages: "272",
//         shelf: "F-03",
//         available: "2",
//         total: "3",
//         duration: "14 Days",
//         fine: "₹10 / Day"
//     },


//     // 7. Engineering Mathematics
//     math: {
//         category: "MATHEMATICS",
//         title: "Engineering Mathematics",
//         author: "B. S. Grewal",
//         description:
//             "Engineering Mathematics covers important mathematical concepts required for engineering students, including calculus, differential equations, matrices, vector analysis and numerical methods.",
//         isbn: "9788195657671",
//         publisher: "Khanna Publishers",
//         edition: "44th Edition",
//         published: "2022",
//         bookId: "BK-1030",
//         language: "English",
//         pages: "1100",
//         shelf: "G-11",
//         available: "4",
//         total: "5",
//         duration: "14 Days",
//         fine: "₹10 / Day"
//     },


//     // 8. Artificial Intelligence
//     ai: {
//         category: "ARTIFICIAL INTELLIGENCE",
//         title: "Artificial Intelligence: A Modern Approach",
//         author: "Stuart Russell & Peter Norvig",
//         description:
//             "Artificial Intelligence: A Modern Approach provides a comprehensive introduction to artificial intelligence. It covers intelligent agents, problem solving, machine learning, neural networks, robotics and natural language processing.",
//         isbn: "9780134610993",
//         publisher: "Pearson",
//         edition: "4th Edition",
//         published: "2021",
//         bookId: "BK-1031",
//         language: "English",
//         pages: "1152",
//         shelf: "H-07",
//         available: "1",
//         total: "3",
//         duration: "14 Days",
//         fine: "₹10 / Day"
//     }

// };


// // ==========================================
// // GET SELECTED BOOK FROM URL
// // ==========================================

// const params = new URLSearchParams(window.location.search);

// const bookName = params.get("book") || "dbms";

// const book = books[bookName] || books.dbms;


// // ==========================================
// // UPDATE BOOK DETAILS PAGE
// // ==========================================

// document.getElementById("book-category").textContent =
//     book.category;

// document.getElementById("book-title").textContent =
//     book.title;

// document.getElementById("book-author").textContent =
//     book.author;

// document.getElementById("book-description").textContent =
//     book.description;

// document.getElementById("book-isbn").textContent =
//     book.isbn;

// document.getElementById("book-publisher").textContent =
//     book.publisher;

// document.getElementById("book-edition").textContent =
//     book.edition;

// document.getElementById("book-published").textContent =
//     book.published;

// document.getElementById("book-id").textContent =
//     book.bookId;

// document.getElementById("book-category-info").textContent =
//     book.category;

// document.getElementById("book-language").textContent =
//     book.language;

// document.getElementById("book-pages").textContent =
//     book.pages;

// document.getElementById("book-shelf").textContent =
//     book.shelf;

// document.getElementById("available-number").textContent =
//     book.available;

// document.getElementById("total-copies").textContent =
//     book.total;

// document.getElementById("borrow-duration").textContent =
//     book.duration;

// document.getElementById("fine-per-day").textContent =
//     book.fine;
// //     function requestBook() {

// //     const confirmRequest = confirm(
// //         `Do you want to request "${book.title}"?`
// //     );

// //     if (confirmRequest) {

// //         alert(
// //             `Book request submitted successfully!\n\nBook: ${book.title}`
// //         );

// //     }

// // }
// function requestBook() {

//     const confirmRequest = confirm(
//         `Do you want to request "${book.title}"?`
//     );

//     if (!confirmRequest) {
//         return;
//     }

//     // Get existing requests
//     let requests = JSON.parse(
//         localStorage.getItem("bookRequests")
//     ) || [];

//     // Check if this book is already requested
//     // const alreadyRequested = requests.some(
//     //     request => request.bookId === book.bookId
//     // );
//     const alreadyRequested = requests.some(
//     request =>
//         request.bookId === book.bookId &&
//         request.status !== "Returned" &&
//         request.status !== "Rejected"
// );

//     if (alreadyRequested) {

//         alert(
//             `You have already requested "${book.title}".`
//         );

//         return;
//     }

//     // Create new request
//     const newRequest = {

//         bookId: book.bookId,
//         title: book.title,
//         author: book.author,
//         category: book.category,

//         requestedDate: new Date().toLocaleDateString(),

//         status: "Pending"
//     };

//     // Add request
//     requests.push(newRequest);

//     // Save request in browser
//     localStorage.setItem(
//         "bookRequests",
//         JSON.stringify(requests)
//     );

//     alert(
//         `Book request submitted successfully!\n\nBook: ${book.title}`
//     );
// }

// ==========================================================
// BOOK DETAILS - STUDENT
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    const token =
        localStorage.getItem("studentToken");

    // ----------------------------------------------
    // CHECK LOGIN
    // ----------------------------------------------

    if (!token) {

        window.location.href = "index.html";

        return;

    }


    // ----------------------------------------------
    // GET BOOK ID FROM URL
    // ----------------------------------------------

    const params =
        new URLSearchParams(
            window.location.search
        );

    const bookId =
        params.get("bookId");


    if (!bookId) {

        showError(
            "Book ID is missing."
        );

        return;

    }


    // ----------------------------------------------
    // LOAD BOOK
    // ----------------------------------------------

    loadBookDetails(
        token,
        bookId
    );

});


// ==========================================================
// LOAD BOOK DETAILS FROM BACKEND
// ==========================================================

async function loadBookDetails(
    token,
    bookId
) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/student/books/${encodeURIComponent(bookId)}`,
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
                "Unable to load book details."
            );

        }


        const book =
            data.book;


        // ------------------------------------------
        // DISPLAY BOOK DATA
        // ------------------------------------------

        displayBook(book);


    } catch (error) {

        console.error(
            "Book details error:",
            error
        );

        showError(
            error.message ||
            "Unable to load book details."
        );

    }

}


// ==========================================================
// DISPLAY BOOK
// ==========================================================

function displayBook(book) {

    // ----------------------------------------------
    // BASIC INFORMATION
    // ----------------------------------------------

    setText(
        "book-category",
        (book.category || "GENERAL").toUpperCase()
    );

    setText(
        "book-title",
        book.title || "Unknown Book"
    );

    setText(
        "book-author",
        book.author || "Unknown Author"
    );

    setText(
        "book-isbn",
        book.isbn || "Not Available"
    );

    setText(
        "book-publisher",
        book.publisher || "Not Available"
    );


    // ----------------------------------------------
    // BOOK ID
    // ----------------------------------------------

    setText(
        "book-id",
        book.bookId || "Not Available"
    );

    setText(
        "book-category-info",
        book.category || "General"
    );


    // ----------------------------------------------
    // FIELDS NOT CURRENTLY STORED IN BOOK MODEL
    // ----------------------------------------------

    setText(
        "book-edition",
        "Not Available"
    );

    setText(
        "book-published",
        "Not Available"
    );

    setText(
        "book-language",
        "Not Available"
    );

    setText(
        "book-pages",
        "Not Available"
    );

    setText(
        "book-shelf",
        "Not Available"
    );


    // ----------------------------------------------
    // DESCRIPTION
    // ----------------------------------------------

    setText(
        "book-description",
        "Book details are available in the library collection."
    );


    // ----------------------------------------------
    // AVAILABILITY
    // ----------------------------------------------

    const available =
        Number(
            book.availableCopies || 0
        );

    const total =
        Number(
            book.totalCopies || 0
        );


    setText(
        "available-number",
        available
    );

    setText(
        "total-copies",
        total
    );


    // ----------------------------------------------
    // AVAILABILITY STATUS
    // ----------------------------------------------

    updateAvailability(
        book
    );


    // ----------------------------------------------
    // COVER IMAGE
    // ----------------------------------------------

    updateBookCover(
        book
    );


    // ----------------------------------------------
    // BORROW INFORMATION
    // ----------------------------------------------

    setText(
        "borrow-duration",
        "14 Days"
    );

    setText(
        "fine-per-day",
        "₹10 / Day"
    );

}


// ==========================================================
// UPDATE AVAILABILITY
// ==========================================================

function updateAvailability(book) {

    const available =
        Number(
            book.availableCopies || 0
        );

    const total =
        Number(
            book.totalCopies || 0
        );


    const availabilityElement =
        document.querySelector(
            ".availability"
        );


    if (availabilityElement) {

        if (
            available > 0 &&
            book.status === "Available"
        ) {

            availabilityElement.innerHTML = `
                <span class="dot"></span>
                Available
            `;

        } else {

            availabilityElement.innerHTML = `
                <span class="dot"></span>
                Currently Issued
            `;

        }

    }


    // ----------------------------------------------
    // STOCK BAR
    // ----------------------------------------------

    const stockBar =
        document.querySelector(
            ".stock-bar div"
        );


    if (stockBar) {

        let percentage = 0;

        if (total > 0) {

            percentage =
                (available / total) * 100;

        }

        stockBar.style.width =
            `${percentage}%`;

    }


    // ----------------------------------------------
    // STOCK INFO
    // ----------------------------------------------

    const stockInfo =
        document.querySelector(
            ".stock-info"
        );


    if (stockInfo) {

        const issued =
            Math.max(
                total - available,
                0
            );


        const percentage =
            total > 0
                ? Math.round(
                    (available / total) * 100
                )
                : 0;


        stockInfo.innerHTML = `
            <span>
                ${issued} copy${issued === 1 ? "" : "ies"} currently issued
            </span>

            <span>
                ${percentage}% available
            </span>
        `;

    }


    // ----------------------------------------------
    // REQUEST BUTTON
    // ----------------------------------------------

    const requestButton =
        document.querySelector(
            ".request-btn"
        );


    if (requestButton) {

        if (
            available > 0 &&
            book.status === "Available"
        ) {

            requestButton.disabled =
                false;

            requestButton.style.opacity =
                "1";

            requestButton.style.cursor =
                "pointer";

        } else {

            requestButton.disabled =
                true;

            requestButton.textContent =
                "Currently Unavailable";

            requestButton.style.opacity =
                "0.6";

            requestButton.style.cursor =
                "not-allowed";

        }

    }

}


// ==========================================================
// UPDATE BOOK COVER
// ==========================================================

function updateBookCover(book) {

    const cover =
        document.getElementById(
            "book-cover"
        );


    if (!cover) return;


    if (book.coverData) {

        cover.innerHTML = `
            <img
                src="${book.coverData}"
                alt="${escapeHtml(book.title)}"
                style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                "
            >
        `;

    } else {

        cover.innerHTML = `
            <div class="book-symbol">
                📘
            </div>

            <span>
                LIBRARY
            </span>
        `;

    }

}


// ==========================================================
// REQUEST BOOK
// ==========================================================

async function requestBook() {

    const token =
        localStorage.getItem("studentToken");


    if (!token) {

        window.location.href =
            "index.html";

        return;

    }


    const params =
        new URLSearchParams(
            window.location.search
        );

    const bookId =
        params.get("bookId");


    if (!bookId) {

        alert(
            "Book ID is missing."
        );

        return;

    }


    const requestButton =
        document.querySelector(
            ".request-btn"
        );


    // ----------------------------------------------
    // CONFIRM REQUEST
    // ----------------------------------------------

    const confirmRequest =
        confirm(
            "Do you want to request this book?"
        );


    if (!confirmRequest) {

        return;

    }


    try {

        if (requestButton) {

            requestButton.disabled =
                true;

            requestButton.textContent =
                "Requesting...";

        }


        const response =
            await fetch(
                `${API_BASE_URL}/api/student/book-requests`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        bookId: bookId
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to submit request."
            );

        }


        alert(
            "Book request submitted successfully!"
        );


        if (requestButton) {

            requestButton.textContent =
                "Request Submitted";

            requestButton.disabled =
                true;

        }


    } catch (error) {

        console.error(
            "Request book error:",
            error
        );


        alert(
            error.message ||
            "Unable to submit book request."
        );


        if (requestButton) {

            requestButton.disabled =
                false;

            requestButton.textContent =
                "Request Book";

        }

    }

}


// ==========================================================
// HELPER - SET TEXT
// ==========================================================

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            value;

    }

}


// ==========================================================
// ERROR DISPLAY
// ==========================================================

function showError(message) {

    const title =
        document.getElementById(
            "book-title"
        );

    if (title) {

        title.textContent =
            "Unable to Load Book";

    }


    const description =
        document.getElementById(
            "book-description"
        );

    if (description) {

        description.textContent =
            message;

    }

}


// ==========================================================
// HTML ESCAPE
// ==========================================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}