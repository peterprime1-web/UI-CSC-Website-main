/*=====================================================
    UI CSC ADMIN PORTAL
    STUDENTS MODULE
======================================================*/

window.AdminStudents = (() => {

    const DB_PATH = "students";
    const BUCKET = "students";

    let students = [];
    let filteredStudents = [];

    // Helper functions
    function $(id) {
        return document.getElementById(id);
    }

    function show(message) {
        toast(message, "success");
    }

    function error(message) {
        toast(message, "error");
    }

    function loading(state) {
        state ? showLoading() : hideLoading();
    }

    function init() {
        if (!can("students")) return;
        bindEvents();
        listenForStudents();
    }

    function listenForStudents() {
        loading(true);
        db.ref(DB_PATH).on(
            "value",
            snapshot => {
                students = [];
                snapshot.forEach(child => {
                    students.push({
                        id: child.key,
                        ...child.val()
                    });
                });
                applyFilters();
                updateDashboard();
                loading(false);
            },
            err => {
                console.error(err);
                loading(false);
                error("Unable to load students.");
            }
        );
    }

    function applyFilters() {
        const search = ($("student-search")?.value || "").toLowerCase().trim();
        const level = $("student-level-filter")?.value || "";
        const status = $("student-status-filter")?.value || "";

        filteredStudents = students.filter(student => {
            const matchesSearch =
                (student.name || "").toLowerCase().includes(search) ||
                (student.email || "").toLowerCase().includes(search) ||
                (student.matricNumber || "").toLowerCase().includes(search) ||
                (student.level || "").toString().toLowerCase().includes(search);

            const matchesLevel = !level || student.level == level;
            const matchesStatus = !status || student.status === status;

            return matchesSearch && matchesLevel && matchesStatus;
        });

        renderStudents();
    }

    function bindEvents() {
        $("add-student-btn")?.addEventListener("click", () => openStudentModal());
        $("refresh-students")?.addEventListener("click", applyFilters);
        $("student-search")?.addEventListener("input", applyFilters);
        $("student-level-filter")?.addEventListener("change", applyFilters);
        $("student-status-filter")?.addEventListener("change", applyFilters);

        $("import-students-btn")?.addEventListener("click", () => {
            $("student-import-file").click();
        });

        $("student-import-file")?.addEventListener("change", importStudents);
        $("download-student-template")?.addEventListener("click", downloadStudentTemplate);
    }

    function openStudentModal(student = null) {
        openModal(
            student ? "Edit Student" : "Add Student",
            `
            <div class="form-grid">
                <div class="form-group">
                    <label>Full Name</label>
                    <input
                        id="student-name"
                        type="text"
                        value="${student ? student.name : ""}"
                        placeholder="e.g. Peter Afolayan">
                </div>
                <div class="form-group">
                    <label>Matric Number</label>
                    <input
                        id="student-matric"
                        type="text"
                        value="${student ? student.matricNumber : ""}"
                        placeholder="e.g. 123456">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input
                        id="student-email"
                        type="email"
                        value="${student ? student.email : ""}"
                        placeholder="student@mail.ui.edu.ng">
                </div>
                <div class="form-group">
                    <label>Level</label>
                    <select id="student-level">
                        <option value="100" ${student?.level == "100" ? "selected" : ""}>100</option>
                        <option value="200" ${student?.level == "200" ? "selected" : ""}>200</option>
                        <option value="300" ${student?.level == "300" ? "selected" : ""}>300</option>
                        <option value="400" ${student?.level == "400" ? "selected" : ""}>400</option>
                        <option value="500" ${student?.level == "500" ? "selected" : ""}>500</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input
                        id="student-phone"
                        type="tel"
                        value="${student ? student.phone || "" : ""}"
                        placeholder="+234...">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="student-status">
                        <option value="Active" ${student?.status == "Active" ? "selected" : ""}>Active</option>
                        <option value="Suspended" ${student?.status == "Suspended" ? "selected" : ""}>Suspended</option>
                    </select>
                </div>
                <div class="form-group full-width">
                    <label>
                        ${student ? "Replace Photo (Optional)" : "Profile Picture (Optional)"}
                    </label>
                    <input
                        id="student-photo"
                        type="file"
                        accept="image/*">
                </div>
            </div>
            `,
            () => {
                student ? updateStudent(student.id) : saveStudent();
            }
        );
    }

    function renderStudents() {
        // Fallback to "students-table" if you don't use a specific table body element
        const tableBody = $("students-table-body") || $("students-table");
        if (!tableBody) return;

        if (!filteredStudents.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <span class="material-icons">groups</span>
                        <h3>No students found</h3>
                        <p>Add your first student to get started.</p>
                    </td>
                </tr>
            `;
            return;
        }

        // Dynamically populate the rows safely inside this method
        tableBody.innerHTML = filteredStudents.map(student => {
            const status = student.status || "Active";
            return `
                <tr>
                    <td>
                        <img
                            src="${student.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(student.name)}"
                            class="student-avatar"
                            alt="${student.name}">
                    </td>
                    <td><strong>${student.name}</strong></td>
                    <td>${student.matricNumber}</td>
                    <td>${student.level}</td>
                    <td>${student.email}</td>
                    <td>
                        <span class="status-badge ${status.toLowerCase()}">
                            ${status}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button
                                class="icon-btn"
                                onclick="AdminStudents.editStudent('${student.id}')"
                                title="Edit">
                                <span class="material-icons">edit</span>
                            </button>
                            <button
                                class="icon-btn"
                                onclick="AdminStudents.deleteStudent('${student.id}')"
                                title="Delete">
                                <span class="material-icons">delete</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    }

    async function saveStudent() {
        const nameEl = $("student-name");
        const matricEl = $("student-matric");
        const emailEl = $("student-email");
        const levelEl = $("student-level");
        const phoneEl = $("student-phone");
        const statusEl = $("student-status");

        if (!nameEl || !matricEl || !emailEl) return;

        const name = nameEl.value.trim();
        const matricNumber = matricEl.value.trim();
        const email = emailEl.value.trim();
        const level = levelEl.value;
        const phone = phoneEl.value.trim();
        const status = statusEl.value;

        if (!name) return error("Enter the student's name.");
        if (!matricNumber) return error("Enter the matric number.");
        if (!email) return error("Enter the email address.");

        const matricExists = students.find(s => (s.matricNumber || "").toLowerCase() === matricNumber.toLowerCase());
        if (matricExists) return error("A student with this matric number already exists.");

        const emailExists = students.find(s => (s.email || "").toLowerCase() === email.toLowerCase());
        if (emailExists) return error("A student with this email already exists.");

        const saveBtn = $("save-modal");
        if (saveBtn) saveBtn.disabled = true;

        loading(true);
        try {
            let avatar = { fileName: "", filePath: "", fileUrl: "" };
            const photo = $("student-photo").files[0];
            if (photo) {
                avatar = await uploadFile(BUCKET, photo);
            }

            await db.ref(DB_PATH).push().set({
                name,
                matricNumber,
                email,
                level,
                phone,
                status,
                avatarUrl: avatar.fileUrl,
                avatarPath: avatar.filePath,
                createdAt: Date.now(),
                updatedAt: Date.now()
            });

            logActivity(`Added ${name} (${matricNumber})`, "groups");
            closeModal();
            show("Student added successfully.");
        } catch (err) {
            console.error(err);
            error("Unable to add student.");
            if (saveBtn) saveBtn.disabled = false;
        } finally {
            loading(false);
        }
    }

    function updateDashboard() {
        console.log("Updating students dashboard", students.length);
        const count = $("student-count");
        if (count) count.textContent = students.length;
    }

    function downloadStudentTemplate() {
        const data = [{ Name: "", MatricNumber: "", Email: "", Level: "100", Phone: "" }];
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
        XLSX.writeFile(workbook, "Student_Template.xlsx");
    }

    async function importStudents(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet);
            previewStudentImport(rows);
        };
        reader.readAsArrayBuffer(file);
        event.target.value = "";
    }

    function previewStudentImport(rows) {
        db.ref(DB_PATH).once("value").then(snapshot => {
            const existing = snapshot.exists() ? Object.values(snapshot.val()) : [];
            rows = rows.map(row => {
                const matric = String(row.MatricNumber || "").trim();
                let status = "Ready";
                let valid = true;

                if (!row.Name) {
                    status = "Missing Name";
                    valid = false;
                } else if (!matric) {
                    status = "Missing Matric";
                    valid = false;
                } else if (existing.some(s => s.matricNumber === matric)) {
                    status = "Duplicate";
                    valid = false;
                }

                return { ...row, valid, status };
            });
            openImportPreview(rows);
        });
    }

    async function importStudentRows(rows) {
        loading(true);
        const validRows = rows.filter(r => r.valid);
        let imported = 0;
        let skipped = 0;

        try {
            const snapshot = await db.ref(DB_PATH).once("value");
            const existing = snapshot.exists() ? Object.values(snapshot.val()) : [];

            for (const row of validRows) {
                const name = String(row.Name || "").trim();
                const matricNumber = String(row.MatricNumber || "").trim();
                const email = String(row.Email || "").trim();
                const level = String(row.Level || "").trim();
                const phone = String(row.Phone || "").trim();

                if (!name || !matricNumber || !email || !level) {
                    skipped++;
                    continue;
                }

                const duplicate = existing.find(student =>
                    student.matricNumber === matricNumber ||
                    student.email.toLowerCase() === email.toLowerCase()
                );

                if (duplicate) {
                    skipped++;
                    continue;
                }

                await db.ref(DB_PATH).push().set({
                    name,
                    matricNumber,
                    email,
                    level,
                    phone,
                    status: "Active",
                    avatarUrl: "",
                    avatarPath: "",
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                });

                existing.push({ matricNumber, email });
                imported++;
            }

            closeModal();
            show(`${imported} students imported.`);
            if (skipped) {
                toast(`${skipped} duplicate/invalid rows skipped.`, "warning");
            }
            logActivity(`Imported ${imported} students`, "groups");
        } catch (err) {
            console.error(err);
            error("Import failed.");
        } finally {
            loading(false);
        }
    }

    function openImportPreview(rows) {
        openModal(
            "Import Students",
            `
            <div style="max-height:450px;overflow:auto;">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Name</th>
                            <th>Matric</th>
                            <th>Email</th>
                            <th>Level</th>
                        </tr>
                    </thead>
                    <tbody>
                    ${rows.map(r => `
                        <tr class="${r.valid ? "" : "invalid-row"}">
                            <td>${r.valid ? "✅ Ready" : "❌ " + r.status}</td>
                            <td>${r.Name || ""}</td>
                            <td>${r.MatricNumber || ""}</td>
                            <td>${r.Email || ""}</td>
                            <td>${r.Level || ""}</td>
                        </tr>
                    `).join("")}
                    </tbody>
                </table>
            </div>
            `
        );

        const saveBtn = $("save-modal");
        if (saveBtn) {
            saveBtn.onclick = () => importStudentRows(rows);
        }
    }

    function editStudent(id) {
        const student = students.find(s => s.id === id);
        if (!student) return error("Student not found.");
        openStudentModal(student);
    }

    async function updateStudent(id) {
        const student = students.find(s => s.id === id);
        if (!student) return;

        const nameEl = $("student-name");
        const matricEl = $("student-matric");
        const emailEl = $("student-email");
        const levelEl = $("student-level");
        const phoneEl = $("student-phone");
        const statusEl = $("student-status");

        if (!nameEl || !matricEl || !emailEl) return;

        const name = nameEl.value.trim();
        const matricNumber = matricEl.value.trim();
        const email = emailEl.value.trim();
        const level = levelEl.value;
        const phone = phoneEl.value.trim();
        const status = statusEl.value;

        if (!name || !matricNumber || !email) {
            return error("Please complete all required fields.");
        }

        const matricExists = students.find(s => s.id !== id && (s.matricNumber || "").toLowerCase() === matricNumber.toLowerCase());
        if (matricExists) return error("Matric number already exists.");

        const emailExists = students.find(s => s.id !== id && (s.email || "").toLowerCase() === email.toLowerCase());
        if (emailExists) return error("Email already exists.");

        const saveBtn = $("save-modal");
        if (saveBtn) saveBtn.disabled = true;

        loading(true);
        try {
            let avatarUrl = student.avatarUrl || "";
            let avatarPath = student.avatarPath || "";
            const photo = $("student-photo").files[0];

            if (photo) {
                if (avatarPath) {
                    await deleteFile(BUCKET, avatarPath);
                }
                const upload = await uploadFile(BUCKET, photo);
                avatarUrl = upload.fileUrl;
                avatarPath = upload.filePath;
            }

            await db.ref(`${DB_PATH}/${id}`).update({
                name,
                matricNumber,
                email,
                level,
                phone,
                status,
                avatarUrl,
                avatarPath,
                updatedAt: Date.now()
            });

            logActivity(`Updated ${name}`, "edit");
            closeModal();
            show("Student updated successfully.");
        } catch (err) {
            console.error(err);
            error("Unable to update student.");
            if (saveBtn) saveBtn.disabled = false;
        } finally {
            loading(false);
        }
    }

    async function deleteStudent(id) {
        const student = students.find(s => s.id === id);
        if (!student) return;

        if (!confirm(`Delete ${student.name}?`)) return;

        loading(true);
        try {
            if (student.avatarPath) {
                await deleteFile(BUCKET, student.avatarPath);
            }
            await db.ref(`${DB_PATH}/${id}`).remove();
            logActivity(`Deleted ${student.name}`, "delete");
            show("Student deleted.");
        } catch (err) {
            console.error(err);
            error("Unable to delete student.");
        } finally {
            loading(false);
        }
    }

    // Exposed API placed at the bottom for readability
    return {
        init,
        editStudent,
        deleteStudent,
        openStudentModal
    };

})();

