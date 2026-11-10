document.addEventListener("DOMContentLoaded", function () {

    const API_URL = API_BASE_URL;
    const token = localStorage.getItem("superAdminToken");

    if (!token) {
        window.location.replace("super-admin-login.html");
        return;
    }

    let adminRequests = [];
    let colleges = [];
    let pendingColleges = [];
    let admins = [];
    let superAdminProfile = null;

    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".content-section");

    const pageTitle = document.getElementById("pageTitle");
    const requestList = document.getElementById("adminRequestList");
    const recentRequests = document.getElementById("recentRequests");
    const requestSearch = document.getElementById("requestSearch");
    const statusFilter = document.getElementById("statusFilter");

    const sidebarPendingCount = document.getElementById("sidebarPendingCount");
    const notificationBadge = document.getElementById("notificationBadge");
    const notificationButton = document.getElementById("notificationButton");
    const notificationDropdown = document.getElementById("notificationDropdown");
    const notificationList = document.getElementById("notificationList");
    const notificationViewAll = document.getElementById("notificationViewAll");

    const profileButton = document.getElementById("profileButton");
    const profileDropdown = document.getElementById("profileDropdown");

    const mobileMenu = document.getElementById("mobileMenu");
    const sidebar = document.querySelector(".sidebar");

    /* =====================================================
       AUTHENTICATED FETCH
    ===================================================== */

    async function authenticatedFetch(url, options = {}) {

        const currentToken = localStorage.getItem("superAdminToken");

        if (!currentToken) {
            window.location.replace("super-admin-login.html");
            throw new Error("Super Admin session expired.");
        }

        const headers = {
            ...(options.headers || {}),
            "Authorization": `Bearer ${currentToken}`,
            "Accept": "application/json"
        };

        if (!(options.body instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {

            localStorage.removeItem("superAdminToken");
            localStorage.removeItem("superAdmin");
            localStorage.removeItem("loggedInUser");

            window.location.replace("super-admin-login.html");

            throw new Error(
                "Super Admin session expired. Please login again."
            );
        }

        return response;
    }


    async function readJson(response) {

        const type = response.headers.get("content-type") || "";

        if (!type.includes("application/json")) {

            const text = await response.text();

            console.error(
                "Backend returned non-JSON:",
                text
            );

            throw new Error(
                `Backend returned HTML/non-JSON. HTTP ${response.status}`
            );
        }

        return response.json();
    }


    /* =====================================================
       SECURITY
    ===================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function statusHTML(status) {

        const cls = String(status || "")
            .toLowerCase()
            .replace(/\s+/g, "-");

        return `
            <span class="sa-status ${cls}">
                ${escapeHTML(status || "Unknown")}
            </span>
        `;
    }


    /* =====================================================
       DASHBOARD STATS
    ===================================================== */

    async function loadDashboardStats() {

        try {

            const response = await authenticatedFetch(
                `${API_URL}/api/super-admin/dashboard-stats`
            );

            const data = await readJson(response);

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to load dashboard statistics."
                );
            }

            const stats = data.stats || {};

            const totalColleges =
                document.getElementById("totalColleges");

            const pendingCollegesElement =
                document.getElementById("pendingColleges");

            const approvedColleges =
                document.getElementById("approvedColleges");

            const totalAdmins =
                document.getElementById("totalAdmins");


            if (totalColleges) {
                totalColleges.textContent =
                    stats.totalColleges ?? 0;
            }

            if (pendingCollegesElement) {
                pendingCollegesElement.textContent =
                    stats.pendingColleges ?? 0;
            }

            if (approvedColleges) {
                approvedColleges.textContent =
                    stats.approvedColleges ?? 0;
            }

            if (totalAdmins) {
                totalAdmins.textContent =
                    stats.totalAdmins ?? 0;
            }

            if (sidebarPendingCount) {
                sidebarPendingCount.textContent =
                    stats.pendingRequests ?? 0;
            }

            if (notificationBadge) {
                notificationBadge.textContent =
                    stats.pendingRequests ?? 0;
            }

        } catch (error) {

            console.error(
                "Dashboard Stats Error:",
                error
            );

            /*
             * Don't crash the dashboard if stats API
             * is temporarily unavailable.
             */
        }
    }


    /* =====================================================
       ADMIN REQUESTS
    ===================================================== */

    async function loadAdminRequests() {

        try {

            if (requestList) {
                requestList.innerHTML =
                    `<div class="loading-card">
                        Loading admin requests...
                    </div>`;
            }

            const response = await authenticatedFetch(
                `${API_URL}/api/super-admin/admin-requests`
            );

            const data = await readJson(response);

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to load requests."
                );
            }

            adminRequests =
                Array.isArray(data.requests)
                    ? data.requests
                    : [];

            renderRecentRequests();
            renderRequests();
            renderNotifications();

        } catch (error) {

            console.error(
                "Load Admin Requests Error:",
                error
            );

            if (requestList) {
                requestList.innerHTML = `
                    <div class="loading-card">
                        Unable to load admin requests.
                        <br><br>
                        ${escapeHTML(error.message)}
                    </div>
                `;
            }

            if (recentRequests) {
                recentRequests.innerHTML = `
                    <tr>
                        <td colspan="5"
                            class="empty-state">
                            ${escapeHTML(error.message)}
                        </td>
                    </tr>
                `;
            }
        }
    }


    function renderRecentRequests() {

        if (!recentRequests) return;

        const recent =
            [...adminRequests]
                .sort(
                    (a, b) =>
                        new Date(b.createdAt) -
                        new Date(a.createdAt)
                )
                .slice(0, 5);


        if (!recent.length) {

            recentRequests.innerHTML = `
                <tr>
                    <td colspan="5"
                        class="empty-state">
                        No admin requests available.
                    </td>
                </tr>
            `;

            return;
        }


        recentRequests.innerHTML =
            recent.map(request => `
                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(request.applicantName)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(request.collegeName)}
                    </td>

                    <td>
                        ${escapeHTML(request.officialEmail)}
                    </td>

                    <td>
                        ${statusHTML(request.status)}
                    </td>

                    <td>
                        <button
                            class="action-button action-view"
                            onclick="viewRequest('${escapeHTML(request.requestId)}')">
                            View
                        </button>
                    </td>

                </tr>
            `).join("");
    }


    function renderRequests() {

        if (!requestList || !requestSearch || !statusFilter) {
            return;
        }

        const search =
            requestSearch.value
                .trim()
                .toLowerCase();

        const selectedStatus =
            statusFilter.value;


        const filtered =
            adminRequests.filter(request => {

                const text = [
                    request.requestId,
                    request.applicantName,
                    request.collegeName,
                    request.officialEmail,
                    request.designation
                ]
                    .map(v =>
                        String(v || "").toLowerCase()
                    )
                    .join(" ");

                const matchesSearch =
                    !search ||
                    text.includes(search);

                const matchesStatus =
                    selectedStatus === "All" ||
                    request.status === selectedStatus;

                return matchesSearch &&
                       matchesStatus;
            });


        if (!filtered.length) {

            requestList.innerHTML = `
                <div class="loading-card">
                    No matching admin requests found.
                </div>
            `;

            return;
        }


        requestList.innerHTML =
            filtered.map(request => {

                let actions = `
                    <button
                        class="action-button action-view"
                        onclick="viewRequest('${escapeHTML(request.requestId)}')">
                        View
                    </button>
                `;


                if (request.status === "Pending") {

                    actions += `
                        <button
                            class="action-button action-approve"
                            onclick="approveRequest('${escapeHTML(request.requestId)}')">
                            Approve
                        </button>

                        <button
                            class="action-button action-reject"
                            onclick="rejectRequest('${escapeHTML(request.requestId)}')">
                            Reject
                        </button>
                    `;
                }


                return `
                    <div class="request-card">

                        <div class="request-main">
                            <h3>
                                ${escapeHTML(request.applicantName)}
                            </h3>

                            <p>
                                ${escapeHTML(request.designation)}
                            </p>
                        </div>

                        <div class="request-detail">
                            <span>College</span>
                            <strong>
                                ${escapeHTML(request.collegeName)}
                            </strong>
                        </div>

                        <div class="request-detail">
                            <span>Official Email</span>
                            <strong>
                                ${escapeHTML(request.officialEmail)}
                            </strong>
                        </div>

                        <div>
                            ${statusHTML(request.status)}

                            <div class="request-actions">
                                ${actions}
                            </div>
                        </div>

                    </div>
                `;

            }).join("");
    }


    /* =====================================================
       NOTIFICATIONS
    ===================================================== */

    function renderNotifications() {

        if (!notificationList) return;

        const pending =
            adminRequests.filter(
                r => r.status === "Pending"
            );


        if (notificationBadge) {
            notificationBadge.textContent =
                pending.length;
        }

        if (sidebarPendingCount) {
            sidebarPendingCount.textContent =
                pending.length;
        }


        if (!pending.length) {

            notificationList.innerHTML = `
                <div class="notification-empty">
                    No pending admin requests.
                </div>
            `;

            return;
        }


        notificationList.innerHTML =
            pending
                .slice(0, 8)
                .map(request => `
                    <div
                        class="notification-item"
                        onclick="openNotificationRequest('${escapeHTML(request.requestId)}')">

                        <strong>
                            New admin request
                        </strong>

                        <span>
                            ${escapeHTML(request.applicantName)}
                            •
                            ${escapeHTML(request.collegeName)}
                        </span>

                    </div>
                `)
                .join("");
    }


    window.openNotificationRequest =
        function (requestId) {

            notificationDropdown.classList.remove(
                "show"
            );

            showSection("admin-requests");

            if (statusFilter) {
                statusFilter.value = "Pending";
            }

            renderRequests();
            viewRequest(requestId);
        };


    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                notificationDropdown.classList.toggle(
                    "show"
                );

                profileDropdown.classList.remove(
                    "show"
                );
            }
        );
    }


    if (notificationViewAll) {

        notificationViewAll.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                notificationDropdown.classList.remove(
                    "show"
                );

                showSection("admin-requests");
            }
        );
    }


    /* =====================================================
       REQUEST FILE PREVIEW
    ===================================================== */

    async function loadRequestImage(
        requestId,
        fileType,
        imgId,
        loadingId
    ) {

        try {

            const response =
                await authenticatedFetch(
                    `${API_URL}/api/super-admin/admin-requests/${encodeURIComponent(requestId)}/file/${encodeURIComponent(fileType)}`
                );


            if (!response.ok) {

                const type =
                    response.headers.get(
                        "content-type"
                    ) || "";

                let message =
                    `File request failed (HTTP ${response.status}).`;


                if (type.includes("application/json")) {

                    const data =
                        await response
                            .json()
                            .catch(() => ({}));

                    message =
                        data.message ||
                        message;
                }

                throw new Error(message);
            }


            const blob =
                await response.blob();

            const url =
                URL.createObjectURL(blob);


            const img =
                document.getElementById(imgId);

            const loading =
                document.getElementById(loadingId);


            if (img) {

                img.src = url;
                img.style.display = "block";
            }


            if (loading) {
                loading.style.display = "none";
            }

        } catch (error) {

            const loading =
                document.getElementById(loadingId);

            if (loading) {
                loading.textContent =
                    error.message ||
                    "Document could not be loaded.";
            }
        }
    }


    /* =====================================================
       VIEW REQUEST
    ===================================================== */

    window.viewRequest =
        function (requestId) {

            const request =
                adminRequests.find(
                    item =>
                        item.requestId === requestId
                );


            if (!request) return;


            document.getElementById(
                "modalTitle"
            ).textContent =
                request.applicantName ||
                "Admin Request";


            const details =
                document.getElementById(
                    "modalDetails"
                );

            const actions =
                document.getElementById(
                    "modalActions"
                );


            const collegeId =
                request.collegeId ||
                "Not assigned yet";


            details.innerHTML = `

                <div class="modal-detail">
                    <span>Request ID</span>
                    <strong>
                        ${escapeHTML(request.requestId)}
                    </strong>
                </div>

                <div class="modal-detail">
                    <span>College</span>
                    <strong>
                        ${escapeHTML(request.collegeName)}
                    </strong>
                </div>

                <div class="modal-detail">
                    <span>College ID</span>
                    <strong>
                        ${escapeHTML(collegeId)}
                    </strong>
                </div>

                <div class="modal-detail">
                    <span>Applicant</span>
                    <strong>
                        ${escapeHTML(request.applicantName)}
                    </strong>
                </div>

                <div class="modal-detail">
                    <span>Designation</span>
                    <strong>
                        ${escapeHTML(request.designation)}
                    </strong>
                </div>

                <div class="modal-detail">
                    <span>Official Email</span>
                    <strong>
                        ${escapeHTML(request.officialEmail)}
                    </strong>
                </div>

                <div class="modal-detail">
                    <span>Phone</span>
                    <strong>
                        ${escapeHTML(request.phone)}
                    </strong>
                </div>

                <div class="modal-detail">
                    <span>Email Verified</span>
                    <strong>
                        ${request.emailVerified ? "Yes" : "No"}
                    </strong>
                </div>

                <div class="modal-detail">
                    <span>Status</span>
                    <strong>
                        ${escapeHTML(request.status)}
                    </strong>
                </div>

                <div class="verification-grid">

                    <div class="verification-box">

                        <h4>Applicant Photo</h4>

                        <div
                            id="photoLoading"
                            class="file-loading">
                            Loading photo...
                        </div>

                        <img
                            id="requestPhoto"
                            alt="Applicant photo"
                            style="display:none;">

                    </div>


                    <div class="verification-box">

                        <h4>College Staff ID Card</h4>

                        <div
                            id="idCardLoading"
                            class="file-loading">
                            Loading ID card...
                        </div>

                        <img
                            id="requestIdCard"
                            alt="College staff ID card"
                            style="display:none;">

                    </div>

                </div>
            `;


            actions.innerHTML = "";


            if (request.status === "Pending") {

                actions.innerHTML = `

                    <button
                        class="action-button action-approve"
                        onclick="approveRequest('${escapeHTML(request.requestId)}'); closeRequestModal();">
                        Approve
                    </button>

                    <button
                        class="action-button action-reject"
                        onclick="rejectRequest('${escapeHTML(request.requestId)}'); closeRequestModal();">
                        Reject
                    </button>

                `;
            }


            document
                .getElementById("requestModal")
                .classList.add("show");


            loadRequestImage(
                request.requestId,
                "photo",
                "requestPhoto",
                "photoLoading"
            );


            loadRequestImage(
                request.requestId,
                "staffIdCard",
                "requestIdCard",
                "idCardLoading"
            );
        };


    /* =====================================================
       APPROVE REQUEST
    ===================================================== */

    window.approveRequest =
        async function (requestId) {

            if (
                !confirm(
                    "Are you sure you want to approve this college admin request?"
                )
            ) {
                return;
            }


            try {

                const response =
                    await authenticatedFetch(
                        `${API_URL}/api/super-admin/admin-requests/${encodeURIComponent(requestId)}/approve`,
                        {
                            method: "PUT",
                            body: JSON.stringify({})
                        }
                    );


                const data =
                    await readJson(response);


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Approval failed."
                    );
                }


                alert(
                    `${data.message}

College ID: ${data.college?.collegeId || "-"}
Admin ID: ${data.admin?.adminId || "-"}
Username: ${data.admin?.username || "-"}
Temporary Password: ${data.admin?.temporaryPassword || "-"}`
                );


                await refreshEverything();

            } catch (error) {

                console.error(
                    "Approve Error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to approve request."
                );
            }
        };


    /* =====================================================
       REJECT REQUEST
    ===================================================== */

    window.rejectRequest =
        async function (requestId) {

            if (
                !confirm(
                    "Are you sure you want to reject this college admin request?"
                )
            ) {
                return;
            }


            try {

                const response =
                    await authenticatedFetch(
                        `${API_URL}/api/super-admin/admin-requests/${encodeURIComponent(requestId)}/reject`,
                        {
                            method: "PUT",
                            body: JSON.stringify({})
                        }
                    );


                const data =
                    await readJson(response);


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Rejection failed."
                    );
                }


                alert(
                    data.message ||
                    "Admin request rejected."
                );


                await refreshEverything();

            } catch (error) {

                console.error(
                    "Reject Error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to reject request."
                );
            }
        };


    /* =====================================================
       COLLEGES
    ===================================================== */

    async function loadColleges() {

        try {

            const response =
                await authenticatedFetch(
                    `${API_URL}/api/super-admin/colleges`
                );


            const data =
                await readJson(response);


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load colleges."
                );
            }


            colleges =
                Array.isArray(data.colleges)
                    ? data.colleges
                    : [];


            pendingColleges =
                Array.isArray(data.pendingColleges)
                    ? data.pendingColleges
                    : [];


            renderCollegeFilter();
            renderColleges();

        } catch (error) {

            console.error(
                "College load error:",
                error
            );


            const body =
                document.getElementById(
                    "collegeListBody"
                );


            if (body) {

                body.innerHTML = `
                    <tr>
                        <td colspan="6"
                            class="empty-state">
                            ${escapeHTML(error.message)}
                        </td>
                    </tr>
                `;
            }
        }
    }


    /* =====================================================
       COLLEGE FILTER OPTIONS
    ===================================================== */

    function renderCollegeFilter() {

        const filter =
            document.getElementById(
                "collegeStatusFilter"
            );

        if (!filter) return;


        const requiredOptions = [
            "All",
            "Pending",
            "Approved",
            "Blocked",
            "Removed"
        ];


        const currentValue =
            filter.value || "All";


        filter.innerHTML =
            requiredOptions.map(status => `
                <option value="${status}">
                    ${status}
                </option>
            `).join("");


        if (
            requiredOptions.includes(
                currentValue
            )
        ) {
            filter.value = currentValue;
        } else {
            filter.value = "All";
        }
    }


    /* =====================================================
       RENDER COLLEGES
    ===================================================== */

    function renderColleges() {

        const body =
            document.getElementById(
                "collegeListBody"
            );

        if (!body) return;


        const searchInput =
            document.getElementById(
                "collegeSearch"
            );

        const filterInput =
            document.getElementById(
                "collegeStatusFilter"
            );


        const search =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        const filter =
            filterInput
                ? filterInput.value
                : "All";


        let data = [];


        /*
         * Pending colleges are generally returned
         * separately by backend.
         */

        if (filter === "Pending") {

            data =
                pendingColleges.map(
                    c => ({
                        ...c,
                        status: "Pending",
                        collegeId:
                            c.collegeId ||
                            "Not assigned"
                    })
                );

        } else {

            // data =
            //     colleges.filter(
            //         c =>
            //             filter === "All" ||
            //             c.status === filter
            //     );
            data =
    colleges.filter(c => {

        if (filter === "Approved") {
            return (
                c.status === "Approved" ||
                c.status === "Active"
            );
        }

        return (
            filter === "All" ||
            c.status === filter
        );
    });

        }


        data =
            data.filter(c => {

                const text = [
                    c.collegeId,
                    c.collegeName,
                    c.officialEmail,
                    c.adminName,
                    c.status
                ]
                    .map(v =>
                        String(v || "")
                            .toLowerCase()
                    )
                    .join(" ");


                return (
                    !search ||
                    text.includes(search)
                );
            });


        const title =
            document.getElementById(
                "collegeListTitle"
            );

        const subtitle =
            document.getElementById(
                "collegeListSubtitle"
            );

        const count =
            document.getElementById(
                "collegeListCount"
            );


        if (title) {

            const titles = {
                All: "All Colleges",
                Pending: "Pending Colleges",
                Approved: "Approved Colleges",
                Blocked: "Blocked Colleges",
                Removed: "Removed Colleges"
            };

            title.textContent =
                titles[filter] ||
                "Colleges";
        }


        if (subtitle) {

            const subtitles = {
                All:
                    "All colleges registered in the system.",

                Pending:
                    "These colleges are waiting for Super Admin approval.",

                Approved:
                    "Currently active and approved colleges.",

                Blocked:
                    "Temporarily blocked colleges.",

                Removed:
                    "Removed colleges. These cannot be restored."
            };

            subtitle.textContent =
                subtitles[filter] ||
                "";
        }


        if (count) {
            count.textContent =
                data.length;
        }


        if (!data.length) {

            body.innerHTML = `
                <tr>
                    <td colspan="6"
                        class="empty-state">
                        No colleges found.
                    </td>
                </tr>
            `;

            return;
        }


        body.innerHTML =
            data.map(c => {

                const status =
                    String(c.status || "")
                        .toLowerCase();


                let actions = "";


                /*
                 * Only approved colleges can be blocked.
                 */

             if (
    c.status === "Active" ||
    c.status === "Approved"
) {

                    actions += `
                        <button
                            class="action-button action-reject"
                            onclick="blockCollege('${escapeHTML(c.collegeId)}')">
                            Block
                        </button>

                        <button
                            class="action-button action-delete"
                            onclick="removeCollege('${escapeHTML(c.collegeId)}')">
                            Remove
                        </button>
                    `;
                }


                /*
                 * Blocked college can be unblocked
                 * OR permanently removed.
                 */

                else if (c.status === "Blocked") {

                    actions += `
                        <button
                            class="action-button action-approve"
                            onclick="unblockCollege('${escapeHTML(c.collegeId)}')">
                            Unblock
                        </button>

                        <button
                            class="action-button action-delete"
                            onclick="removeCollege('${escapeHTML(c.collegeId)}')">
                            Remove
                        </button>
                    `;
                }


                /*
                 * Pending college has no block/remove
                 * action until approval.
                 */

                else if (c.status === "Pending") {

                    actions = `
                        <span class="sa-muted">
                            Awaiting approval
                        </span>
                    `;
                }


                /*
                 * Removed is permanent in this design.
                 */

                else if (c.status === "Removed") {

                    actions = `
                        <span class="sa-muted">
                            Permanently removed
                        </span>
                    `;
                }


                return `
                    <tr>

                        <td>
                            <strong>
                                ${escapeHTML(
                                    c.collegeId ||
                                    "Not assigned"
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHTML(
                                c.collegeName
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                c.officialEmail ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                c.adminName ||
                                "Pending"
                            )}
                        </td>

                        <td>
                            ${statusHTML(
                                c.status
                            )}
                        </td>

                        <td>
                            <div class="college-actions">
                                ${actions}
                            </div>
                        </td>

                    </tr>
                `;

            }).join("");
    }


    /* =====================================================
       BLOCK COLLEGE
    ===================================================== */

    window.blockCollege =
        async function (collegeId) {

            if (!collegeId) return;


            const confirmBlock =
                confirm(
                    `Block college ${collegeId}?\n\n` +
                    `The college admin and its students will also be blocked.`
                );


            if (!confirmBlock) return;


            try {

                const response =
                    await authenticatedFetch(
                        `${API_URL}/api/super-admin/colleges/${encodeURIComponent(collegeId)}/block`,
                        {
                            method: "PUT",
                            body: JSON.stringify({})
                        }
                    );


                const data =
                    await readJson(response);


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to block college."
                    );
                }


                alert(
                    data.message ||
                    "College blocked successfully."
                );


                await refreshEverything();

            } catch (error) {

                console.error(
                    "Block College Error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to block college."
                );
            }
        };


    /* =====================================================
       UNBLOCK COLLEGE
    ===================================================== */

    window.unblockCollege =
        async function (collegeId) {

            if (!collegeId) return;


            const confirmUnblock =
                confirm(
                    `Unblock college ${collegeId}?\n\n` +
                    `The college will become Approved again and blocked accounts will be activated.`
                );


            if (!confirmUnblock) return;


            try {

                const response =
                    await authenticatedFetch(
                        `${API_URL}/api/super-admin/colleges/${encodeURIComponent(collegeId)}/unblock`,
                        {
                            method: "PUT",
                            body: JSON.stringify({})
                        }
                    );


                const data =
                    await readJson(response);


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to unblock college."
                    );
                }


                alert(
                    data.message ||
                    "College unblocked successfully."
                );


                await refreshEverything();

            } catch (error) {

                console.error(
                    "Unblock College Error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to unblock college."
                );
            }
        };


    /* =====================================================
       REMOVE COLLEGE
    ===================================================== */

    window.removeCollege =
        async function (collegeId) {

            if (!collegeId) return;


            const confirmed =
                confirm(
                    `Remove college ${collegeId}?\n\n` +
                    `This will block its admin and students.\n` +
                    `The college will be permanently marked as Removed and cannot be unblocked.`
                );


            if (!confirmed) return;


            /*
             * Second confirmation prevents accidental removal.
             */

            const finalConfirm =
                confirm(
                    "Final confirmation:\n\n" +
                    "Are you sure you want to remove this college?"
                );


            if (!finalConfirm) return;


            try {

                const response =
                    await authenticatedFetch(
                        `${API_URL}/api/super-admin/colleges/${encodeURIComponent(collegeId)}/remove`,
                        {
                            method: "PUT",
                            body: JSON.stringify({})
                        }
                    );


                const data =
                    await readJson(response);


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to remove college."
                    );
                }


                alert(
                    data.message ||
                    "College removed successfully."
                );


                await refreshEverything();

            } catch (error) {

                console.error(
                    "Remove College Error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to remove college."
                );
            }
        };


    /* =====================================================
       ADMINS
    ===================================================== */

    async function loadAdmins() {

        try {

            const response =
                await authenticatedFetch(
                    `${API_URL}/api/super-admin/admins`
                );


            const data =
                await readJson(response);


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load administrators."
                );
            }


            admins =
                Array.isArray(data.admins)
                    ? data.admins
                    : [];


            renderAdmins();

        } catch (error) {

            console.error(
                "Admin load error:",
                error
            );


            const body =
                document.getElementById(
                    "adminListBody"
                );


            if (body) {

                body.innerHTML = `
                    <tr>
                        <td colspan="5"
                            class="empty-state">
                            ${escapeHTML(error.message)}
                        </td>
                    </tr>
                `;
            }
        }
    }


    function renderAdmins() {

        const body =
            document.getElementById(
                "adminListBody"
            );

        if (!body) return;


        const searchInput =
            document.getElementById(
                "adminSearch"
            );


        const search =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        const data =
            admins.filter(admin => {

                const text = [
                    admin.adminId,
                    admin.name,
                    admin.username,
                    admin.email,
                    admin.collegeId,
                    admin.collegeName,
                    admin.status
                ]
                    .map(v =>
                        String(v || "")
                            .toLowerCase()
                    )
                    .join(" ");


                return (
                    !search ||
                    text.includes(search)
                );
            });


        const count =
            document.getElementById(
                "adminListCount"
            );


        if (count) {
            count.textContent =
                data.length;
        }


        if (!data.length) {

            body.innerHTML = `
                <tr>
                    <td colspan="5"
                        class="empty-state">
                        No college administrators found.
                    </td>
                </tr>
            `;

            return;
        }


        body.innerHTML =
            data.map(admin => `
                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(
                                admin.adminId
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            admin.name
                        )}
                        <br>
                        <span class="sa-muted">
                            @${escapeHTML(
                                admin.username
                            )}
                        </span>
                    </td>

                    <td>
                        ${escapeHTML(
                            admin.collegeId
                        )}
                        <br>
                        <span class="sa-muted">
                            ${escapeHTML(
                                admin.collegeName ||
                                ""
                            )}
                        </span>
                    </td>

                    <td>
                        ${escapeHTML(
                            admin.email
                        )}
                    </td>

                    <td>
                        ${statusHTML(
                            admin.status
                        )}
                    </td>

                </tr>
            `).join("");
    }

