/*=====================================================
    UI CSC PORTAL
    SETTINGS MODULE
======================================================*/

window.Settings = (() => {

    function init() {
        loadSettings();
        bindEvents();
        initPasswordToggles();
    }

    function loadSettings() {
        // -----------------------
        // Email
        // -----------------------
        const student = getCurrentStudent();
        if (student) {
            const email = document.getElementById("settings-email");
            if (email) {
                email.textContent = student.email || "-";
            }
        }

        // -----------------------
        // Theme
        // -----------------------
        const darkToggle = document.getElementById("settings-dark-mode");
        if (darkToggle) {
            darkToggle.checked = document.body.classList.contains("dark");
        }

        // -----------------------
        // Notifications
        // -----------------------
        const notifyToggle = document.getElementById("settings-notifications");
        if (notifyToggle) {
            notifyToggle.checked = JSON.parse(
                localStorage.getItem("notificationsEnabled") ?? "true"
            );
        }
    }

    function bindEvents() {
        // =========================
        // DARK MODE
        // =========================
        const darkToggle = document.getElementById("settings-dark-mode");
        if (darkToggle) {
            darkToggle.addEventListener("change", () => {
                document.body.classList.toggle("dark", darkToggle.checked);
                localStorage.setItem("theme", darkToggle.checked ? "dark" : "light");
            });
        }

        const adminLoginButton = document.getElementById("admin-login-btn");
        if (adminLoginButton) {
            adminLoginButton.onclick = () => {
                // Adjust the URL string path to where your admin login page lives
                window.location.href = "admin.html"; 
            };
        }

        // =========================
        // NOTIFICATIONS
        // =========================
        const notify = document.getElementById("settings-notifications");
        if (notify) {
            notify.addEventListener("change", () => {
                localStorage.setItem("notificationsEnabled", notify.checked);
                toast(notify.checked ? "Notifications Enabled" : "Notifications Disabled");
            });
        }

        // =========================
        // PROFILE PICTURE TRIGGER
        // =========================
        const avatarButton = document.getElementById("change-avatar-btn");
        const avatarInput = document.getElementById("avatar-upload");

        if (avatarButton && avatarInput) {
            avatarButton.onclick = () => {
                avatarInput.click();
            };
            avatarInput.onchange = uploadAvatar;
        }

        // =========================
        // PASSWORD
        // =========================
        document
.getElementById("change-password-btn")
?.addEventListener("click", () => {

    openModal("password-modal");

});

    document
.getElementById("save-password-btn")
?.addEventListener("click", changePassword);




        [
    "current-password",
    "new-password",
    "confirm-password"
].forEach(id => {

    document.getElementById(id)
    ?.addEventListener("keydown", e => {

        if(e.key === "Enter"){

            changePassword();

        }

    });

});
        // =========================
        // LOGOUT
        // =========================
        const logoutButton = document.getElementById("settings-logout");
        if (logoutButton) {
            logoutButton.onclick = async () => {
                const ok = await Modal.confirm("Logout", "Are you sure you want to logout?");
                if (!ok) return;
                await logout();
            };
        }
    }

    // ===================================
    // STANDALONE AVATAR UPLOAD
    // ===================================
    async function uploadAvatar(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const student = getCurrentStudent();
            if (!student) {
                Modal.error("Error", "Student not found.");
                return;
            }

            // Extract file extension and generate a safe, unique filename
            const extension = file.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;
            const filePath = fileName; // Used as the avatarPath reference

            // Upload the file to Supabase Storage
            const { error: uploadError } = await supabaseClient.storage
                .from("students")
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Retrieve public URL
            const { data } = supabaseClient.storage
                .from("students")
                .getPublicUrl(filePath);

            const avatarUrl = data.publicUrl;

            // Sync update to Firebase Realtime Database
            await db.ref(`students/${student.id}`).update({
                avatarUrl,
                avatarPath: filePath, // FIXED: was previously undefined 'avatarPath'
                updatedAt: Date.now()
            });

            // Dynamically update UI avatar elements on the page immediately
            document
                .querySelectorAll("[data-student-avatar], #student-avatar")
                .forEach(img => {
                    img.src = avatarUrl;
                });

            // Update user details in local storage state
            student.avatarUrl = avatarUrl;
            student.avatarPath = filePath;
            localStorage.setItem("student", JSON.stringify(student));

            Modal.success("Profile Updated", "Your profile picture has been updated successfully.");
            console.log("Uploaded successfully:", avatarUrl);

        } catch (err) {
            console.error("Upload error details:", err);
            Modal.error("Upload Failed", err.message || "An unknown error occurred.");
        }
    }

    async function changePassword() {

    const currentPassword =
        document.getElementById("current-password").value.trim();

    const newPassword =
        document.getElementById("new-password").value.trim();

    const confirmPassword =
        document.getElementById("confirm-password").value.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {

        Modal.error(
            "Missing Fields",
            "Please fill in all password fields."
        );

        return;

    }

    if (newPassword.length < 6) {

        Modal.error(
            "Weak Password",
            "Password must be at least 6 characters."
        );

        return;

    }

    if (newPassword !== confirmPassword) {

        Modal.error(
            "Passwords Don't Match",
            "Please confirm your new password correctly."
        );

        return;

    }

    try {

        const user = firebase.auth().currentUser;

        const credential =
            firebase.auth.EmailAuthProvider.credential(
                user.email,
                currentPassword
            );

        await user.reauthenticateWithCredential(credential);

        await user.updatePassword(newPassword);

        closeModal("password-modal");

        document.getElementById("current-password").value = "";
        document.getElementById("new-password").value = "";
        document.getElementById("confirm-password").value = "";

        Modal.success(
            "Password Updated",
            "Your password has been changed successfully."
        );

    }

    catch(err){

        console.error(err);

        let message = err.message;

        if(err.code === "auth/wrong-password"){

            message = "Current password is incorrect.";

        }

        if(err.code === "auth/too-many-requests"){

            message = "Too many attempts. Please try again later.";

        }

        Modal.error(
            "Password Update Failed",
            message
        );

    }

}

    function initPasswordToggles(){

    document
    .querySelectorAll(".password-toggle")
    .forEach(icon=>{

        icon.addEventListener("click",()=>{

            const input=document.getElementById(

                icon.dataset.target

            );

            if(input.type==="password"){

                input.type="text";

                icon.textContent="visibility";

            }

            else{

                input.type="password";

                icon.textContent="visibility_off";

            }

        });

    });

}

    // Return our public API
    return {
        init
    };

})();