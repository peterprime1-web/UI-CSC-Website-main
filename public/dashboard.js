window.Dashboard = (()=>{

    async function init(){

        loadStats();
        loadRecentNotes();
        loadRecentAssignments();
        loadTodayClasses();
        initShortcuts();

    }

    async function loadStats(){

    try{

        const [

            courses,

            notes,

            materials,

            assignments

        ] = await Promise.all([

            db.ref("courses").once("value"),

            db.ref("notes").once("value"),

            db.ref("materials").once("value"),

            db.ref("assignments").once("value")

        ]);

        document.getElementById("course-count").textContent =
            courses.numChildren();

        document.getElementById("notes-count").textContent =
            notes.numChildren();

        document.getElementById("materials-count").textContent =
            materials.numChildren();

        document.getElementById("assignment-count").textContent =
            assignments.numChildren();

    }

    catch(err){

        console.error(err);

    }

}

    async function loadRecentNotes(){

    const container =
        document.getElementById("recent-notes");

    if(!container) return;

    const snapshot = await db

        .ref("notes")

        .limitToLast(3)

        .once("value");

    if(!snapshot.exists()) return;

    const notes=[];

    snapshot.forEach(child=>{

        notes.unshift(child.val());

    });

    container.innerHTML = notes.map(note=>`

        <div class="recent-item">

            <strong>${note.title}</strong>

            <small>${note.course}</small>

        </div>

    `).join("");

}

    async function loadRecentAssignments(){

    const container =
        document.getElementById("recent-assignments");

    if(!container) return;

    const snapshot = await db

        .ref("assignments")

        .limitToLast(3)

        .once("value");

    if(!snapshot.exists()) return;

    const assignments=[];

    snapshot.forEach(child=>{

        assignments.unshift(child.val());

    });

    container.innerHTML = assignments.map(item=>`

        <div class="recent-item">

            <strong>${item.title}</strong>

            <small>

                ${item.course}

            </small>

        </div>

    `).join("");

}

    function loadTodayClasses(){

    const container =
        document.getElementById("today-classes");

    if(!container) return;

    container.innerHTML = `

        <div class="empty-state">

            <span class="material-icons">

                event

            </span>

            <p>

                Timetable integration coming soon.

            </p>

        </div>

    `;

}

    function initShortcuts(){

    document

        .getElementById("open-ai")

        ?.addEventListener("click",()=>{

            StudentPortal.showPage("ai");

        });

}
    return{

        init

    };

})();