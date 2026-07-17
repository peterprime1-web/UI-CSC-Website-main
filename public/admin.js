// ==========================================
// GLOBAL UI UTILITIES
// ==========================================

const modules = {

    courses: AdminCourses,

    notes: AdminNotes,

    materials: AdminMaterials,

    assignments: AdminAssignments,

    announcements: AdminAnnouncements,

    syllabus: AdminSyllabus,

    students: AdminStudents,

    admins: AdminAdmins,

    activity: AdminActivity,

    settings: AdminSettings,

    permissions: AdminPermissions

};

const modalOverlay = document.getElementById("modal-overlay");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");

const saveModalBtn = document.getElementById("save-modal");
const cancelModalBtn = document.getElementById("cancel-modal");
const closeModalBtn = document.getElementById("close-modal");

const loadingOverlay = document.getElementById("loading");

const toastContainer = document.getElementById("toast-container");


// ==========================================
// LOADING
// ==========================================

function showLoading() {
    loadingOverlay.classList.remove("hidden");
}

function hideLoading() {
    loadingOverlay.classList.add("hidden");
}


// ==========================================
// MODAL
// ==========================================

let modalCallback = null;

function openModal(title, html, callback = null) {

    modalTitle.textContent = title;

    modalBody.innerHTML = html;

    modalCallback = callback;

    modalOverlay.classList.remove("hidden");

}

function closeModal() {

    modalOverlay.classList.add("hidden");

    modalBody.innerHTML = "";

    modalCallback = null;

}

closeModalBtn.onclick = closeModal;
cancelModalBtn.onclick = closeModal;

saveModalBtn.onclick = () => {

    if (modalCallback) {

        modalCallback();

    }

};


// ==========================================
// DELETE CONFIRMATION
// ==========================================

const deleteOverlay = document.getElementById("delete-overlay");

const deleteMessage = document.getElementById("delete-message");

const confirmDeleteBtn = document.getElementById("confirm-delete");

const cancelDeleteBtn = document.getElementById("cancel-delete");

let deleteCallback = null;

function confirmDelete(message, callback) {

    deleteMessage.textContent = message;

    deleteCallback = callback;

    deleteOverlay.classList.remove("hidden");

}

cancelDeleteBtn.onclick = () => {

    deleteOverlay.classList.add("hidden");

};

confirmDeleteBtn.onclick = () => {

    deleteOverlay.classList.add("hidden");

    if(deleteCallback){

        deleteCallback();

    }

};

function showTempPassword(email,password){

    openModal(

        "Admin Created",

        `

        <div class="temp-password-box">

            <p>

                The administrator has been created.

            </p>

            <label>Email</label>

            <input

                readonly

                value="${email}">

            <label>

                Temporary Password

            </label>

            <input

                id="temp-password"

                readonly

                value="${password}">

            <button

                class="primary-btn"

                onclick="navigator.clipboard.writeText('${password}')">

                Copy Password

            </button>

        </div>

        `

    );

}

// ==========================================
// TOAST
// ==========================================

function toast(message, type="success") {

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    toast.innerHTML = `

        <span class="material-icons">

            ${
                type==="success" ? "check_circle" :
                type==="error" ? "error" :
                type==="warning" ? "warning" :
                "info"
            }

        </span>

        <span>${message}</span>

    `;

    toastContainer.appendChild(toast);

    setTimeout(()=>{

        toast.classList.add("show");

    },50);

    setTimeout(()=>{

        toast.classList.remove("show");

        setTimeout(()=>toast.remove(),300);

    },3000);

}

document.querySelectorAll("[data-page]").forEach(item=>{

    const permission = item.dataset.page;

    if(permission !== "dashboard" && !can(permission)){

        item.remove();

    }

});

async function logout(){

    await auth.signOut();

    sessionStorage.clear();

    location.replace("login.html");

    $("#profile-logout").onclick=async()=>{

    await auth.signOut();

    location.href="login.html";

};

}
// ==========================================
// IMAGE PREVIEW
// ==========================================

const imageOverlay = document.getElementById("image-overlay");

const previewImage = document.getElementById("preview-image");

const closeImage = document.getElementById("close-image");

function preview(src){

    previewImage.src = src;

    imageOverlay.classList.remove("hidden");

}

closeImage.onclick = ()=>{

    imageOverlay.classList.add("hidden");

};


// ==========================================
// FORMATTERS
// ==========================================

function formatDate(timestamp){

    if(!timestamp) return "-";

    return new Date(timestamp).toLocaleDateString();

}

function formatDateTime(timestamp){

    if(!timestamp) return "-";

    return new Date(timestamp).toLocaleString();

}

function formatFileSize(bytes){

    if(bytes < 1024) return bytes+" B";

    if(bytes < 1024*1024)
        return (bytes/1024).toFixed(1)+" KB";

    if(bytes < 1024*1024*1024)
        return (bytes/1024/1024).toFixed(1)+" MB";

    return (bytes/1024/1024/1024).toFixed(2)+" GB";

}



// ==========================================
// RANDOM IDS
// ==========================================

function uid(){

    return Date.now().toString(36)+Math.random().toString(36).substring(2,8);

}

function updateCurrentAdmin(){

    if(!window.currentAdmin)
        return;

    $("#admin-name").textContent =
        window.currentAdmin.name;

    $("#admin-role").textContent =
        window.currentAdmin.role;

    $("#admin-avatar").src =

        window.currentAdmin.avatarUrl ||

        `https://ui-avatars.com/api/?name=${encodeURIComponent(window.currentAdmin.name)}&background=2563eb&color=fff`;

}

// ==========================================
// DROPDOWN INITIALIZATION & BINDINGS
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    await checkAuth();

    // Initialize dropdown elements & toggle handlers safely
    

    updateCurrentAdmin();

    // Bind Logout Button functionality (Inside the profile menu)
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await logout();
        };
    }

    // Bind Change Password Button functionality (Inside the profile menu)
    const changePasswordMenu = document.getElementById("change-password-menu");
    if (changePasswordMenu) {
        changePasswordMenu.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            location.href = "change-password.html";
        };
    }

    if (can("dashboard")) {
        Dashboard.load();
    }

    Object.values(modules).forEach(module => {
        if (module && typeof module.init === "function") {
            module.init();
        }
    });

    document.addEventListener("DOMContentLoaded", async () => {
    // ... your existing checkAuth(), updates, and module loads ...

    // Hook for switching seamlessly back to student panel
    const switchStudentBtn = document.getElementById("switch-student-portal-btn");
    if (switchStudentBtn) {
        switchStudentBtn.onclick = (e) => {
            e.preventDefault();
            window.location.href = "index.html"; // Path to your main student dashboard
        };
    }
});
});