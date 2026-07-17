window.Notes = (() => {

    Portal.setCurrentPage("notes");
    let notes = [];
    let filteredNotes = [];

    function init(){

        loadNotes();

        const search=document.getElementById("notes-search");

        if(search){

            search.addEventListener("input",filterNotes);

        }

        const filter=document.getElementById("notes-course-filter");

        if(filter){

            filter.addEventListener("change",filterNotes);

        }

    }


    async function loadNotes(){

    try{

        const snapshot = await db.ref("notes").once("value");

        notes = [];

        if(snapshot.exists()){

            snapshot.forEach(child=>{

                notes.push({

                    id: child.key,

                    ...child.val()

                });

            });

        }

        notes.sort((a,b)=>

            (b.uploadedAt||0) -

            (a.uploadedAt||0)

        );

        filteredNotes = [...notes];

        populateNoteCourses();

        renderNotes();

    }

    catch(err){

        console.error("Notes Error:",err);

    }

}


    function renderNotes(){

    const grid = $("#notes-grid");

    if(!grid) return;

    if(filteredNotes.length===0){

        grid.innerHTML=`

            <div class="empty-state">

                <span class="material-icons">

                    menu_book

                </span>

                <h3>No notes available.</h3>

            </div>

        `;

        return;

    }

    grid.innerHTML = filteredNotes.map(note=>`

        <div class="material-card searchable">

            <div class="material-title">

                <span class="material-icons">

                    ${getNoteIcon(note.fileName)}

                </span>

                <h3>${note.title}</h3>

            </div>

            <div class="material-meta">

                <span>${note.course}</span>

                <span>${note.level} Level</span>

                <span>${note.semester} Semester</span>

            </div>

            <p class="material-description">

                ${note.description || "No description provided."}

            </p>

            <div class="material-footer">

                <small>

                    ${formatDate(note.uploadedAt)}

                </small>

                <a

                    href="${note.fileUrl}"

                    target="_blank"

                    class="primary-btn">

                    <span class="material-icons">

                        download

                    </span>

                    Open Note

                </a>

            </div>

        </div>

    `).join("");

}


    function filterNotes(){

    const search =
        (document.getElementById("notes-search")?.value || "")
        .toLowerCase()
        .trim();

    const course =
        document.getElementById("notes-course-filter")?.value || "all";

    filteredNotes = notes.filter(note=>{

        const matchesCourse =
            course === "all" ||
            note.course === course;

        const text = `
            ${note.title}
            ${note.description}
            ${note.course}
            ${note.level}
            ${note.semester}
        `.toLowerCase();

        return matchesCourse && text.includes(search);

    });

    renderNotes();

}

    function populateNoteCourses(){

    const filter =
        document.getElementById("notes-course-filter");

    if(!filter) return;

    const courses = [
        ...new Set(notes.map(note => note.course))
    ];

    filter.innerHTML = `
        <option value="all">
            All Courses
        </option>
    `;

    courses.forEach(course=>{

        filter.innerHTML += `
            <option value="${course}">
                ${course}
            </option>
        `;

    });

}

    function getNoteIcon(fileName){

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

    return {

        init

    };

})();