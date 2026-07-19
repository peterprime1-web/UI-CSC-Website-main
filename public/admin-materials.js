/*=====================================================
    UI CSC ADMIN PORTAL
    MATERIALS MODULE
======================================================*/

window.AdminMaterials = (() => {

    const DB_PATH = "materials";
    const BUCKET = "materials";

    let materials = [];
    let filteredMaterials = [];
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

    /*==========================================
        INITIALIZE
    ==========================================*/

    function init(){

    if(!can("materials"))

        return;
         bindEvents();
         loadCourses();
        listenForMaterials();
        
    
}

    /*==========================================
        LOAD COURSES
    ==========================================*/

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

    /*==========================================
        FIREBASE LISTENER
    ==========================================*/

    function listenForMaterials(){

        loading(true);

        db.ref(DB_PATH).on(

            "value",

            snapshot=>{

                materials=[];

                snapshot.forEach(child=>{

                    materials.push({

                        id:child.key,

                        ...child.val()

                    });

                });

                materials.sort(

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

                error("Unable to load materials.");

            }

        );

    }

    /*==========================================
        DASHBOARD
    ==========================================*/

    function updateDashboard(){

        console.log("Updating notes dashboard", materials.length);

        const count=$("material-count");

        if(count)

            count.textContent=materials.length;

    }

    /*==========================================
        EVENTS
    ==========================================*/

    function bindEvents(){

        $("add-material-btn")?.addEventListener(

            "click",

            ()=>openMaterialModal()

        );

        $("refresh-materials")?.addEventListener(

            "click",

            applyFilters

        );

        $("material-search")?.addEventListener(

            "input",

            applyFilters

        );

        $("material-level-filter")?.addEventListener(

            "change",

            applyFilters

        );

        $("material-semester-filter")?.addEventListener(

            "change",

            applyFilters

        );

        $("material-category-filter")?.addEventListener(

            "change",

            applyFilters

        );

    }

    /*==========================================
        FILTERS
    ==========================================*/

    function applyFilters(){

        const search=$("material-search")?.value
            .toLowerCase()
            .trim() || "";

        const level=$("material-level-filter")?.value || "";

        const semester=$("material-semester-filter")?.value || "";

        const category=$("material-category-filter")?.value || "";

        filteredMaterials=materials.filter(material=>{

            const matchesSearch=

                material.title.toLowerCase().includes(search) ||

                material.course.toLowerCase().includes(search);

            const matchesLevel=

                !level ||

                material.level==level;

            const matchesSemester=

                !semester ||

                material.semester==semester;

            const matchesCategory=

                !category ||

                material.category==category;

            return(

                matchesSearch &&

                matchesLevel &&

                matchesSemester &&

                matchesCategory

            );

        });

        renderMaterials();

    }

    /*==========================================
        PLACEHOLDERS
    ==========================================*/

    function openMaterialModal(material = null){

    const options = courses.map(course => `

        <option
            value="${course.id}"
            ${material && material.course===course.code ? "selected" : ""}>

            ${course.code} - ${course.title}

        </option>

    `).join("");

    openModal(

        material ? "Edit Material" : "Upload Material",

        `

        <div class="form-grid">

            <div class="form-group">

                <label>Title</label>

                <input

                    id="material-title"

                    type="text"

                    value="${material ? material.title : ""}">

            </div>

            <div class="form-group">

                <label>Course</label>

                <select id="material-course">

                    ${options}

                </select>

            </div>

            <div class="form-group">

                <label>Category</label>

                <select id="material-category">

                    <option value="Lecture Slides">Lecture Slides</option>

                    <option value="Lab Manual">Lab Manual</option>

                    <option value="Tutorial">Tutorial</option>

                    <option value="Practical">Practical</option>

                    <option value="Textbook">Textbook</option>

                    <option value="Reference">Reference</option>

                    <option value="Miscellaneous">Miscellaneous</option>

                </select>

            </div>

            <div class="form-group">

                <label>Description</label>

                <textarea id="material-description">

${material ? material.description || "" : ""}

                </textarea>

            </div>

            <div class="form-group">

                <label>

                    ${material ? "Replace PDF (optional)" : "PDF"}

                </label>

                <input

                    id="material-file"

                    type="file"

                    accept=".pdf">

                <small id="selected-material-file">

                    ${material ? material.fileName : "No file selected"}

                </small>

            </div>

        </div>

        `

    );

    const fileInput = $("material-file");

    const fileLabel = $("selected-material-file");

    fileInput.onchange = () => {

        fileLabel.textContent =

            fileInput.files.length

                ? fileInput.files[0].name

                : "No file selected";

    };

    $("save-modal").onclick = () =>

        material

            ? updateMaterial(material.id)

            : saveMaterial();

}

    function renderMaterials(){

    const table = $("materials-table");

    if(!table) return;

    if(!filteredMaterials.length){

        table.innerHTML = `

            <tr>

                <td colspan="8" class="empty-state">

                    No materials found.

                </td>

            </tr>

        `;

        return;

    }

    table.innerHTML = filteredMaterials.map(material => `

        <tr>

            <td>

                <strong>${material.title}</strong>

            </td>

            <td>

                ${material.course}

            </td>

            <td>

                ${material.category}

            </td>

            <td>

                ${material.level}

            </td>

            <td>

                ${material.semester}

            </td>

            <td>

                <a

                    href="${material.fileUrl}"

                    target="_blank"

                    class="text-btn">

                    ${material.fileName}

                </a>

            </td>

            <td>

                ${formatDate(material.uploadedAt)}

            </td>

            <td>

                <button

                    class="icon-btn"

                    onclick="window.open('${material.fileUrl}','_blank')"

                    title="View">

                    <span class="material-icons">

                        visibility

                    </span>

                </button>

                <button

                    class="icon-btn"

                    onclick="AdminMaterials.editMaterial('${material.id}')"

                    title="Edit">

                    <span class="material-icons">

                        edit

                    </span>

                </button>

                <button

                    class="icon-btn"

                    onclick="AdminMaterials.deleteMaterial('${material.id}')"

                    title="Delete">

                    <span class="material-icons">

                        delete

                    </span>

                </button>

            </td>

        </tr>

    `).join("");

}
    return{

    init,

    editMaterial,

    deleteMaterial,

    openMaterialModal

};

    async function saveMaterial(){

    const course = courses.find(

        c=>c.id===$("material-course").value

    );

    if(!course){

        error("Select a course.");

        return;

    }

    const file = $("material-file").files[0];

    if(!file){

        error("Select a PDF.");

        return;

    }

    const saveBtn = $("save-modal");

    saveBtn.disabled = true;

    saveBtn.textContent = "Uploading...";

    loading(true);

    try{

        const upload = await uploadFile(BUCKET,file);

        const materialId = db.ref(DB_PATH).push();

        await materialId.set({

            title:$("material-title").value.trim(),

            description:$("material-description").value.trim(),

            category:$("material-category").value,

            course:course.code,

            level:course.level,

            semester:course.semester,

            fileName:upload.fileName,

            filePath:upload.filePath,

            fileUrl:upload.fileUrl,

            uploadedAt:Date.now()

        });


          await logActivity(`Added learning material: ${materialTitle}`, "folder_open");

        closeModal();

        show("Material uploaded successfully.");

        await AdminNotifier.send(
    "material",
    title,
    materialId.key
);
      

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

    async function updateMaterial(id){

    const material = materials.find(

        m=>m.id===id

    );

    const course = courses.find(

        c=>c.id===$("material-course").value

    );

    if(!course){

        error("Select a course.");

        return;

    }

    let upload = {

        fileName:material.fileName,

        filePath:material.filePath,

        fileUrl:material.fileUrl

    };

    const file = $("material-file").files[0];

    loading(true);

    try{

        if(file){

            upload = await uploadFile(BUCKET,file);

        }

        await db.ref(DB_PATH+"/"+id).update({

            title:$("material-title").value.trim(),

            description:$("material-description").value.trim(),

            category:$("material-category").value,

            course:course.code,

            level:course.level,

            semester:course.semester,

            fileName:upload.fileName,

            filePath:upload.filePath,

            fileUrl:upload.fileUrl

        });

        if(file){

            await deleteFile(

                BUCKET,

                material.filePath

            );

        }

        await logActivity(`Updated material: ${materialTitle}`, "edit");

        closeModal();

        show("Material updated.");

    }

    catch(err){

        console.error(err);

        error("Unable to update material.");

    }

    finally{

        loading(false);

    }

}


    function editMaterial(id){

    const material = materials.find(

        m => m.id === id

    );

    if(!material) return;

    openMaterialModal(material);

}

async function deleteMaterial(id){

    const material = materials.find(

        m => m.id === id

    );

    if(!material) return;

    confirmDelete(

        `Delete "${material.title}"?`,

        async()=>{

            loading(true);

            try{

                if(material.filePath){

                    await deleteFile(

                        BUCKET,

                        material.filePath

                    );

                }

                await db.ref(

                    DB_PATH+"/"+id

                ).remove();

                await logActivity(`Deleted material: ${material.title}`, "delete");

                show("Material deleted.");

            }

            catch(err){

                console.error(err);

                error("Unable to delete material.");

            }

            finally{

                loading(false);

            }

        }

    );

}
})();