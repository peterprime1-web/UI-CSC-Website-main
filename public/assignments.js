// ========================================
// ASSIGNMENTS
// ========================================

window.Assignments = (() => {

    let assignments = [];
    let filteredAssignments = [];

    function init(){

        loadAssignments();

        const search = document.getElementById("assignments-search");

        if(search){

            search.addEventListener("input", filterAssignments);

        }

        const filter = document.getElementById("assignments-course-filter");

        if(filter){

            filter.addEventListener("change", filterAssignments);

        }

    }

    // ========================================
    // LOAD
    // ========================================

    async function loadAssignments(){

        try{

            const snapshot = await db.ref("assignments").once("value");

            assignments = [];

            if(snapshot.exists()){

                snapshot.forEach(child=>{

                    assignments.push({

                        id: child.key,

                        ...child.val()

                    });

                });

            }

            assignments.sort((a,b)=>

                (b.createdAt || b.uploadedAt || 0) -

                (a.createdAt || a.uploadedAt || 0)

            );

            filteredAssignments = [...assignments];

            populateCourses();

            render();

        }

        catch(err){

            console.error("Assignments Error:", err);

        }

    }

    // ========================================
    // RENDER
    // ========================================

    function render(){

        const container = document.getElementById("assignments-list");

        if(!container) return;

        if(filteredAssignments.length===0){

            container.innerHTML=`

                <div class="empty-state">

                    <span class="material-icons">

                        assignment

                    </span>

                    <h3>No assignments available.</h3>

                </div>

            `;

            return;

        }

        container.innerHTML = filteredAssignments.map(item=>`

            <div class="material-card searchable">

                <div class="material-title">

                    <span class="material-icons">

                        assignment

                    </span>

                    <h3>${item.title}</h3>

                </div>

                <div class="material-meta">

                    <span>${item.course}</span>

                    <span>${item.level} Level</span>

                    <span>${item.semester} Semester</span>

                </div>

                <p class="material-description">

                    ${item.description || "No description provided."}

                </p>

                <div class="material-footer">

                    <small>

                        Due:

                        ${formatDate(item.dueDate || item.deadline)}

                    </small>

                    ${item.fileUrl ?

                    `

                    <a

                        href="${item.fileUrl}"

                        target="_blank"

                        class="primary-btn">

                        <span class="material-icons">

                            download

                        </span>

                        Open Assignment

                    </a>

                    `

                    : ""}

                </div>

            </div>

        `).join("");

        

    }

    // ========================================
    // FILTER
    // ========================================

    function filterAssignments(){

        const search = (

            document.getElementById("assignments-search")?.value || ""

        ).toLowerCase().trim();

        const course =

            document.getElementById("assignments-course-filter")?.value

            || "all";

        filteredAssignments = assignments.filter(item=>{

            const matchesCourse =

                course==="all" ||

                item.course===course;

            const text = `

                ${item.title}

                ${item.description}

                ${item.course}

                ${item.level}

                ${item.semester}

            `.toLowerCase();

            return matchesCourse && text.includes(search);

        });

        render();

    }

    // ========================================
    // COURSE FILTER
    // ========================================

    function populateCourses(){

        const filter = document.getElementById("assignments-course-filter");

        if(!filter) return;

        const courses = [...new Set(assignments.map(a=>a.course))];

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

    return{

        init

    };

})();