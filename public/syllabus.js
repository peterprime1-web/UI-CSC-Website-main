// ========================================
// SYLLABUS
// ========================================

window.Syllabus = (() => {

    let syllabi = [];
    let filteredSyllabi = [];

    function init(){

        loadSyllabus();

        document
            .getElementById("syllabus-search")
            ?.addEventListener("input", filterSyllabus);

        document
            .getElementById("syllabus-course-filter")
            ?.addEventListener("change", filterSyllabus);

    }

    // ========================================
    // LOAD
    // ========================================

    async function loadSyllabus(){

        try{

            const snapshot = await db.ref("syllabus").once("value");

            syllabi = [];

            if(snapshot.exists()){

                snapshot.forEach(child=>{

                    syllabi.push({

                        id: child.key,

                        ...child.val()

                    });

                });

            }

            syllabi.sort((a,b)=>

                (b.uploadedAt||0) -

                (a.uploadedAt||0)

            );

            filteredSyllabi = [...syllabi];

            populateCourses();

            render();

        }

        catch(err){

            console.error("Syllabus Error:", err);

        }

    }

    // ========================================
    // RENDER
    // ========================================

    function render(){

        const grid = document.getElementById("syllabus-grid");

        if(!grid) return;

        if(filteredSyllabi.length===0){

            grid.innerHTML = `

                <div class="empty-state">

                    <span class="material-icons">

                        school

                    </span>

                    <h3>No syllabus uploaded.</h3>

                </div>

            `;

            return;

        }

        grid.innerHTML = filteredSyllabi.map(item=>`

            <div class="material-card searchable">

                <div class="material-title">

                    <span class="material-icons">

                        school

                    </span>

                    <h3>${item.title}</h3>

                </div>

                <div class="material-meta">

                    <span>${item.course}</span>

                    <span>${item.level} Level</span>

                    <span>${item.semester}</span>

                </div>

                <p class="material-description">

                    ${item.description || "No description provided."}

                </p>

                <div class="material-footer">

                    <small>

                        ${formatDate(item.uploadedAt)}

                    </small>

                    <a
                        href="${item.fileUrl}"
                        target="_blank"
                        class="primary-btn">

                        <span class="material-icons">

                            download

                        </span>

                        Open Syllabus

                    </a>

                </div>

            </div>

        `).join("");

    }

    // ========================================
    // FILTER
    // ========================================

    function filterSyllabus(){

        const search = (

            document.getElementById("syllabus-search")?.value || ""

        ).toLowerCase().trim();

        const course =

            document.getElementById("syllabus-course-filter")?.value

            || "all";

        filteredSyllabi = syllabi.filter(item=>{

            const matchesCourse =

                course==="all"

                ||

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

        const filter =

            document.getElementById("syllabus-course-filter");

        if(!filter) return;

        const courses = [

            ...new Set(

                syllabi.map(item=>item.course)

            )

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

    return{

        init

    };

})();