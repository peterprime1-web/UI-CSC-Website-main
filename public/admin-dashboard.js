// =========================================
// ADMIN DASHBOARD
// =========================================

const Dashboard = (() => {

    async function load() {

        try {

            showLoading();

            await Promise.all([
                loadCounts(),
                loadStorage(),
                loadRecentActivity()
            ]);

        } catch (err) {

            console.error(err);
            toast("Failed to load dashboard", "error");

        } finally {

            hideLoading();

        }

        document.querySelectorAll(".action-btn[data-open]").forEach(button=>{

    button.onclick=()=>{

        const target=button.dataset.open;

        const actions={

            students:{
                permission:"students",
                action:()=>AdminStudents.openStudentModal()
            },

            courses:{
                permission:"courses",
                action:()=>AdminCourses.openCourseModal()
            },

            notes:{
                permission:"notes",
                action:()=>AdminNotes.openNoteModal()
            },

            materials:{
                permission:"materials",
                action:()=>AdminMaterials.openMaterialModal()
            },

            assignments:{
                permission:"assignments",
                action:()=>AdminAssignments.openAssignmentModal()
            },

            announcements:{
                permission:"announcements",
                action:()=>AdminAnnouncements.openAnnouncementModal()
            }

        };

        const item=actions[target];

        if(!item) return;

        if(!can(item.permission)){

            toast("You don't have permission.","error");

            return;

        }

        item.action();

    };

});

    }

    // =====================================
    // COUNTS
    // =====================================

    async function loadCounts() {

        const refs = [
            "courses",
            "students",
            "admins",
            "activity"
        ];

        const counts = {};

        for (const path of refs) {

            const snap = await db.ref(path).once("value");

            counts[path] = snap.exists()
                ? Object.keys(snap.val()).length
                : 0;

        }

        // Courses

        $("#course-count").textContent =
            counts.courses;

        $("#student-count").textContent =
            counts.students;

        $("#admin-count").textContent =
            counts.admins;

        // Count notes

        const noteSnap = await db.ref("notes").once("value");

$("#note-count").textContent =
    noteSnap.exists()
        ? Object.keys(noteSnap.val()).length
        : 0;


const materialSnap = await db.ref("materials").once("value");

$("#material-count").textContent =
    materialSnap.exists()
        ? Object.keys(materialSnap.val()).length
        : 0;


const assignmentSnap = await db.ref("assignments").once("value");

$("#assignment-count").textContent =
    assignmentSnap.exists()
        ? Object.keys(assignmentSnap.val()).length
        : 0;
    
    }
    // =====================================
    // STORAGE
    // =====================================

    async function loadStorage() {

        const storageUsed = "0 MB";

        $("#storage-used").textContent =
            storageUsed;

        $("#storage-total").textContent =
            "5 GB";

        $("#storage-progress").style.width =
            "0%";

    }

    // =====================================
    // RECENT ACTIVITY
    // =====================================

    async function loadRecentActivity() {

        const container =
            $("#recent-activity");

        container.innerHTML = "";

        const snap = await db
            .ref("activity")
            .limitToLast(6)
            .once("value");

        if (!snap.exists()) {

            container.innerHTML = `

                <div class="activity-item">

                    <span class="material-icons">
                        history
                    </span>

                    <div>

                        <strong>No activity yet</strong>

                        <small>
                            Activity will appear here.
                        </small>

                    </div>

                </div>

            `;

            return;

        }

        const data =
            Object.values(snap.val()).reverse();

        data.forEach(item => {

            container.innerHTML += `

            <div class="activity-item">

                <span class="material-icons">

                    ${item.icon || "history"}

                </span>

                <div>

                   <strong>

    ${item.title}

</strong>

<p class="activity-description">

    ${item.description || ""}

</p>

<small>

    ${item.time}

</small>

                </div>

            </div>

            `;

        });

    }

    return {

        load

    };

    

})();