/* =====================================================
   SUPER ADMIN PROFILE
===================================================== */

function updateProfileHeader(profile) {

    const name =
        profile?.name || "Super Admin";

    const username =
        profile?.username || "System Owner";

    const initials =
        name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(word =>
                word.charAt(0).toUpperCase()
            )
            .join("") || "SA";


    const profileButtonName =
        document.querySelector(
            "#profileButton .profile-info strong"
        );

    const profileButtonUsername =
        document.querySelector(
            "#profileButton .profile-info span"
        );

    const profileButtonAvatar =
        document.querySelector(
            "#profileButton .profile-avatar"
        );


    const dropdownName =
        document.querySelector(
            "#profileDropdown .dropdown-header strong"
        );

    const dropdownUsername =
        document.querySelector(
            "#profileDropdown .dropdown-header span"
        );

    const dropdownAvatar =
        document.querySelector(
            "#profileDropdown .dropdown-avatar"
        );


    if (profileButtonName) {
        profileButtonName.textContent = name;
    }

    if (profileButtonUsername) {
        profileButtonUsername.textContent =
            username;
    }

    if (profileButtonAvatar) {
        profileButtonAvatar.textContent =
            initials;
    }


    if (dropdownName) {
        dropdownName.textContent = name;
    }

    if (dropdownUsername) {
        dropdownUsername.textContent =
            username;
    }

    if (dropdownAvatar) {
        dropdownAvatar.textContent =
            initials;
    }
}


