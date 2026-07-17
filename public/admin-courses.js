/*=====================================================
    UI CSC ADMIN PORTAL
    COURSES MODULE
======================================================*/

window.AdminCourses = (() => {

    const DB_PATH = "courses";

    let courses = [];
    let filteredCourses = [];

    /*==========================================
        DOM HELPERS
    ==========================================*/

    function $(id) {
        return document.getElementById(id);
    }

    function show(message) {
        if (typeof toast === "function")
            toast(message, "success");
    }

    function error(message) {
        if (typeof toast === "function")
            toast(message, "error");
    }

    function loading(state) {
        if (typeof showLoading !== "function")
            return;

        if (state)
            showLoading();
        else
            hideLoading();
    }

    /*==========================================
        INITIALIZE
    ==========================================*/

    function init() {
        // Safe check for external 'can' helper
        if (typeof can === "function" && !can("courses"))
            return;

        bindEvents();
        listenForCourses();
    }

    /*==========================================
        FIREBASE LISTENER
    ==========================================*/

    function listenForCourses() {
        loading(true);

        db.ref(DB_PATH).on(
            "value",
            snapshot => {
                courses = [];
                snapshot.forEach(child => {
                    courses.push({
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
                error("Failed to load courses.");
            }
        );
    }

    /*==========================================
        DASHBOARD COUNT
    ==========================================*/

    function updateDashboard() {
        const count = $("course-count");
        if (count)
            count.textContent = courses.length;
    }

    /*==========================================
        RENDER
    ==========================================*/

    function renderCourses() {
        console.log("Rendering...");
        console.log(filteredCourses);

        const table = $("courses-list");
        console.log(table);

        if (!table) return;

        if (!filteredCourses.length) {
            table.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        No courses found.
                    </td>
                </tr>
            `;
            return;
        }

        table.innerHTML = filteredCourses.map(course => `
            <tr>
                <td>${course.code}</td>
                <td>${course.title}</td>
                <td>${course.level}</td>
                <td>${course.semester}</td>
                <td>${course.unit}</td>
                <td>${course.resources || 0}</td>
                <td>
                    <button
                        class="icon-btn"
                        onclick="AdminCourses.editCourse('${course.id}')">
                        <span class="material-icons">edit</span>
                    </button>
                    <button
                        class="icon-btn"
                        onclick="AdminCourses.deleteCourse('${course.id}')">
                        <span class="material-icons">delete</span>
                    </button>
                </td>
            </tr>
        `).join("");
    }

    /*==========================================
        SEARCH
    ==========================================*/

    function searchCourses(keyword) {
        keyword = keyword.toLowerCase();
        filteredCourses = courses.filter(course =>
            (course.code || "").toLowerCase().includes(keyword) ||
            course.title.toLowerCase().includes(keyword)
        );
        renderCourses();
    }

    /*==========================================
        FILTER
    ==========================================*/

    function filterLevel(level) {
        if (level === "All") {
            filteredCourses = [...courses];
        } else {
            filteredCourses = courses.filter(
                c => c.level == level
            );
        }
        renderCourses();
    }

    /*==========================================
        EVENTS
    ==========================================*/

    function bindEvents() {
        const searchInput = $("course-search");
        const levelFilter = $("course-level-filter");
        const semesterFilter = $("course-semester-filter");
        const addBtn = $("add-course-btn");

        if (searchInput) searchInput.addEventListener("input", applyFilters);
        if (levelFilter) levelFilter.addEventListener("change", applyFilters);
        if (semesterFilter) semesterFilter.addEventListener("change", applyFilters);
        
        if (addBtn) {
            addBtn.onclick = openAddModal;
        }

        // Optional sort dropdown attachment
        const sortSelect = $("course-sort");
        if (sortSelect) {
            sortSelect.addEventListener("change", e => {
                sortCourses(e.target.value);
            });
        }
    }

    /*==========================================
        ADD COURSE
    ==========================================*/

    function openAddModal() {
        openModal(
            "Add Course",
            `
            <div class="form-grid">
                <div class="form-group">
                    <label>Course Code</label>
                    <input id="course-code" type="text" placeholder="CSC101">
                </div>
                <div class="form-group">
                    <label>Course Title</label>
                    <input id="course-title" type="text" placeholder="Introduction to Computing">
                </div>
                <div class="form-group">
                    <label>Level</label>
                    <select id="course-level">
                        <option value="100">100</option>
                        <option value="200">200</option>
                        <option value="300">300</option>
                        <option value="400">400</option>
                        <option value="500">500</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Semester</label>
                    <select id="course-semester">
                        <option value="All">All Semesters</option>
                        <option value="First">First</option>
                        <option value="Second">Second</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Units</label>
                    <input id="course-unit" type="number" min="1" max="6" placeholder="3">
                </div>
            </div>
            `
        );

        const saveBtn = $("save-modal");
        if (saveBtn)
            saveBtn.onclick = saveCourse;
    }

    /*==========================================
        VALIDATION
    ==========================================*/

    function validateCourse(course) {
        if (!course.code)
            return "Course code is required.";
        if (!course.title)
            return "Course title is required.";
        if (!course.level)
            return "Course level is required.";
        if (!course.semester)
            return "Course semester is required.";
        if (!course.unit)
            return "Units are required.";

        return null;
    }

    /*==========================================
        SAVE COURSE
    ==========================================*/

    async function saveCourse() {
        const course = {
            code: $("course-code").value.trim().toUpperCase(),
            title: $("course-title").value.trim(),
            level: $("course-level").value,
            semester: $("course-semester").value,
            unit: Number($("course-unit").value),
            status: "Active"
        };

        const validation = validateCourse(course);
        if (validation) {
            error(validation);
            return;
        }

        loading(true);

        try {
            await db.ref(DB_PATH).push().set(course);
            loading(false);
            if (typeof logActivity === "function") {
                await logActivity(`Added Course: ${course.code} - ${course.title}`, "school");
            }
            closeModal();
            show("Course added successfully.");
        }
        catch (err) {
            console.error(err);
            loading(false);
            error("Unable to save course.");
        }
    }

    /*==========================================
        EDIT COURSE
    ==========================================*/

    function editCourse(id) {
        const course = courses.find(c => c.id === id);
        if (!course) return;

        openModal(
            "Edit Course",
            `
            <div class="form-grid">
                <div class="form-group">
                    <label>Course Code</label>
                    <input id="course-code" value="${course.code}">
                </div>
                <div class="form-group">
                    <label>Course Title</label>
                    <input id="course-title" value="${course.title}">
                </div>
                <div class="form-group">
                    <label>Level</label>
                    <select id="course-level">
                        <option value="100" ${course.level=="100"?"selected":""}>100</option>
                        <option value="200" ${course.level=="200"?"selected":""}>200</option>
                        <option value="300" ${course.level=="300"?"selected":""}>300</option>
                        <option value="400" ${course.level=="400"?"selected":""}>400</option>
                        <option value="500" ${course.level=="500"?"selected":""}>500</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Semester</label>
                    <select id="course-semester">
                        <option value="First" ${course.semester=="First"?"selected":""}>First</option>
                        <option value="Second" ${course.semester=="Second"?"selected":""}>Second</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Units</label>
                    <input id="course-unit" type="number" value="${course.unit}">
                </div>
            </div>
            `
        );

        $("save-modal").onclick = () => updateCourse(id);
    }

    /*==========================================
        UPDATE COURSE
    ==========================================*/

    async function updateCourse(id) {
        const data = {
            code: $("course-code").value.trim().toUpperCase(),
            title: $("course-title").value.trim(),
            level: $("course-level").value,
            semester: $("course-semester").value,
            unit: Number($("course-unit").value)
        };

        const validation = validateCourse(data);
        if (validation) {
            error(validation);
            return;
        }

        loading(true);

        try {
            await db.ref(DB_PATH + "/" + id).update(data);
            loading(false);
            if (typeof logActivity === "function") {
                await logActivity(`Updated Course: ${data.code} - ${data.title}`, "edit");
            }
            closeModal();
            show("Course updated.");
        }
        catch(err){
            console.error(err);
            loading(false);
            error("Unable to update course.");
        }
    }

    /*==========================================
        DELETE COURSE
    ==========================================*/

    async function deleteCourse(id){
        const course = courses.find(c => c.id === id);

        if(!course){
            error("Course not found.");
            return;
        }

        if(!confirm("Delete this course?"))
            return;

        loading(true);

        try{
            await db.ref(`${DB_PATH}/${id}`).remove();
            if (typeof logActivity === "function") {
                await logActivity(`Deleted Course: ${course.code} - ${course.title}`, "delete");
            }
            show("Course deleted.");
        }
        catch(err){
            console.error(err);
            error("Unable to delete course.");
        }
        finally{
            loading(false);
        }
    }

    /*==========================================
        EVENT DELEGATION
    ==========================================*/

    document.addEventListener("click", e => {
        const edit = e.target.closest(".edit-course");
        if(edit){
            editCourse(edit.dataset.id);
            return;
        }

        const del = e.target.closest(".delete-course");
        if(del){
            deleteCourse(del.dataset.id);
            return;
        }
    });

    function applyFilters() {
        const searchInput = $("course-search");
        const levelFilter = $("course-level-filter");
        const semesterFilter = $("course-semester-filter");

        const search = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const level = levelFilter ? levelFilter.value : "";
        const semester = semesterFilter ? semesterFilter.value : "";

        filteredCourses = courses.filter(course => {
            const matchesSearch =
                (course.code || "").toLowerCase().includes(search) ||
                (course.title || "").toLowerCase().includes(search);

            const matchesLevel =
                !level || level === "All" || course.level == level;

            const matchesSemester =
                !semester || semester === "All" || course.semester == semester;

            return matchesSearch && matchesLevel && matchesSemester;
        });

        renderCourses();
    }

    /*==========================================
        PUBLIC API
    ==========================================*/

    function refresh() {
        const refreshBtn = $("refresh-courses");
        if (refreshBtn) {
            refreshBtn.addEventListener("click", () => {
                applyFilters();
                renderCourses();
                show("Courses refreshed.");
            });
        }
    }

    /*==========================================
        SORT COURSES
    ==========================================*/

    function sortCourses(type = "code") {
        filteredCourses.sort((a, b) => {
            switch (type) {
                case "title":
                    return a.title.localeCompare(b.title);
                case "level":
                    return Number(a.level) - Number(b.level);
                case "semester":
                    return a.semester.localeCompare(b.semester);
                case "code":
                default:
                    return a.code.localeCompare(b.code);
            }
        });
        renderCourses();
    }

    /*==========================================
        RELOAD
    ==========================================*/

    function load() {
        renderCourses();
    }

    /*==========================================
        GET COURSE OPTIONS (Moved inside Module)
    ==========================================*/

    function getCourseOptions() {
        return courses.map(course =>
            `<option value="${course.id}">
                ${course.code} — ${course.title}
            </option>`
        ).join("");
    }

    /*==========================================
        RETURN PUBLIC METHODS
    ==========================================*/

    return {
        init,
        load,
        refresh,
        openAddModal,
        editCourse,
        deleteCourse,
        searchCourses,
        filterLevel,
        sortCourses,
        getCourseOptions
    };

})();

/*=====================================================
    AUTO START
======================================================*/

