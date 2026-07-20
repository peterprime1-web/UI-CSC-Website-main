// =========================================
// ADMINS
// =========================================

window.AdminAdmins = (() => {

    const DB_PATH = "admins";
    const BUCKET = "admins";
    const STUDENTS_PATH = "students"; // Path to student records

    const ROLE_PERMISSIONS = {
        "Super Admin": {
            dashboard: true, students: true, admins: true, courses: true,
            notes: true, materials: true, assignments: true, announcements: true,
            syllabus: true, activity: true, settings: true, permissions: true
        },
        "Admin": {
            dashboard: true, students: true, admins: false, courses: true,
            notes: true, materials: true, assignments: true, announcements: true,
            syllabus: true, activity: true, settings: false, permissions: false
        },
        "Moderator": {
            dashboard: true, students: false, admins: false, courses: false,
            notes: true, materials: false, assignments: false, announcements: true,
            syllabus: false, activity: true, settings: false, permissions: false
        }
    };

    let admins = [];
    let filteredAdmins = [];
    let studentsList = []; 
    let editingId = null;
    let clickOutsideHandler = null;

    function init(){
        if(typeof can === "function" && !can("admins")) return;
        bindEvents();
        listenForAdmins();
        fetchStudentsList();
    }

    function bindEvents(){
        const addBtn = $("#add-admin-btn");
        const refreshBtn = $("#refresh-admins");
        const searchInput = $("#admin-search");
        const roleFilter = $("#admin-role-filter");
        const statusFilter = $("#admin-status-filter");

        if(addBtn) addBtn.onclick = () => openAdminModal();
        if(refreshBtn) {
            refreshBtn.onclick = () => {
                listenForAdmins();
                fetchStudentsList();
            };
        }
        if(searchInput) searchInput.oninput = filterAdmins;
        if(roleFilter) roleFilter.onchange = filterAdmins;
        if(statusFilter) statusFilter.onchange = filterAdmins;
    }

    async function fetchStudentsList() {
        try {
            const snapshot = await db.ref(STUDENTS_PATH).once("value");
            studentsList = [];
            if (snapshot.exists()) {
                snapshot.forEach(child => {
                    studentsList.push({
                        id: child.key,
                        ...child.val()
                    });
                });
            }
            studentsList.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        } catch (err) {
            console.error("Unable to load students database:", err);
        }
    }

    function listenForAdmins(){
        const ref = db.ref(DB_PATH);
        ref.off();
        ref.on("value", snapshot => {
            admins = [];
            if(snapshot.exists()){
                snapshot.forEach(child => {
                    admins.push({
                        id: child.key,
                        ...child.val()
                    });
                });
            }
            filteredAdmins = [...admins];
            renderAdmins();
            updateDashboard();
        });
    }

    function filterAdmins(){
        const search = ($("#admin-search")?.value || "").toLowerCase().trim();
        const role = $("#admin-role-filter")?.value || "";
        const status = $("#admin-status-filter")?.value || "";

        filteredAdmins = admins.filter(admin => {
            const matchesSearch =
                (admin.name && admin.name.toLowerCase().includes(search)) ||
                (admin.email && admin.email.toLowerCase().includes(search));

            const matchesRole = !role || admin.role === role;
            const matchesStatus = !status || admin.status === status;

            return matchesSearch && matchesRole && matchesStatus;
        });
        renderAdmins();
    }

    function renderAdmins(){
        const table = $("#admins-table");
        if(!table) return;

        if(!filteredAdmins.length){
            table.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <span class="material-icons">admin_panel_settings</span>
                        <h3>No admins yet</h3>
                    </td>
                </tr>
            `;
            return;
        }

        table.innerHTML = filteredAdmins.map(admin => `
            <tr>
                <td>
                    <img
                        class="student-avatar"
                        src="${admin.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name || 'Admin')}`}"
                    >
                </td>
                <td><strong>${admin.name || '-'}</strong></td>
                <td>${admin.email || '-'}</td>
                <td>${admin.role || '-'}</td>
                <td>
                    <span class="status-badge ${(admin.status || '').toLowerCase()}">
                        ${admin.status || 'Active'}
                    </span>
                </td>
                <td>
                    ${admin.updatedAt && typeof formatDate === "function" ? formatDate(admin.updatedAt) : "-"}
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-btn" onclick="AdminAdmins.editAdmin('${admin.id}')">
                            <span class="material-icons">edit</span>
                        </button>
                        <button class="icon-btn" onclick="AdminAdmins.deleteAdmin('${admin.id}')">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `).join("");
    }

    function openAdminModal(admin = null, id = null){
        editingId = id;
        cleanupStudentSearch(); // Clear previous event listeners if any exist

        // Parse existing permissions or default to role defaults
        const perms = admin?.permissions || ROLE_PERMISSIONS[admin?.role || "Admin"];

        const html = `
            <div class="form-grid">
                ${!admin ? `
                <div class="form-group full-width" style="position: relative;">
                    <label style="color: var(--brand-primary); font-weight: 600;">Search & Link Existing Student *</label>
                    <input id="link-student-search" type="text" placeholder="Type student name, email, or matric number..." autocomplete="off" style="width: 100%;">
                    <div id="student-search-results" class="hidden" style="
                        position: absolute; top: 100%; left: 0; right: 0; background: #fff;
                        border: 1px solid var(--border-color); border-radius: 8px; max-height: 200px;
                        overflow-y: auto; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-top: 4px;
                    "></div>
                    <input id="selected-student-id" type="hidden" value="">
                </div>
                ` : ''}
                
                <div class="form-group">
                    <label>Full Name</label>
                    <input id="admin-name" type="text" value="${admin?.name || ""}" ${!admin ? 'readonly placeholder="Select a student above"' : ''}>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input id="admin-email" type="email" value="${admin?.email || ""}" ${!admin ? 'readonly placeholder="Select a student above"' : ''}>
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <select id="admin-role">
                        <option value="Super Admin" ${admin?.role === "Super Admin" ? "selected" : ""}>Super Admin</option>
                        <option value="Admin" ${!admin || admin?.role === "Admin" ? "selected" : ""}>Admin</option>
                        <option value="Moderator" ${admin?.role === "Moderator" ? "selected" : ""}>Moderator</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="admin-status">
                        <option value="Active" ${!admin || admin?.status === "Active" ? "selected" : ""}>Active</option>
                        <option value="Disabled" ${admin?.status === "Disabled" ? "selected" : ""}>Disabled</option>
                    </select>
                </div>

                <div class="form-group full-width">
                    <label>Permissions</label>
                    <div class="permission-grid">
                        <label><input type="checkbox" id="perm-dashboard" ${perms?.dashboard !== false ? "checked" : ""}> Dashboard</label>
                        <label><input type="checkbox" id="perm-students" ${perms?.students !== false ? "checked" : ""}> Students</label>
                        <label><input type="checkbox" id="perm-admins" ${perms?.admins ? "checked" : ""}> Admins</label>
                        <label><input type="checkbox" id="perm-courses" ${perms?.courses !== false ? "checked" : ""}> Courses</label>
                        <label><input type="checkbox" id="perm-notes" ${perms?.notes !== false ? "checked" : ""}> Notes</label>
                        <label><input type="checkbox" id="perm-materials" ${perms?.materials !== false ? "checked" : ""}> Materials</label>
                        <label><input type="checkbox" id="perm-assignments" ${perms?.assignments !== false ? "checked" : ""}> Assignments</label>
                        <label><input type="checkbox" id="perm-announcements" ${perms?.announcements !== false ? "checked" : ""}> Announcements</label>
                        <label><input type="checkbox" id="perm-syllabus" ${perms?.syllabus !== false ? "checked" : ""}> Syllabus</label>
                        <label><input type="checkbox" id="perm-activity" ${perms?.activity !== false ? "checked" : ""}> Activity Log</label>
                        <label><input type="checkbox" id="perm-settings" ${perms?.settings ? "checked" : ""}> Settings</label>
                        <label><input type="checkbox" id="perm-permissions" ${perms?.permissions ? "checked" : ""}> Permissions</label>
                    </div>
                </div>

                <div class="form-group full-width">
                    <label>Profile Picture (Overrides student avatar if uploaded)</label>
                    <input id="admin-photo" type="file" accept="image/*">
                    <input id="admin-existing-avatar" type="hidden" value="${admin?.avatarUrl || ""}">
                </div>
            </div>
        `;

        openModal(
            admin ? "Edit Admin" : "Add Admin",
            html,
            saveAdmin
        );

        if(!admin) {
            setupStudentSearch();
        }
    }

    function setupStudentSearch() {
        const searchInput = $("#link-student-search");
        const resultsContainer = $("#student-search-results");
        const selectedIdInput = $("#selected-student-id");

        if(!searchInput || !resultsContainer) return;

        searchInput.oninput = (e) => {
            const query = e.target.value.toLowerCase().trim();
            if(!query) {
                resultsContainer.classList.add("hidden");
                resultsContainer.innerHTML = "";
                return;
            }

            const matches = studentsList.filter(student => 
                (student.name && student.name.toLowerCase().includes(query)) ||
                (student.email && student.email.toLowerCase().includes(query)) ||
                (student.matricNumber && student.matricNumber.toLowerCase().includes(query))
            );

            if(matches.length === 0) {
                resultsContainer.innerHTML = `<div style="padding: 12px; color: #888; font-size: 0.9rem;">No matching students found</div>`;
            } else {
                resultsContainer.innerHTML = matches.map(student => `
                    <div class="student-search-item" data-id="${student.id}" style="
                        padding: 10px 14px; cursor: pointer; border-bottom: 1px solid #f1f5f9;
                        transition: background 0.2s; font-size: 0.9rem;
                    " onmouseover="this.style.backgroundColor='#f8fafc'" onmouseout="this.style.backgroundColor='transparent'">
                        <strong style="display:block; color:#1e293b;">${student.name}</strong>
                        <span style="color: #64748b; font-size: 0.8rem;">Matric: ${student.matricNumber || 'N/A'} | ${student.email}</span>
                    </div>
                `).join("");
            }
            resultsContainer.classList.remove("hidden");
        };

        resultsContainer.onclick = (e) => {
            const item = e.target.closest(".student-search-item");
            if(!item) return;

            const studentId = item.getAttribute("data-id");
            const selectedStudent = studentsList.find(s => s.id === studentId);

            if(selectedStudent) {
                if(selectedIdInput) selectedIdInput.value = selectedStudent.id;
                searchInput.value = `${selectedStudent.name} (${selectedStudent.matricNumber || 'N/A'})`;
                
                if($("#admin-name")) $("#admin-name").value = selectedStudent.name || "";
                if($("#admin-email")) $("#admin-email").value = selectedStudent.email || "";
                if($("#admin-existing-avatar")) $("#admin-existing-avatar").value = selectedStudent.avatarUrl || "";

                resultsContainer.classList.add("hidden");
                resultsContainer.innerHTML = "";
                if(typeof toast === "function") toast("Linked with " + selectedStudent.name, "success");
            }
        };

        clickOutsideHandler = (e) => {
            if (e.target !== searchInput && !resultsContainer.contains(e.target)) {
                resultsContainer.classList.add("hidden");
            }
        };

        document.addEventListener("click", clickOutsideHandler);
    }

    function cleanupStudentSearch() {
        if (clickOutsideHandler) {
            document.removeEventListener("click", clickOutsideHandler);
            clickOutsideHandler = null;
        }
    }

    async function saveAdmin(){
        const name = $("#admin-name")?.value.trim() || "";
        const email = $("#admin-email")?.value.trim() || "";
        const role = $("#admin-role")?.value || "Admin";
        const status = $("#admin-status")?.value || "Active";
        const photo = $("#admin-photo")?.files[0];
        const existingAvatar = $("#admin-existing-avatar")?.value || "";

        if(!editingId && !$("#selected-student-id")?.value) {
            if(typeof toast === "function") toast("You must select and link an existing student", "error");
            return;
        }

        if(!name || !email){
            if(typeof toast === "function") toast("Fill all required fields", "error");
            return;
        }

        if(typeof showLoading === "function") showLoading();

        try {
            let avatarUrl = "";
            if(editingId){
                const snap = await db.ref(DB_PATH + "/" + editingId).once("value");
                avatarUrl = snap.val()?.avatarUrl || "";
            } else {
                avatarUrl = existingAvatar;
            }

            if(photo && typeof uploadFile === "function"){
                const upload = await uploadFile("admins", photo);
                avatarUrl = upload.fileUrl || avatarUrl;
            }

            // Firebase payload sanitization (Ensures no property is ever 'undefined')
            const data = {
                name: name,
                email: email,
                role: role,
                status: status,
                avatarUrl: avatarUrl,
                permissions: {
                    dashboard: !!$("#perm-dashboard")?.checked,
                    students: !!$("#perm-students")?.checked,
                    admins: !!$("#perm-admins")?.checked,
                    courses: !!$("#perm-courses")?.checked,
                    notes: !!$("#perm-notes")?.checked,
                    materials: !!$("#perm-materials")?.checked,
                    assignments: !!$("#perm-assignments")?.checked,
                    announcements: !!$("#perm-announcements")?.checked,
                    syllabus: !!$("#perm-syllabus")?.checked,
                    activity: !!$("#perm-activity")?.checked,
                    settings: !!$("#perm-settings")?.checked,
                    permissions: !!$("#perm-permissions")?.checked
                },
                updatedAt: Date.now()
            };

            if(editingId){
                await db.ref(DB_PATH + "/" + editingId).update(data);
                if(typeof logActivity === "function") await logActivity("Admin Updated", "edit");
                
                cleanupStudentSearch();
                closeModal();
                if(typeof toast === "function") toast("Admin updated successfully.", "success");

            } else {
                data.createdAt = Date.now();
                data.studentId = $("#selected-student-id")?.value || "";
                
                const tempPassword = generatePassword(); 
                
                const response = await fetch(
                    SERVER_URL + "/create-admin",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            name,
                            email,
                            password: tempPassword
                        })
                    }
                );

                const result = await response.json();

                if(!result.success){
                    throw new Error(result.message || "Failed to create authentication user.");
                }

                data.uid = result.uid;

                // Save directly under auth user UID instead of an auto-generated push key
                await db.ref(DB_PATH).child(result.uid).set(data);
                if(typeof logActivity === "function") await logActivity("Admin Added", "person_add");
                
                cleanupStudentSearch();
                closeModal(); 
                
                if(typeof showTempPassword === "function") showTempPassword(email, tempPassword); 
                if(typeof toast === "function") toast("Admin created successfully.", "success");
            }

        } catch(err) {
            console.error(err);
            if(typeof toast === "function") toast(err.message, "error");
        } finally {
            if(typeof hideLoading === "function") hideLoading();
        }
    }

    async function editAdmin(id){
        const snap = await db.ref(DB_PATH + "/" + id).once("value");
        if(snap.exists()){
            openAdminModal(snap.val(), id);
        }
    }

    async function deleteAdmin(id){
        const admin = admins.find(a => a.id === id);
        if(!admin) return;
        if(!confirm(`Delete ${admin.name}?`)) return;

        if(typeof showLoading === "function") showLoading(); 
        try {
            if(admin.avatarPath && typeof deleteFile === "function"){
                await deleteFile(BUCKET, admin.avatarPath);
            }
            await db.ref(`${DB_PATH}/${id}`).remove();
            if(typeof logActivity === "function") await logActivity("Admin Deleted", "delete");
            if(typeof toast === "function") toast("Admin deleted.", "success");
        } catch(err) {
            console.error(err);
            if(typeof toast === "function") toast("Unable to delete admin.", "error");
        } finally {
            if(typeof hideLoading === "function") hideLoading();
        }
    }

    function updateDashboard(){
        const count = $("#admin-count"); 
        if(count) {
            count.textContent = admins.length;
        }
    }

    function generatePassword(){
        return Math.random().toString(36).slice(-8) + "UI#";
    }

    return {
        init,
        editAdmin,
        deleteAdmin
    };
})();