/* =====================================================
   PROFILE MESSAGE
===================================================== */

function showProfileMessage(
    message,
    type = "info"
) {

    const box =
        document.getElementById(
            "profileMessage"
        );

    if (!box) {
        return;
    }

    box.textContent =
        message || "";

    box.className =
        `profile-message ${type}`;

    box.style.display =
        "block";
}


/* =====================================================
   CREATE PROFILE FORM
===================================================== */

function createProfileForm() {

    const settingsSection =
        document.getElementById(
            "settings"
        );

    if (!settingsSection) {
        console.error(
            "Settings section not found."
        );
        return;
    }


    if (
        document.getElementById(
            "superAdminProfileCard"
        )
    ) {
        return;
    }


    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.id =
        "superAdminProfileCard";

    wrapper.className =
        "profile-edit-card";


    wrapper.innerHTML = `

        <div class="profile-card">

            <!-- HEADER -->

            <div class="profile-card-header">

                <div>

                    <span class="profile-section-label">
                        ACCOUNT
                    </span>

                    <h3>
                        Super Admin Profile
                    </h3>

                    <p>
                        Change your account details separately.
                    </p>

                </div>


                <div
                    class="profile-card-avatar"
                    id="profileCardAvatar">

                    SA

                </div>

            </div>


            <!-- MESSAGE -->

            <div
                id="profileMessage"
                class="profile-message"
                style="display:none;">
            </div>


            <!-- =================================================
                 NAME
            ================================================== -->

            <div class="profile-edit-row">

                <div class="profile-edit-info">

                    <label>
                        Full Name
                    </label>

                    <span id="currentProfileName">
                        Loading...
                    </span>

                </div>


                <div class="profile-edit-control">

                    <input
                        type="text"
                        id="profileNameInput"
                        placeholder="Enter new name"
                    >

                    <button
                        type="button"
                        class="profile-action-button"
                        id="changeNameButton">

                        Change Name

                    </button>

                </div>

            </div>


            <!-- =================================================
                 USERNAME
            ================================================== -->

            <div class="profile-edit-row">

                <div class="profile-edit-info">

                    <label>
                        Username
                    </label>

                    <span id="currentProfileUsername">
                        Loading...
                    </span>

                </div>


                <div class="profile-edit-control">

                    <input
                        type="text"
                        id="profileUsernameInput"
                        placeholder="Enter new username"
                    >

                    <button
                        type="button"
                        class="profile-action-button"
                        id="changeUsernameButton">

                        Change Username

                    </button>

                </div>

            </div>


            <!-- =================================================
                 EMAIL
            ================================================== -->

            <div class="profile-edit-row">

                <div class="profile-edit-info">

                    <label>
                        Email
                    </label>

                    <span id="currentProfileEmail">
                        Loading...
                    </span>

                </div>


                <div class="profile-edit-control">

                    <input
                        type="email"
                        id="profileEmailInput"
                        placeholder="Enter new email"
                    >


                    <button
                        type="button"
                        class="profile-action-button"
                        id="sendEmailOtpButton">

                        Send OTP

                    </button>


                    <div
                        id="emailOtpArea"
                        class="email-otp-area"
                        style="display:none;">

                        <input
                            type="text"
                            id="profileEmailOtp"
                            maxlength="6"
                            inputmode="numeric"
                            placeholder="Enter 6-digit OTP"
                        >


                        <button
                            type="button"
                            class="profile-action-button success-button"
                            id="verifyEmailButton">

                            Verify & Change Email

                        </button>

                    </div>

                </div>

            </div>


            <!-- =================================================
                 PASSWORD
            ================================================== -->

            <div class="profile-edit-row">

                <div class="profile-edit-info">

                    <label>
                        Password
                    </label>

                    <span>
                        Current password is required.
                    </span>

                </div>


                <div class="profile-edit-control">

                    <input
                        type="password"
                        id="profileCurrentPasswordInput"
                        placeholder="Current password"
                    >


                    <input
                        type="password"
                        id="profileNewPasswordInput"
                        placeholder="New password (8+ characters)"
                    >


                    <input
                        type="password"
                        id="profileConfirmPasswordInput"
                        placeholder="Confirm new password"
                    >


                    <button
                        type="button"
                        class="profile-action-button"
                        id="changePasswordButton">

                        Change Password

                    </button>

                </div>

            </div>

        </div>
    `;


    settingsSection.appendChild(
        wrapper
    );


    /* =================================================
       BUTTON EVENTS
    ================================================== */

    const nameButton =
        document.getElementById(
            "changeNameButton"
        );

    const usernameButton =
        document.getElementById(
            "changeUsernameButton"
        );

    const sendEmailOtpButton =
        document.getElementById(
            "sendEmailOtpButton"
        );

    const verifyEmailButton =
        document.getElementById(
            "verifyEmailButton"
        );

    const passwordButton =
        document.getElementById(
            "changePasswordButton"
        );


    if (nameButton) {

        nameButton.addEventListener(
            "click",
            changeSuperAdminName
        );

    }


    if (usernameButton) {

        usernameButton.addEventListener(
            "click",
            changeSuperAdminUsername
        );

    }


    if (sendEmailOtpButton) {

        sendEmailOtpButton.addEventListener(
            "click",
            sendSuperAdminEmailOTP
        );

    }


    if (verifyEmailButton) {

        verifyEmailButton.addEventListener(
            "click",
            verifySuperAdminEmailOTP
        );

    }


    if (passwordButton) {

        passwordButton.addEventListener(
            "click",
            changeSuperAdminPassword
        );

    }
}


