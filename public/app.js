// ========================================
// UI CSC STUDENT PORTAL
// student-app.js
// ========================================

window.StudentPortal = (() => {

    // ========================================
    // STATE
    // ========================================
    let sidebarOpen = false;
    let notificationOpen = false;
    
  
    // ========================================
    // INITIALIZE
    // ========================================

    async function init(){
        try {
            const student = await checkAuth();
            populateStudent(student);
            loadStudentProfile();
            Dashboard.init();
            Navigate.init();
            Sidebar.init();
            Notes.init();
            initLogout();
            Notifications.init();
            initSearch();
            CSCAI.init();
            Theme.init();
            Announcements.init();
            AnnouncementsPage.init();
            Materials.init();
            Assignments.init();
            Syllabus.init();
            Courses.init();
            Profile.init();
            Settings.init();
            
            Navigate.showPage("dashboard");
            console.log("Student Portal Ready");
        } catch(err) {
            console.error(err);
        }
    }

    // ========================================
    // LOAD PROFILE
    // ========================================

    function loadStudentProfile(){
        const student = getCurrentStudent();

if(!student) return;
        const nameElements = $$("[data-student-name]");
        nameElements.forEach(element => {
            element.textContent = student.name || "Student";
        });

        const matricElements = $$("[data-student-matric]");
        matricElements.forEach(element => {
            element.textContent = student.matricNumber || student.matric || "";
        });

        const avatar = student.photoURL
            || student.profilePicture
            || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=4a90e2&color=fff`;

        $$("[data-student-avatar]").forEach(image => {
            image.src = avatar;
        });
    }

   
    // ========================================
    // LOGOUT
    // ========================================

    function initLogout(){
        const button = $("#logout-btn");
        if(!button) return;

        button.onclick = async () => {
            const ok = await Modal.confirm(

    "Logout",

    "Are you sure you want to logout?"

);

if(!ok) return;

await logout();
        };
    }

  

    // ========================================
    // SEARCH
    // ========================================

    function initSearch(){

    // ==========================
    // Global Search
    // ==========================

    const globalSearch = $("#global-search");

    if(globalSearch){

        globalSearch.addEventListener("input",()=>{

            const value = globalSearch.value
                .trim()
                .toLowerCase();

            $$(".searchable").forEach(card=>{

                card.style.display =
                    card.textContent
                    .toLowerCase()
                    .includes(value)

                    ? ""

                    : "none";

            });

        });

    }

    // ==========================
    // Materials Search
    // ==========================

    
}

    

    
    function populateStudent(student){

    if(!student) return;

    const name = document.getElementById("student-name");

    if(name){

        name.textContent = student.name || "Student";

    }

    const details = document.getElementById("student-details");

    if(details){

        details.textContent =
            `${student.level || ""} Level • ${student.matricNumber || ""}`;

    }

    const avatar = document.getElementById("student-avatar");

    if(avatar){

        avatar.src = student.avatarUrl ||

        "https://ui-avatars.com/api/?name=" +

        encodeURIComponent(student.name);

    }

    const dashboardName = document.getElementById(

        "dashboard-student-name"

    );

    if(dashboardName){

        dashboardName.textContent = student.name;

    }

}     
      function closeAnnouncement(){

    document
        .getElementById("announcement-modal")
        ?.classList.remove("show");

}
      
  function openAnnouncementById(id){

    const announcement =
        AnnouncementsPage.getAnnouncement(id);

    if(announcement){

        openAnnouncement(announcement);

    }

}

    // ========================================
    // PUBLIC EXPORTS
    // ========================================

    return {
        init,
        closeAnnouncement,
        openAnnouncement:openAnnouncementById
        // Exposed globally for onclick attributes
    };

})();

// ========================================
// START APPLICATION
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    StudentPortal.init();
});

// Helper wrapper to route HTML inline onclick declarations to module
function closeAnnouncement() {
    StudentPortal.closeAnnouncement();
}

// ========================================
// GLOBAL TOASTS & MODALS
// ========================================





// Keyboard Shortcuts

