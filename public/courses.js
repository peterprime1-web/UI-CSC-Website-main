window.Courses = (() => {

    let courses = [];
    let filteredCourses = [];

    function init(){

        loadCourses();

        const search = document.getElementById("courses-search");
        if(search){
            search.addEventListener("input", filterCourses);
        }

        const level = document.getElementById("courses-level-filter");
        if(level){
            level.addEventListener("change", filterCourses);
        }

    }

    async function loadCourses(){

        try{

            const snapshot = await db.ref("courses").once("value");

            courses = [];

            if(snapshot.exists()){

                snapshot.forEach(child=>{

                    courses.push({

                        id: child.key,
                        ...child.val()

                    });

                });

            }

            courses.sort((a,b)=>
                (a.code || "").localeCompare(b.code || "")
            );

            filteredCourses = [...courses];

            populateLevels();

            renderCourses();

            updateCourseCount();

        }

        catch(err){

            console.error("Courses Error:", err);

        }

    }

    function renderCourses(){

        const grid = document.getElementById("courses-grid");

        if(!grid) return;

        if(filteredCourses.length===0){

            grid.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons">
                        menu_book
                    </span>
                    <h3>No courses available.</h3>
                </div>
            `;

            return;

        }

        grid.innerHTML = filteredCourses.map(course=>`

            <div class="course-card searchable">

                <div class="course-header">

                    <h3>${course.code}</h3>

                    <span class="course-status ${String(course.status || "").toLowerCase()}">

                        ${course.status || "Active"}

                    </span>

                </div>

                <h4>${course.title}</h4>

                <div class="course-meta">

                    <span>${course.level} Level</span>

                    <span>${course.semester}</span>

                    <span>${course.unit} Units</span>

                </div>

            </div>

        `).join("");

    }

    function filterCourses(){

        const search = (
            document.getElementById("courses-search")?.value || ""
        ).toLowerCase();

        const level =
            document.getElementById("courses-level-filter")?.value || "all";

        filteredCourses = courses.filter(course=>{

            const matchesLevel =
                level==="all" ||
                course.level===level;

            const text = `
                ${course.code}
                ${course.title}
                ${course.semester}
            `.toLowerCase();

            return matchesLevel &&
                   text.includes(search);

        });

        renderCourses();

    }

    function populateLevels(){

        const filter = document.getElementById("courses-level-filter");

        if(!filter) return;

        const levels = [...new Set(courses.map(c=>c.level))];

        filter.innerHTML = `
            <option value="all">All Levels</option>
        `;

        levels.forEach(level=>{

            filter.innerHTML += `
                <option value="${level}">
                    ${level} Level
                </option>
            `;

        });

    }

    function updateCourseCount(){

        const count = document.getElementById("course-count");

        if(count){

            count.textContent = courses.length;

        }

    }

    return{

        init

    };

})();