/* =====================================================
   FILL PROFILE
===================================================== */

function fillProfileForm(profile) {

    createProfileForm();


    const name =
        document.getElementById(
            "currentProfileName"
        );

    const username =
        document.getElementById(
            "currentProfileUsername"
        );

    const email =
        document.getElementById(
            "currentProfileEmail"
        );

    const avatar =
        document.getElementById(
            "profileCardAvatar"
        );


    if (name) {

        name.textContent =
            profile?.name ||
            "Not available";

    }


    if (username) {

        username.textContent =
            profile?.username ||
            "Not available";

    }


    if (email) {

        email.textContent =
            profile?.email ||
            "Not available";

    }


    if (avatar) {

        const initials =
            (profile?.name || "Super Admin")
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map(word =>
                    word.charAt(0).toUpperCase()
                )
                .join("") || "SA";

        avatar.textContent =
            initials;
    }
}


/* =====================================================
   UPDATE LOCAL PROFILE
===================================================== */

function updateLocalProfile(profile) {

    if (!profile) {
        return;
    }


    superAdminProfile =
        profile;


    localStorage.setItem(
        "superAdmin",
        JSON.stringify(profile)
    );


    updateProfileHeader(
        profile
    );


    fillProfileForm(
        profile
    );
}


/* =====================================================
   LOAD PROFILE
===================================================== */

