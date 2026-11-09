
document.addEventListener("DOMContentLoaded", () => {
    loadBookHistory();
});

async function loadBookHistory() {
    const historyList = document.getElementById("history-list");

    if (!historyList) return;

    const token = localStorage.getItem("studentToken");

    if (!token) {
        historyList.innerHTML = `
            <div class="empty-history">Please login first.</div>
        `;
        return;
    }

    historyList.innerHTML = `
        <div class="empty-history">Loading book history...</div>
    `;

    try {
        const response = await fetch(
            "http://127.0.0.1:5000/api/student/book-requests",
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to load book history.");
        }

        const requests = Array.isArray(data.requests)
            ? data.requests
            : [];

        // Latest activity first
        requests.sort((a, b) =>
            new Date(b.updatedAt || b.createdAt || 0) -
            new Date(a.updatedAt || a.createdAt || 0)
        );

        if (requests.length === 0) {
            historyList.innerHTML = `
                <div class="empty-history">
                    No book history available.
                </div>
            `;
            return;
        }

        historyList.innerHTML = "";

        requests.forEach(request => {
            const row = document.createElement("div");
            row.className = "history-row";

            const status = request.status || "Pending";

            let statusClass = "pending";

            if (status === "Approved") statusClass = "issued";
            if (status === "Rejected") statusClass = "rejected";
            if (status === "Returned") statusClass = "returned";

            const formatDate = value => {
                if (!value) return "—";

                const date = new Date(value);

                if (Number.isNaN(date.getTime())) {
                    return "—";
                }

                return date.toLocaleDateString("en-IN");
            };

            const book = document.createElement("div");
            book.innerHTML = `
                <div class="book-title"></div>
                <div class="book-author"></div>
            `;
            book.querySelector(".book-title").textContent =
                request.title || "Unknown Book";
            book.querySelector(".book-author").textContent =
                request.author || "Unknown Author";

            const student = document.createElement("div");
            student.className = "student-name";
            student.textContent = request.studentName || "Student";

            const issueDate = document.createElement("div");
            issueDate.className = "history-date";
            issueDate.textContent = formatDate(
                request.issuedDate || request.issueDate || request.approvedDate
            );

            const dueDate = document.createElement("div");
            dueDate.className = "history-date";
            dueDate.textContent = formatDate(request.dueDate);

            const returnDate = document.createElement("div");
            returnDate.className = "history-date";
            returnDate.textContent = formatDate(
                request.returnedDate || request.returnDate
            );

            const fine = document.createElement("div");
            fine.className = "history-date";
            fine.textContent = `₹${Number(request.fine || 0)}`;

            const statusCell = document.createElement("div");
            const statusBadge = document.createElement("span");
            statusBadge.className = `status ${statusClass}`;
            statusBadge.textContent = status;
            statusCell.appendChild(statusBadge);

            [
                book,
                student,
                issueDate,
                dueDate,
                returnDate,
                fine,
                statusCell
            ].forEach(cell => row.appendChild(cell));

            historyList.appendChild(row);
        });

    } catch (error) {
        console.error("Book history error:", error);

        historyList.innerHTML = `
            <div class="empty-history">
                Unable to load book history.
                <br>
                <small>${escapeHistoryText(error.message)}</small>
            </div>
        `;
    }
}

function escapeHistoryText(value) {
    const element = document.createElement("span");
    element.textContent = String(value || "");
    return element.innerHTML;
}
