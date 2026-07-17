window.Profile = (() => {

    let student = null;

    async function init(){

        await loadProfile();

    }

    async function loadProfile(){

        try{

            student = getCurrentStudent();

            if(!student) return;

            populateProfile();

            await loadStatistics();

        }

        catch(err){

            console.error("Profile Error:", err);

        }

    }

    function populateProfile(){

        $("#profile-avatar").src =
            student.avatarUrl ||
            "https://ui-avatars.com/api/?name=" +
            encodeURIComponent(student.name);

        $("#profile-name").textContent =
            student.name || "Student";

        $("#profile-level").textContent =
            `${student.level || ""} Level Student`;

        $("#profile-status").textContent =
            student.status || "Active";

        $("#profile-matric").textContent =
            student.matricNumber || "-";

        $("#profile-email").textContent =
            student.email || "-";

        $("#profile-phone").textContent =
            student.phone || "-";

        $("#profile-level-text").textContent =
            `${student.level || "-"} Level`;

        $("#profile-created").textContent =
            formatDate(student.createdAt);

        $("#profile-updated").textContent =
            formatDate(student.updatedAt);

    }

    async function loadStatistics(){

        try{

            const [
                courses,
                notes,
                materials,
                assignments
            ] = await Promise.all([

                db.ref("courses").once("value"),
                db.ref("notes").once("value"),
                db.ref("materials").once("value"),
                db.ref("assignments").once("value")

            ]);

            $("#profile-course-count").textContent =
                courses.numChildren();

            $("#profile-note-count").textContent =
                notes.numChildren();

            $("#profile-material-count").textContent =
                materials.numChildren();

            $("#profile-assignment-count").textContent =
                assignments.numChildren();

        }

        catch(err){

            console.error(err);

        }

    }

    return{

        init

    };

})();