async function loadSuperAdminProfile() {

    try {

        const response =
            await authenticatedFetch(
                `${API_URL}/api/super-admin/profile`
            );


        const data =
            await readJson(response);


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load profile."
            );

        }


        const profile =
            data.profile ||
            data.superAdmin ||
            null;


        if (profile) {

            updateLocalProfile(
                profile
            );

        }

    } catch (error) {

        console.error(
            "Profile Load Error:",
            error
        );


        showProfileMessage(
            error.message ||
            "Unable to load profile.",
            "error"
        );
    }
}


/* =====================================================
   CHANGE NAME
===================================================== */

async function changeSuperAdminName() {

    const input =
        document.getElementById(
            "profileNameInput"
        );


    const name =
        input?.value.trim();


    if (!name) {

        showProfileMessage(
            "Enter a name first.",
            "error"
        );

        return;
    }


    try {

        showProfileMessage(
            "Updating name...",
            "info"
        );


        const response =
            await authenticatedFetch(
                `${API_URL}/api/super-admin/profile/name`,
                {
                    method: "PUT",

                    body: JSON.stringify({
                        name
                    })
                }
            );


        const data =
            await readJson(response);


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to change name."
            );

        }


        updateLocalProfile(
            data.profile
        );


        input.value = "";


        showProfileMessage(
            data.message ||
            "Name changed successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Change Name Error:",
            error
        );


        showProfileMessage(
            error.message ||
            "Unable to change name.",
            "error"
        );
    }
}


