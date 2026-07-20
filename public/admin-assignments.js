window.AdminAssignments = (() => {

    const DB_PATH = "assignments";

    const BUCKET = "assignments";

    let assignments = [];

    let filteredAssignments = [];

    let courses = [];

    /*==========================================
        DOM HELPERS
    ==========================================*/

    function $(id){

        return document.getElementById(id);

    }

    function show(message){

        if(typeof toast==="function")

            toast(message,"success");

    }

    function error(message){

        if(typeof toast==="function")

            toast(message,"error");

    }

    function loading(state){

        if(typeof showLoading!=="function")

            return;

        state ? showLoading() : hideLoading();

    }

    function getAssignmentStatus(dueDate){

        const today = new Date();

        today.setHours(0,0,0,0);

        const due = new Date(dueDate);

        due.setHours(0,0,0,0);

        if(due.getTime()===today.getTime())

            return "Due Today";

        if(due<today)

            return "Closed";

        return "Open";

    }

    function init(){

    if(!can("assignments"))

        return;
         bindEvents();
         loadCourses();
        listenForAssignments();
        
    
}

    function loadCourses(){

        db.ref("courses").once("value")

        .then(snapshot=>{

            courses=[];

            snapshot.forEach(child=>{

                courses.push({

                    id:child.key,

                    ...child.val()

                });

            });

        });

    }

    function listenForAssignments(){

        loading(true);

        db.ref(DB_PATH).on(

            "value",

            snapshot=>{

                assignments=[];

                snapshot.forEach(child=>{

                    assignments.push({

                        id:child.key,

                        ...child.val()

                    });

                });

                assignments.sort(

                    (a,b)=>

                        (b.uploadedAt||0)-(a.uploadedAt||0)

                );

                applyFilters();

                updateDashboard();

                loading(false);

            },

            err=>{

                console.error(err);

                loading(false);

                error("Unable to load assignments.");

            }

        );

    }

    function updateDashboard(){

        const count=$("assignment-count");

        if(count)

            count.textContent=assignments.length;

    }

    function applyFilters(){

        const search=$("assignment-search")?.value
            .toLowerCase()
            .trim() || "";

        const level=$("assignment-level-filter")?.value || "";

        const semester=$("assignment-semester-filter")?.value || "";

        const status=$("assignment-status-filter")?.value || "";

        filteredAssignments=assignments.filter(assignment=>{

            const matchesSearch=

                assignment.title
                    .toLowerCase()
                    .includes(search)

                ||

                assignment.course
                    .toLowerCase()
                    .includes(search);

            const matchesLevel=

                !level ||

                assignment.level==level;

            const matchesSemester=

                !semester ||

                assignment.semester==semester;

            const matchesStatus=

                !status ||

                getAssignmentStatus(

                    assignment.dueDate

                )===status;

            return(

                matchesSearch &&

                matchesLevel &&

                matchesSemester &&

                matchesStatus

            );

        });

        renderAssignments();

    }

    function bindEvents(){

        $("add-assignment-btn")?.addEventListener(

            "click",

            ()=>openAssignmentModal()

        );

        $("refresh-assignments")?.addEventListener(

            "click",

            applyFilters

        );

        $("assignment-search")?.addEventListener(

            "input",

            applyFilters

        );

        $("assignment-level-filter")?.addEventListener(

            "change",

            applyFilters

        );

        $("assignment-semester-filter")?.addEventListener(

            "change",

            applyFilters

        );

        $("assignment-status-filter")?.addEventListener(

            "change",

            applyFilters

        );

    }

    function openAssignmentModal(assignment = null){

        const options = courses.map(course=>`

            <option

                value="${course.id}"

                ${assignment && assignment.course===course.code ? "selected" : ""}>

                ${course.code} - ${course.title}

            </option>

        `).join("");

        openModal(

            assignment ? "Edit Assignment" : "Add Assignment",

            `

            <div class="form-grid">

                <div class="form-group">

                    <label>

                        Title

                    </label>

                    <input

                        id="assignment-title"

                        type="text"

                        value="${assignment ? assignment.title : ""}">

                </div>

                <div class="form-group">

                    <label>

                        Course

                    </label>

                    <select id="assignment-course">

                        ${options}

                    </select>

                </div>

                <div class="form-group">

                    <label>

                        Due Date

                    </label>

                    <input

                        id="assignment-due"

                        type="date"

                        value="${assignment ? assignment.dueDate : ""}">

                </div>

                <div class="form-group">

                    <label>

                        Description

                    </label>

                    <textarea

                        id="assignment-description">${assignment ? assignment.description || "" : ""}</textarea>

                </div>

                <div class="form-group">

                    <label>

                        ${assignment ? "Replace Attachment (optional)" : "Attachment"}

                    </label>

                    <input

                        id="assignment-file"

                        type="file"

                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.webp,.zip,.rar,.py,.java,.cpp,.c,.js,.html,.css">

                    <small id="selected-assignment-file">

                        ${assignment ? assignment.fileName : "No file selected"}

                    </small>

                </div>

            </div>

            `
        );

        const fileInput = $("assignment-file");

        const label = $("selected-assignment-file");

        fileInput.onchange = ()=>{

            label.textContent =

                fileInput.files.length

                    ? fileInput.files[0].name

                    : "No file selected";

        };

        $("save-modal").onclick=()=>{

            assignment

                ? updateAssignment(assignment.id)

                : saveAssignment();

        };

    }

    async function saveAssignment(){

        const course = courses.find(

            c=>c.id===$("assignment-course").value

        );

        if(!course){

            error("Select a course.");

            return;

        }

        const file = $("assignment-file").files[0];

        let upload = {

            fileName: "",

            filePath: "",

            fileUrl: ""

        };

        loading(true);

        const saveBtn = $("save-modal");

        saveBtn.disabled = true;

        saveBtn.textContent = "Uploading...";

        try{

            if(file){

                upload = await uploadFile(

                    BUCKET,

                    file

                );

            }

            const titleVal = $("assignment-title").value.trim();

            const assignmentId = db.ref(DB_PATH).push();

            await assignmentId.set({

                title: titleVal,

                description: $("assignment-description").value.trim(),

                course: course.code,

                level: course.level,

                semester: course.semester,

                dueDate: $("assignment-due").value,

                fileName: upload.fileName,

                filePath: upload.filePath,

                fileUrl: upload.fileUrl,

                uploadedAt: Date.now()

            });

            try {

    await fetch("https://ui-csc-website-main.onrender.com/notify-assignment", {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            dueDate: $("assignment-due").value,

            description: $("assignment-description").value.trim(),

        })

    });

}

catch(err){

    console.error("Notification failed:", err);

}

            
            // Log activity to Firebase
            await logActivity(`Uploaded assignment: ${titleVal} (${course.code})`, "assignment");

            closeModal();

            show("Assignment uploaded.");

            

        }

        catch(err){

            console.error(err);

            error("Upload failed.");

        }

        finally{

            saveBtn.disabled=false;

            saveBtn.textContent="Save";

            loading(false);

        }

    }

    async function updateAssignment(id){

        const assignment = assignments.find(

            a=>a.id===id

        );

        const course = courses.find(

            c=>c.id===$("assignment-course").value

        );

        if(!course){

            error("Select a course.");

            return;

        }

        let upload={

            fileName:assignment.fileName,

            filePath:assignment.filePath,

            fileUrl:assignment.fileUrl

        };

        const file = $("assignment-file").files[0];

        loading(true);

        try{

            if(file){

                upload = await uploadFile(

                    BUCKET,

                    file

                );

            }

            const titleVal = $("assignment-title").value.trim();

            await db.ref(DB_PATH+"/"+id).update({

                title: titleVal,

                description: $("assignment-description").value.trim(),

                course: course.code,

                level: course.level,

                semester: course.semester,

                dueDate: $("assignment-due").value,

                fileName: upload.fileName,

                filePath: upload.filePath,

                fileUrl: upload.fileUrl

            });

            if(file && assignment.filePath){

                await deleteFile(

                    BUCKET,

                    assignment.filePath

                );

            }

            // Log activity to Firebase
            await logActivity(`Updated assignment: ${titleVal} (${course.code})`, "edit");

            closeModal();

            show("Assignment updated.");

        }

        catch(err){

            console.error(err);

            error("Unable to update assignment.");

        }

        finally{

            loading(false);

        }

    }

    function renderAssignments(){

        const table = $("assignments-table");

        if(!table) return;

        if(!filteredAssignments.length){

            table.innerHTML = `

                <tr>

                    <td colspan="7" class="empty-state">

                        No assignments found.

                    </td>

                </tr>

            `;

            return;

        }

        table.innerHTML = filteredAssignments.map(assignment=>{

            const status = getAssignmentStatus(assignment.dueDate);

            return `

            <tr>

                <td>

                    <strong>${assignment.title}</strong>

                </td>

                <td>

                    ${assignment.course}

                </td>

                <td>

                    ${assignment.dueDate || "-"}

                </td>

                <td>

                    <span class="status ${status.toLowerCase().replace(/\s/g,"-")}">

                        ${status}

                    </span>

                </td>

                <td>

                    <a

                        href="${assignment.fileUrl}"

                        target="_blank"

                        class="text-btn">

                        ${assignment.fileName}

                    </a>

                </td>

                <td>

                    ${formatDate(assignment.uploadedAt)}

                </td>

                <td>

                    <button

                        class="icon-btn"

                        onclick="window.open('${assignment.fileUrl}','_blank')"

                        title="View">

                        <span class="material-icons">

                            visibility

                        </span>

                    </button>

                    <button

                        class="icon-btn"

                        onclick="AdminAssignments.editAssignment('${assignment.id}')"

                        title="Edit">

                        <span class="material-icons">

                            edit

                        </span>

                    </button>

                    <button

                        class="icon-btn"

                        onclick="AdminAssignments.deleteAssignment('${assignment.id}')"

                        title="Delete">

                        <span class="material-icons">

                            delete

                        </span>

                    </button>

                </td>

            </tr>

            `;

        }).join("");

    }

    function editAssignment(id){

        const assignment = assignments.find(

            a=>a.id===id

        );

        if(!assignment) return;

        openAssignmentModal(assignment);

    }

    async function deleteAssignment(id){

        const assignment = assignments.find(

            a=>a.id===id

        );

        if(!assignment) return;

        if(!confirm("Delete this assignment?"))

            return;

        loading(true);

        try{

            if(assignment.filePath){

                await deleteFile(

                    BUCKET,

                    assignment.filePath

                );

            }

            await db.ref(DB_PATH+"/"+id).remove();

            // Log activity to Firebase
            await logActivity(`Deleted assignment: ${assignment.title}`, "delete");

            show("Assignment deleted.");

        }

        catch(err){

            console.error(err);

            error("Unable to delete assignment.");

        }

        finally{

            loading(false);

        }

    }

    return {

        init,
         
        editAssignment,

        deleteAssignment,

        openAssignmentModal

    };

})();