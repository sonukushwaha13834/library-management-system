
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("studentProfileModal");

    if (!modal) {
        console.error("Profile popup HTML not found.");
        return;
    }

    function openProfile(event) {
        event.preventDefault();

        let student = {};

        try {
            student = JSON.parse(
                localStorage.getItem("loggedInStudent") ||
                localStorage.getItem("loggedInUser") ||
                "{}"
            );
        } catch (error) {
            console.error("Could not read student profile:", error);
        }

        const setText = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value || "Not available";
            }
        };

        const name = student.fullName || student.username || "Student";

        setText("modalStudentName", name);
        setText("modalStudentUsername", student.username);
        setText("modalStudentEmail", student.email);
       const profileData = JSON.parse(
    localStorage.getItem("loggedInStudent") || "{}"
);

setText(
    "modalStudentCollege",
    profileData.college?.collegeName
);

setText(
    "modalStudentCollegeId",
    profileData.college?.collegeId || profileData.student?.collegeId
);

        setText("modalStudentAvatar", name.charAt(0).toUpperCase());

        const avatar = document.getElementById("modalStudentAvatar");
        if (avatar) avatar.textContent = name.charAt(0).toUpperCase();

        modal.classList.add("show");
    }

    document.getElementById("openStudentProfile")
        ?.addEventListener("click", openProfile);

    document.getElementById("openStudentProfileAction")
        ?.addEventListener("click", openProfile);

    function closeProfile() {
        modal.classList.remove("show");
    }

    document.getElementById("closeProfileModal")
        ?.addEventListener("click", closeProfile);

    document.getElementById("doneProfileModal")
        ?.addEventListener("click", closeProfile);

    modal.addEventListener("click", function (event) {
        if (event.target === modal) closeProfile();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") closeProfile();
    });
});