/* =====================================================
   CHANGE USERNAME
===================================================== */

async function changeSuperAdminUsername() {

    const input =
        document.getElementById(
            "profileUsernameInput"
        );


    const username =
        input?.value.trim();


    if (!username) {

        showProfileMessage(
            "Enter a username first.",
            "error"
        );

        return;
    }


    try {

        showProfileMessage(
            "Updating username...",
            "info"
        );


        const response =
            await authenticatedFetch(
                `${API_URL}/api/super-admin/profile/username`,
                {
                    method: "PUT",

                    body: JSON.stringify({
                        username
                    })
                }
            );


        const data =
            await readJson(response);


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to change username."
            );

        }


        updateLocalProfile(
            data.profile
        );


        input.value = "";


        showProfileMessage(
            data.message ||
            "Username changed successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Change Username Error:",
            error
        );


        showProfileMessage(
            error.message ||
            "Unable to change username.",
            "error"
        );
    }
}


/* =====================================================
   SEND EMAIL OTP
===================================================== */

async function sendSuperAdminEmailOTP() {

    const input =
        document.getElementById(
            "profileEmailInput"
        );


    const newEmail =
        input?.value.trim().toLowerCase();


    if (!newEmail) {

        showProfileMessage(
            "Enter the new email address first.",
            "error"
        );

        return;
    }


    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            newEmail
        )
    ) {

        showProfileMessage(
            "Enter a valid email address.",
            "error"
        );

        return;
    }


    try {

        showProfileMessage(
            "Sending OTP to the new email...",
            "info"
        );


        const response =
            await authenticatedFetch(
                `${API_URL}/api/super-admin/profile/email/send-otp`,
                {
                    method: "POST",

                    body: JSON.stringify({
                        newEmail
                    })
                }
            );


        const data =
            await readJson(response);


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to send email OTP."
            );

        }


        const otpArea =
            document.getElementById(
                "emailOtpArea"
            );


        if (otpArea) {

            otpArea.style.display =
                "flex";

        }


        showProfileMessage(
            data.message ||
            "OTP sent to the new email.",
            "success"
        );


    } catch (error) {

        console.error(
            "Send Email OTP Error:",
            error
        );


        showProfileMessage(
            error.message ||
            "Unable to send email OTP.",
            "error"
        );
    }
}


