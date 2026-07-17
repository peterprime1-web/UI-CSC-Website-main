/*=====================================================
    UI CSC ADMIN PORTAL
    SYLLABUS MODULE
======================================================*/

window.AdminSyllabus = (()=>{

    const DB_PATH = "syllabus";

    const BUCKET = "syllabi";

    let syllabus = [];

    let filteredSyllabus = [];

    let courses = [];

    function $(id){

        return document.getElementById(id);

    }

    function show(message){

        toast(message,"success");

    }

    function error(message){

        toast(message,"error");

    }

    function loading(state){

        state ? showLoading() : hideLoading();

    }

    function init(){

    if(!can("syllabus"))

        return;
         bindEvents();
         loadCourses();
        listenForSyllabus();
        
        
    
}

    return{

    init,

    editSyllabus,

    deleteSyllabus,

    openSyllabusModal

};

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

    function listenForSyllabus(){

    loading(true);

    db.ref(DB_PATH).on(

        "value",

        snapshot=>{

            syllabus=[];

            snapshot.forEach(child=>{

                syllabus.push({

                    id:child.key,

                    ...child.val()

                });

            });

            applyFilters();

            loading(false);

        },

        err=>{

            console.error(err);

            loading(false);

            error("Unable to load syllabus.");

        }

    );

}

    function applyFilters(){

    const search = $("syllabus-search")

        ?.value

        .toLowerCase()

        .trim() || "";

    const level =

        $("syllabus-level-filter")

        ?.value || "";

    const semester =

        $("syllabus-semester-filter")

        ?.value || "";

    filteredSyllabus = syllabus.filter(item=>{

        const matchesSearch =

            item.title.toLowerCase().includes(search)

            ||

            item.course.toLowerCase().includes(search);

        const matchesLevel =

            !level ||

            item.level==level;

        const matchesSemester =

            !semester ||

            item.semester==semester;

        return(

            matchesSearch &&

            matchesLevel &&

            matchesSemester

        );

    });

    renderSyllabus();

}

    function bindEvents(){

    $("add-syllabus-btn")

        ?.addEventListener(

            "click",

            ()=>openSyllabusModal()

        );

    $("refresh-syllabus")

        ?.addEventListener(

            "click",

            applyFilters

        );

    $("syllabus-search")

        ?.addEventListener(

            "input",

            applyFilters

        );

    $("syllabus-level-filter")

        ?.addEventListener(

            "change",

            applyFilters

        );

    $("syllabus-semester-filter")

        ?.addEventListener(

            "change",

            applyFilters

        );

}

    function openSyllabusModal(item = null){

    const options = courses.map(course => `

        <option
            value="${course.id}"
            ${item && item.course===course.code ? "selected" : ""}>

            ${course.code} - ${course.title}

        </option>

    `).join("");

    openModal(

        item ? "Edit Syllabus" : "Add Syllabus",

        `

        <div class="form-grid">

            <div class="form-group">

                <label>Title</label>

                <input

                    id="syllabus-title"

                    type="text"

                    value="${item ? item.title : ""}">

            </div>

            <div class="form-group">

                <label>Course</label>

                <select id="syllabus-course">

                    ${options}

                </select>

            </div>

            <div class="form-group">

                <label>Description</label>

                <textarea id="syllabus-description">

${item ? item.description || "" : ""}

                </textarea>

            </div>

            <div class="form-group">

                <label>

                    ${item ? "Replace PDF (Optional)" : "PDF"}

                </label>

                <input

                    id="syllabus-file"

                    type="file"

                    accept=".pdf">

            </div>

        </div>

        `

    );

    $("save-modal").onclick = ()=>{

        item

            ? updateSyllabus(item.id)

            : saveSyllabus();

    };

}

    function renderSyllabus(){

    const table = $("syllabus-table");

    if(!table) return;

    if(!filteredSyllabus.length){

        table.innerHTML = `

            <tr>

                <td colspan="7" class="empty-state">

                    <span class="material-icons">

                        fact_check

                    </span>

                    <h3>No syllabus uploaded</h3>

                    <p>Upload your first course syllabus.</p>

                </td>

            </tr>

        `;

        return;

    }

    table.innerHTML = filteredSyllabus.map(item=>`

        <tr>

            <td>${item.course}</td>

            <td>${item.title}</td>

            <td>${item.level}</td>

            <td>${item.semester}</td>

            <td>

                <a

                    href="${item.fileUrl}"

                    target="_blank"

                    class="text-btn">

                    ${item.fileName}

                </a>

            </td>

            <td>

                ${formatDate(item.uploadedAt)}

            </td>

            <td>

                <div class="action-buttons">

                    <button

                        class="icon-btn"

                        onclick="window.open('${item.fileUrl}','_blank')">

                        <span class="material-icons">

                            visibility

                        </span>

                    </button>

                    <button

                        class="icon-btn"

                        onclick="AdminSyllabus.editSyllabus('${item.id}')">

                        <span class="material-icons">

                            edit

                        </span>

                    </button>

                    <button

                        class="icon-btn"

                        onclick="AdminSyllabus.deleteSyllabus('${item.id}')">

                        <span class="material-icons">

                            delete

                        </span>

                    </button>

                </div>

            </td>

        </tr>

    `).join("");

}

    async function saveSyllabus(){

    const courseId = $("syllabus-course").value;

    const course = courses.find(c=>c.id===courseId);

    if(!course){

        error("Select a course.");

        return;

    }

    const existing = syllabus.find(

        s=>s.course===course.code

    );

    if(existing){

        error("This course already has a syllabus.");

        return;

    }

    const file = $("syllabus-file").files[0];

    if(!file){

        error("Select a PDF.");

        return;

    }

    loading(true);

    try{

        const upload = await uploadFile(

            BUCKET,

            file

        );

        await db.ref(DB_PATH).push().set({

            title:$("syllabus-title").value.trim(),

            description:$("syllabus-description").value.trim(),

            course:course.code,

            level:course.level,

            semester:course.semester,

            fileName:upload.fileName,

            filePath:upload.filePath,

            fileUrl:upload.fileUrl,

            uploadedAt:Date.now(),

            updatedAt:Date.now()

        });

        logActivity(
    `Updated Syllabus: ${course.code}`,
    "edit"
);

        closeModal();

        show("Syllabus uploaded.");

    }

    catch(err){

        console.error(err);

        error("Upload failed.");

    }

    finally{

        loading(false);

    }

}

    async function updateSyllabus(id){

    const item = syllabus.find(

        s=>s.id===id

    );

    const course = courses.find(

        c=>c.id===$("syllabus-course").value

    );

    if(!course) return;

    let upload={

        fileName:item.fileName,

        filePath:item.filePath,

        fileUrl:item.fileUrl

    };

    const file = $("syllabus-file").files[0];

    loading(true);

    try{

        if(file){

            if(item.filePath){

                await deleteFile(

                    BUCKET,

                    item.filePath

                );

            }

            upload = await uploadFile(

                BUCKET,

                file

            );

        }

        await db.ref(DB_PATH+"/"+id).update({

            title:$("syllabus-title").value.trim(),

            description:$("syllabus-description").value.trim(),

            course:course.code,

            level:course.level,

            semester:course.semester,

            fileName:upload.fileName,

            filePath:upload.filePath,

            fileUrl:upload.fileUrl,

            updatedAt:Date.now()

        });

        logActivity(

            `Updated ${course.code}`,

            "edit"

        );

        closeModal();

        show("Syllabus updated.");

    }

    catch(err){

        console.error(err);

        error("Unable to update.");

    }

    finally{

        loading(false);

    }

}

    function editSyllabus(id){

    const item = syllabus.find(

        s=>s.id===id

    );

    if(!item) return;

    openSyllabusModal(item);

}

    async function deleteSyllabus(id){

    const item = syllabus.find(

        s=>s.id===id

    );

    if(!item) return;

    if(!confirm(

        "Delete this syllabus?"

    )) return;

    loading(true);

    try{

        if(item.filePath){

            await deleteFile(

                BUCKET,

                item.filePath

            );

        }

        await db.ref(

            DB_PATH+"/"+id

        ).remove();

        logActivity(

            `Deleted ${item.course}`,

            "delete"

        );

        show("Syllabus deleted.");

    }

    catch(err){

        console.error(err);

        error("Unable to delete.");

    }

    finally{

        loading(false);

    }

}



})();