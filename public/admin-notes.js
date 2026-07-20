/*=====================================================
    UI CSC ADMIN PORTAL
    NOTES MODULE
======================================================*/

window.AdminNotes = (() => {

    const DB_PATH = "notes";

    let notes = [];

    let filteredNotes = [];

    let courses = [];

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

    function init(){

    if(!can("notes"))

        return;
         bindEvents();
         loadCourses();
        listenForNotes();
        
    
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

function listenForNotes(){

    loading(true);

    db.ref(DB_PATH).on(

        "value",

        snapshot=>{

            notes=[];

            snapshot.forEach(child=>{

                notes.push({

                    id:child.key,

                    ...child.val()

                });

            });

            applyFilters();
            updateDashboard();

            loading(false);

        },

        err=>{

            console.error(err);

            loading(false);

            error("Unable to load notes.");

        }

    );

}

function openNoteModal(note = null){

    console.log("Modal opening...");
    const options = courses.map(course => `

        <option
            value="${course.id}"
            ${note && note.course===course.code ? "selected" : ""}>

            ${course.code} - ${course.title}

        </option>

    `).join("");

    openModal(

        note ? "Edit Note" : "Add Note",

        `

        <div class="form-grid">

            <div class="form-group">

                <label>Title</label>

                <input
                    id="note-title"
                    type="text"
                    value="${note ? note.title : ""}">

            </div>

            <div class="form-group">

                <label>Course</label>

                <select id="note-course">

                    ${options}

                </select>

            </div>

            <div class="form-group">

                <label>Description</label>

                <textarea
                    id="note-description">${note ? note.description || "" : ""}</textarea>

            </div>

            <div class="form-group">

                <label>

                    ${note ? "Replace PDF (optional)" : "PDF"}

                </label>

                <input
                    id="note-file"
                    type="file"
                    accept=".pdf">

            </div>

        </div>

        `

    );

    $("save-modal").onclick = () =>

        note

            ? updateNote(note.id)

            : saveNote();

}

async function saveNote(){

    const courseId=$("note-course").value;

    const course=courses.find(c=>c.id===courseId);

    if(!course){

        error("Select a course.");

        return;

    }

    const file=$("note-file").files[0];

    if(!file){

        error("Select a PDF.");

        return;

    }

    loading(true);

    try{

        const upload = await uploadPDF(file);

        const noteId = db.ref(DB_PATH).push();

        await noteId.set({

            title:$("note-title").value.trim(),

            description:$("note-description").value.trim(),

            course:course.code,

            level:course.level,

            semester:course.semester,

            fileName:file.name,

            fileUrl:upload.fileUrl,

            filePath:upload.filePath,

            uploadedAt:Date.now()
        });

        

        loading(false);

        try {

    await fetch("https://ui-csc-website-main.onrender.com/notify-notes", {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            title: $("note-title").value.trim(),

            message: $("note-description").value.trim()

        })

    });

}

catch(err){

    console.error("Notification failed:", err);

}

        
        await logActivity(`Uploaded note: ${$("note-title").value.trim()}`, "description");

        closeModal();

        show("Note uploaded successfully.");

        


    }

    catch(err){

        console.error(err);

        loading(false);

        error("Upload failed.");

    }

}

    /*==========================================
        FILTERS
    ==========================================*/

    function applyFilters(){

        const search = $("note-search")?.value.toLowerCase().trim() || "";

        const level = $("note-level-filter")?.value || "";

        const semester = $("note-semester-filter")?.value || "";

        filteredNotes=notes.filter(note=>{

            const matchesSearch=

                note.title.toLowerCase().includes(search)||

                note.course.toLowerCase().includes(search);

            const matchesLevel=

                !level||note.level==level;

            const matchesSemester=

                !semester||note.semester==semester;

            return(

                matchesSearch&&

                matchesLevel&&

                matchesSemester

            );

        });

        renderNotes();

    }

    /*==========================================
        EVENTS
    ==========================================*/

    function bindEvents(){

        $("add-note-btn").addEventListener("click", () => {

    console.log("Button clicked");

    openNoteModal();

});

        $("refresh-notes")?.addEventListener("click",applyFilters);

        $("note-search")?.addEventListener("input",applyFilters);

        $("note-level-filter")?.addEventListener("change",applyFilters);

        $("note-semester-filter")?.addEventListener("change",applyFilters);

    }

    /*==========================================
        PLACEHOLDERS
    ==========================================*/

        function renderNotes(){

    const table=$("notes-table");

    if(!table) return;

    if(!filteredNotes.length){

        table.innerHTML=`

            <tr>

                <td colspan="6" class="empty-state">

                    No notes found.

                </td>

            </tr>

        `;

        return;

    }

    table.innerHTML=filteredNotes.map(note=>`

        <tr>

            <td>

                <strong>${note.title}</strong>

            </td>

            <td>

                ${note.course}

            </td>

            <td>

                ${note.level}

            </td>

            <td>

                ${note.semester}

            </td>

            <td>

                <a
                    href="${note.fileUrl}"
                    target="_blank"
                    class="text-btn">

                    ${note.fileName}

                </a>

            </td>

            <td>

                <button

                    class="icon-btn"

                    onclick="window.open('${note.fileUrl}','_blank')"

                    title="View">

                    <span class="material-icons">

                        visibility

                    </span>

                </button>

                <button

                    class="icon-btn"

                    onclick="AdminNotes.editNote('${note.id}')"

                    title="Edit">

                    <span class="material-icons">

                        edit

                    </span>

                </button>

                <button

                    class="icon-btn"

                    onclick="AdminNotes.deleteNote('${note.id}')"

                    title="Delete">

                    <span class="material-icons">

                        delete

                    </span>

                </button>

            </td>

        </tr>

    `).join("");

}
    


    async function updateNote(id){

    const courseId = $("note-course").value;

    const course = courses.find(c => c.id===courseId);

    if(!course){

        error("Invalid course.");

        return;

    }

    const file = $("note-file").files[0];

    loading(true);

    try{

        let fileUrl = notes.find(n=>n.id===id).fileUrl;

        let fileName = notes.find(n=>n.id===id).fileName;

        if(file){

            fileUrl = await uploadPDF(file);

            fileName = file.name;

        }

        await db.ref(DB_PATH+"/"+id).update({

            title:$("note-title").value.trim(),

            description:$("note-description").value.trim(),

            course:course.code,

            level:course.level,

            semester:course.semester,

            fileUrl,

            fileName

        });

        loading(false);

        await logActivity(`Updated note: ${note.title}`, "edit");

        closeModal();

        show("Note updated.");

    }

    catch(err){

        console.error(err);

        loading(false);

        error("Unable to update note.");

    }

}




        // We'll connect this to Supabase next.
        async function uploadPDF(file){

    const extension = file.name.split(".").pop();

    const filename =
        `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2,8)}.${extension}`;

    const { error } = await window.supabaseClient.storage
        .from("notes")
        .upload(filename, file);

    if(error)
        throw error;

    const { data } = window.supabaseClient.storage
        .from("notes")
        .getPublicUrl(filename);

    return {

        fileUrl: data.publicUrl,

        filePath: filename

    };

}
        
    

    function editNote(id){
         const note = notes.find(n => n.id === id);

    if(!note) return;

    openNoteModal(note);
    }

    async function deleteNote(id){

    if(!confirm("Delete this note?"))
        return;

    loading(true);

    try{

        const note = notes.find(n => n.id === id);

        if(note?.filePath){

            const { error } = await window.supabaseClient.storage

                .from("notes")

                .remove([note.filePath]);

            if(error)
                throw error;

        }

        await db.ref(DB_PATH + "/" + id).remove();

        loading(false);

        await logActivity(`Deleted note: ${note.title}`, "delete");

        show("Note deleted successfully.");

    }

    catch(err){

        console.error(err);

        loading(false);

        error("Unable to delete note.");

    }

}
    /*==========================================
        PUBLIC API
    ==========================================*/

    return{

        init,

        editNote,

        deleteNote,

        openNoteModal

    };

    function updateDashboard(){

    console.log("Updating notes dashboard", notes.length);

    const count = $("note-count");

    if(count)

        count.textContent = notes.length;

}

})();