/* =====================================================
   VERIFY EMAIL OTP
===================================================== */

async function verifySuperAdminEmailOTP() {

    const emailInput =
        document.getElementById(
            "profileEmailInput"
        );


    const otpInput =
        document.getElementById(
            "profileEmailOtp"
        );


    const newEmail =
        emailInput?.value.trim().toLowerCase();


    const otp =
        otpInput?.value.trim();


    if (!newEmail || !otp) {

        showProfileMessage(
            "Enter the new email and OTP.",
            "error"
        );

        return;
    }


    if (!/^\d{6}$/.test(otp)) {

        showProfileMessage(
            "OTP must contain 6 digits.",
            "error"
        );

        return;
    }


    try {

        showProfileMessage(
            "Verifying OTP...",
            "info"
        );


        const response =
            await authenticatedFetch(
                `${API_URL}/api/super-admin/profile/email/verify`,
                {
                    method: "PUT",

                    body: JSON.stringify({
                        newEmail,
                        otp
                    })
                }
            );


        const data =
            await readJson(response);


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to verify email OTP."
            );

        }


        updateLocalProfile(
            data.profile
        );


        emailInput.value = "";

        otpInput.value = "";


        const otpArea =
            document.getElementById(
                "emailOtpArea"
            );


        if (otpArea) {

            otpArea.style.display =
                "none";

        }


        showProfileMessage(
            data.message ||
            "Email changed successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Verify Email OTP Error:",
            error
        );


        showProfileMessage(
            error.message ||
            "Unable to verify email OTP.",
            "error"
        );
    }
}


/* =====================================================
   CHANGE PASSWORD
===================================================== */

