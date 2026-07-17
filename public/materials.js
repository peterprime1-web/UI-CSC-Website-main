window.Materials = (() => {


    let materials = [];
    let filteredMaterials = [];

    // materials.js

     function init(){

        loadMaterials();

        const search =
            document.getElementById("materials-search");

        if(search){

            search.addEventListener("input", filterMaterials);

        }

        const filter =
            document.getElementById("materials-course-filter");

        if(filter){

            filter.addEventListener("change", filterMaterials);

        }

    }

async function initMaterials(){

    const grid = document.getElementById("materials-grid");

    if(!grid) return;

    await loadMaterials();

}

    async function loadMaterials(){

    try{

        const snapshot =
            await db.ref("materials").once("value");

        materials = [];

        if(snapshot.exists()){

            snapshot.forEach(child=>{

                materials.push({

                    id: child.key,

                    ...child.val()

                });

            });

        }

        materials.sort((a,b)=>

            (b.uploadedAt||0) -

            (a.uploadedAt||0)

        );

        filteredMaterials = [...materials];

        populateMaterialCourses();

        renderMaterials();

    }

    catch(err){

        console.error(err);

    }

}


    function renderMaterials(){

    const grid = document.getElementById("materials-grid");

    if(!grid) return;

    if(filteredMaterials.length === 0){

        grid.innerHTML = `

            <div class="empty-state">

                <span class="material-icons">

                    folder_open

                </span>

                <h3>No materials available.</h3>

            </div>

        `;

        return;

    }

    grid.innerHTML = filteredMaterials.map(material => `

        <div class="material-card searchable">

            <div class="material-header">

                <h3>${material.title}</h3>

                <span class="material-course">

                    ${material.course}

                </span>

            </div>

            <div class="material-meta">

                <span>${material.category}</span>

                <span>${material.level} Level</span>

                <span>${material.semester} Semester</span>

            </div>

            <p class="material-description">

                ${material.description || "No description provided."}

            </p>

            <div class="material-footer">

                <small>

                    ${formatDate(material.uploadedAt)}

                </small>

          

                <a

                    href="${material.fileUrl}"

                    target="_blank"

                    class="primary-btn">

                    <span class="material-icons">

    download

</span>

Open Material

                </a>

            </div>

        </div>

    `).join("");

}


    
function filterMaterials(){

    const search =

        ($("#materials-search")?.value || "")

        .toLowerCase()

        .trim();

    const course =

        $("#materials-course-filter")?.value || "all";

    filteredMaterials = materials.filter(material=>{

        const matchesCourse =

            course==="all"

            ||

            material.course===course;

        const text = `

            ${material.title}

            ${material.description}

            ${material.course}

            ${material.category}

            ${material.level}

            ${material.semester}

        `.toLowerCase();

        const matchesSearch =

            text.includes(search);

        return matchesCourse && matchesSearch;

    });

    renderMaterials();

}

    function populateMaterialCourses(){}

    function getMaterialIcon(fileName){

    if(!fileName)

        return "description";

    const extension =

        fileName

        .split(".")

        .pop()

        .toLowerCase();

    switch(extension){

        case "pdf":

            return "picture_as_pdf";

        case "ppt":

        case "pptx":

            return "slideshow";

        case "doc":

        case "docx":

            return "article";

        case "xls":

        case "xlsx":

            return "table_chart";

        case "zip":

        case "rar":

            return "folder_zip";

        case "mp4":

            return "movie";

        case "mp3":

            return "audiotrack";

        default:

            return "insert_drive_file";

    }

}
    function populateMaterialCourses(){

    const filter = document.getElementById("materials-course-filter");

    if(!filter) return;

    const courses = [...new Set(materials.map(m => m.course))];

    filter.innerHTML = `

        <option value="all">

            All Courses

        </option>

    `;

    courses.forEach(course => {

        filter.innerHTML += `

            <option value="${course}">

                ${course}

            </option>

        `;

    });

}

    return {

        init

    };

})();