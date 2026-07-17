// =========================================
// ACTIVITY LOG
// =========================================

window.AdminActivity = (()=>{

    const DB_PATH = "activity";

    let activities = [];

    let filteredActivities = [];

    function init(){

    if(!can("activity"))

        return;
         bindEvents();
        listenForActivity();
        
    
}

    function bindEvents(){

        $("#activity-search").oninput =
            filterActivity;

        $("#activity-filter").onchange =
            filterActivity;

        $("#clear-activity").onclick =
    clearActivity;

    }

        function listenForActivity(){

    db.ref(DB_PATH)
        .on("value", snapshot=>{

            activities = [];

            if(snapshot.exists()){

                snapshot.forEach(child=>{

                    activities.push({

                        id: child.key,

                        ...child.val()

                    });

                });

            }

            activities.sort(

                (a,b)=>

                    (b.timestamp||0)

                    -

                    (a.timestamp||0)

            );

            filteredActivities = [...activities];

            renderActivity();

        });

}

function filterActivity(){

    const search =

        $("#activity-search")

        .value

        .toLowerCase()

        .trim();

    const action =

        $("#activity-filter")

        .value;

    filteredActivities =

        activities.filter(activity=>{

            const matchesSearch =

                (activity.title||"")

                .toLowerCase()

                .includes(search);

            const matchesAction =

                !action ||

                activity.icon===action;

            return(

                matchesSearch &&

                matchesAction

            );

        });

    renderActivity();

}

function renderActivity(){

    const table =

        $("#activity-table");

    if(!filteredActivities.length){

        table.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="empty-state">

                    <span class="material-icons">

                        history

                    </span>

                    <h3>

                        No activity found

                    </h3>

                </td>

            </tr>

        `;

        return;

    }

    table.innerHTML =

        filteredActivities.map(activity=>`

            <tr>

                <td>

                    <span
                        class="material-icons">

                        ${activity.icon||"history"}

                    </span>

                </td>

                <td>

                    ${activity.title}

                </td>

                <td>

                    ${activity.time}

                </td>

                <td>

                    <button

                        class="icon-btn danger"

                        onclick="AdminActivity.deleteActivity('${activity.id}')">

                        <span
                            class="material-icons">

                            delete

                        </span>

                    </button>

                </td>

            </tr>

        `).join("");

}

    async function deleteActivity(id){

    if(
        !confirm(
            "Delete this activity?"
        )
    ) return;

    showLoading();

    try{

        await db.ref(
            `${DB_PATH}/${id}`
        ).remove();

        toast(
            "Activity deleted.",
            "success"
        );

    }

    catch(err){

        console.error(err);

        toast(
            "Unable to delete activity.",
            "error"
        );

    }

    finally{

        hideLoading();

    }

}

async function clearActivity(){

    if(
        !confirm(
            "Clear all activity logs?"
        )
    ) return;

    showLoading();

    try{

        await db.ref(
            DB_PATH
        ).remove();

        toast(
            "Activity log cleared.",
            "success"
        );

    }

    catch(err){

        console.error(err);

        toast(
            "Unable to clear activity log.",
            "error"
        );

    }

    finally{

        hideLoading();

    }

}

return{

    init,

    deleteActivity,

    clearActivity

};

})();