async function changeSuperAdminPassword() {

    const currentInput =
        document.getElementById(
            "profileCurrentPasswordInput"
        );


    const newInput =
        document.getElementById(
            "profileNewPasswordInput"
        );


    const confirmInput =
        document.getElementById(
            "profileConfirmPasswordInput"
        );


    const currentPassword =
        currentInput?.value || "";


    const newPassword =
        newInput?.value || "";


    const confirmPassword =
        confirmInput?.value || "";


    if (!currentPassword) {

        showProfileMessage(
            "Enter your current password.",
            "error"
        );

        return;
    }


    if (!newPassword) {

        showProfileMessage(
            "Enter a new password.",
            "error"
        );

        return;
    }


    if (newPassword.length < 8) {

        showProfileMessage(
            "New password must contain at least 8 characters.",
            "error"
        );

        return;
    }


    if (
        newPassword !==
        confirmPassword
    ) {

        showProfileMessage(
            "New password and confirm password do not match.",
            "error"
        );

        return;
    }


    try {

        showProfileMessage(
            "Changing password...",
            "info"
        );


        const response =
            await authenticatedFetch(
                `${API_URL}/api/super-admin/profile/password`,
                {
                    method: "PUT",

                    body: JSON.stringify({
                        currentPassword,
                        newPassword
                    })
                }
            );


        const data =
            await readJson(response);


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to change password."
            );

        }


        currentInput.value = "";

        newInput.value = "";

        confirmInput.value = "";


        showProfileMessage(
            data.message ||
            "Password changed successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Change Password Error:",
            error
        );


        showProfileMessage(
            error.message ||
            "Unable to change password.",
            "error"
        );
    }
}
 
    /* =====================================================
       REFRESH EVERYTHING
    ===================================================== */

    async function refreshEverything() {

        await Promise.all([
            loadAdminRequests(),
            loadColleges(),
            loadAdmins(),
            loadDashboardStats()
        ]);
    }


    /* =====================================================
       NAVIGATION
    ===================================================== */

    function showSection(sectionId) {

        sections.forEach(section =>
            section.classList.remove(
                "active-section"
            )
        );


        navItems.forEach(item =>
            item.classList.remove(
                "active"
            )
        );


        const section =
            document.getElementById(
                sectionId
            );


        if (section) {
            section.classList.add(
                "active-section"
            );
        }


        const activeNav =
            document.querySelector(
                `[data-section="${sectionId}"]`
            );


        if (activeNav) {
            activeNav.classList.add(
                "active"
            );
        }


        const titles = {

            dashboard:
                "Super Admin Dashboard",

            colleges:
                "Colleges",

            "admin-requests":
                "College Admin Requests",

            "college-admins":
                "College Admins",

            settings:
                "Settings"
        };


        if (pageTitle) {

            pageTitle.textContent =
                titles[sectionId] ||
                "Super Admin Dashboard";
        }


        history.replaceState(
            null,
            "",
            `#${sectionId}`
        );


        if (sidebar) {
            sidebar.classList.remove(
                "mobile-open"
            );
        }


        if (notificationDropdown) {
            notificationDropdown.classList.remove(
                "show"
            );
        }


        if (sectionId === "colleges") {
            loadColleges();
        }


        if (sectionId === "college-admins") {
            loadAdmins();
        }


        if (sectionId === "settings") {
            loadSuperAdminProfile();
        }
    }


    /* =====================================================
       NAVIGATION EVENTS
    ===================================================== */

    navItems.forEach(item => {

        item.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showSection(
                    this.dataset.section
                );
            }
        );
    });


    document
        .querySelectorAll("[data-section]")
        .forEach(button => {

            if (
                button.classList.contains(
                    "nav-item"
                )
            ) {
                return;
            }


            button.addEventListener(
                "click",
                function () {

                    showSection(
                        this.dataset.section
                    );
                }
            );
        });


    /* =====================================================
       SEARCH / FILTER
    ===================================================== */

    if (requestSearch) {
        requestSearch.addEventListener(
            "input",
            renderRequests
        );
    }


    if (statusFilter) {
        statusFilter.addEventListener(
            "change",
            renderRequests
        );
    }


    const refreshRequests =
        document.getElementById(
            "refreshRequests"
        );

    if (refreshRequests) {

        refreshRequests.addEventListener(
            "click",
            loadAdminRequests
        );
    }


    const refreshColleges =
        document.getElementById(
            "refreshColleges"
        );

    // if (refreshColleges) {

    //     refreshColleges.addEventListener(
    //         "click",
    //         loadColleges
    //     );
    // }
    if (refreshColleges) {

    refreshColleges.addEventListener(
        "click",
        refreshEverything
    );
}


    const refreshAdmins =
        document.getElementById(
            "refreshAdmins"
        );

    if (refreshAdmins) {

        refreshAdmins.addEventListener(
            "click",
            loadAdmins
        );
    }


    const collegeSearch =
        document.getElementById(
            "collegeSearch"
        );

    if (collegeSearch) {

        collegeSearch.addEventListener(
            "input",
            renderColleges
        );
    }


    const collegeStatusFilter =
        document.getElementById(
            "collegeStatusFilter"
        );

    if (collegeStatusFilter) {

        collegeStatusFilter.addEventListener(
            "change",
            renderColleges
        );
    }


    const adminSearch =
        document.getElementById(
            "adminSearch"
        );

    if (adminSearch) {

        adminSearch.addEventListener(
            "input",
            renderAdmins
        );
    }


    /* =====================================================
       DASHBOARD STAT CARDS
    ===================================================== */

    const totalCollegesElement =
        document.getElementById(
            "totalColleges"
        );

    const pendingCollegesElement =
        document.getElementById(
            "pendingColleges"
        );

    const approvedCollegesElement =
        document.getElementById(
            "approvedColleges"
        );

    const totalAdminsElement =
        document.getElementById(
            "totalAdmins"
        );


    const totalCollegeCard =
        totalCollegesElement
            ?.closest(".stat-card");

    const pendingCollegeCard =
        pendingCollegesElement
            ?.closest(".stat-card");

    const approvedCollegeCard =
        approvedCollegesElement
            ?.closest(".stat-card");

    const totalAdminCard =
        totalAdminsElement
            ?.closest(".stat-card");


    [
        totalCollegeCard,
        pendingCollegeCard,
        approvedCollegeCard,
        totalAdminCard
    ].forEach(card => {

        if (card) {
            card.classList.add(
                "clickable-stat"
            );
        }
    });


    if (totalCollegeCard) {

        totalCollegeCard.addEventListener(
            "click",
            () => {

                document.getElementById(
                    "collegeStatusFilter"
                ).value = "Approved";

                showSection("colleges");

                renderColleges();
            }
        );
    }


    if (pendingCollegeCard) {

        pendingCollegeCard.addEventListener(
            "click",
            () => {

                document.getElementById(
                    "collegeStatusFilter"
                ).value = "Pending";

                showSection("colleges");

                renderColleges();
            }
        );
    }


    if (approvedCollegeCard) {

        approvedCollegeCard.addEventListener(
            "click",
            () => {

                document.getElementById(
                    "collegeStatusFilter"
                ).value = "Approved";

                showSection("colleges");

                renderColleges();
            }
        );
    }


    if (totalAdminCard) {

        totalAdminCard.addEventListener(
            "click",
            () => {
                showSection(
                    "college-admins"
                );
            }
        );
    }


    /* =====================================================
       PROFILE DROPDOWN
    ===================================================== */

    if (profileButton) {

        profileButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                profileDropdown.classList.toggle(
                    "show"
                );

                notificationDropdown.classList.remove(
                    "show"
                );
            }
        );
    }


    /*
     * If profile dropdown contains a Settings
     * button/link, make it open Settings.
     */

    if (profileDropdown) {

        profileDropdown
            .querySelectorAll(
                "[data-section='settings']"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        profileDropdown.classList.remove(
                            "show"
                        );

                        showSection(
                            "settings"
                        );
                    }
                );
            });
    }


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    if (mobileMenu) {

        mobileMenu.addEventListener(
            "click",
            function () {

                if (sidebar) {

                    sidebar.classList.toggle(
                        "mobile-open"
                    );
                }
            }
        );
    }


    /* =====================================================
       CLOSE DROPDOWNS
    ===================================================== */

    document.addEventListener(
        "click",
        function (event) {

            if (
                notificationDropdown &&
                !notificationDropdown.contains(
                    event.target
                ) &&
                event.target !==
                    notificationButton
            ) {

                notificationDropdown.classList.remove(
                    "show"
                );
            }


            if (
                profileDropdown &&
                !profileDropdown.contains(
                    event.target
                ) &&
                event.target !==
                    profileButton
            ) {

                profileDropdown.classList.remove(
                    "show"
                );
            }
        }
    );


    /* =====================================================
       LOGOUT
    ===================================================== */

    function logout() {

        if (
            !confirm(
                "Are you sure you want to logout?"
            )
        ) {
            return;
        }


        localStorage.removeItem(
            "loggedInUser"
        );

        localStorage.removeItem(
            "superAdminToken"
        );

        localStorage.removeItem(
            "superAdmin"
        );


        window.location.href =
            "super-admin-login.html";
    }


    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    const dropdownLogout =
        document.getElementById(
            "dropdownLogout"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logout
        );
    }


    if (dropdownLogout) {

        dropdownLogout.addEventListener(
            "click",
            logout
        );
    }


    /* =====================================================
       REQUEST MODAL
    ===================================================== */

    function closeRequestModal() {

        const modal =
            document.getElementById(
                "requestModal"
            );

        if (modal) {

            modal.classList.remove(
                "show"
            );
        }
    }


    window.closeRequestModal =
        closeRequestModal;


    const closeModal =
        document.getElementById(
            "closeModal"
        );


    if (closeModal) {

        closeModal.addEventListener(
            "click",
            closeRequestModal
        );
    }


    const requestModal =
        document.getElementById(
            "requestModal"
        );


    if (requestModal) {

        requestModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    this
                ) {
                    closeRequestModal();
                }
            }
        );
    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    createProfileForm();


    const hash =
        window.location.hash
            .replace("#", "");


    const validSections = [
        "dashboard",
        "colleges",
        "admin-requests",
        "college-admins",
        "settings"
    ];


    showSection(
        validSections.includes(hash)
            ? hash
            : "dashboard"
    );


    /*
     * Load profile separately.
     */

    loadSuperAdminProfile();


    /*
     * Load dashboard data.
     */

    refreshEverything();

});
