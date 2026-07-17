// =========================================
// PERMISSIONS
// =========================================

window.AdminPermissions = (() => {

    const DB_PATH = "admins";

    let admins = [];
    let selectedAdmin = null;

    function init(){

        if(!can("permissions"))
        return;

        bindEvents();

        listenForAdmins();

    }

    function bindEvents(){

        $("#permission-search").oninput = filterAdmins;

        $("#save-permissions").onclick = savePermissions;

    }

    function listenForAdmins(){

        db.ref(DB_PATH).on("value", snapshot=>{

            admins = [];

            if(snapshot.exists()){

                snapshot.forEach(child=>{

                    admins.push({

                        id:child.key,

                        ...child.val()

                    });

                });

            }

            renderAdminList();

        });

    }

    function filterAdmins(){

        const search = $("#permission-search")
            .value
            .toLowerCase()
            .trim();

        const filtered = admins.filter(admin=>{

            return (

                (admin.name || "")
    .toLowerCase()
    .includes(search)

                ||

                (admin.email || "")
    .toLowerCase()
    .includes(search)

            );

        });

        renderAdminList(filtered);

    }

    function renderAdminList(list = admins){

    const container = $("#permissions-admin-list");

    if(!container) return;

    if(!list.length){

        container.innerHTML = `
            <div class="empty-state">

                <span class="material-icons">
                    security
                </span>

                <p>No administrators found.</p>

            </div>
        `;

        return;

    }

    container.innerHTML = list.map(admin=>`

        <div
            class="permission-user ${selectedAdmin?.id===admin.id ? "active" : ""}"
            data-id="${admin.id}">

            <strong>${admin.name}</strong>

            <small>${admin.role}</small>

        </div>

    `).join("");

    container.querySelectorAll(".permission-user")
        .forEach(card=>{

            card.onclick=()=>{

                loadPermissions(card.dataset.id);

            };

        });

}

   function loadPermissions(id){

    selectedAdmin =
        admins.find(a=>a.id===id);

    if(!selectedAdmin)
        return;

    renderAdminList();

    $("#selected-admin-header").innerHTML = `

        <h3>${selectedAdmin.name}</h3>

        <p>

            ${selectedAdmin.role}

            •

            ${selectedAdmin.email}

        </p>

    `;

    const permissions =
        selectedAdmin.permissions || {};

    $("#perm-dashboard").checked =
        !!permissions.dashboard;

    $("#perm-students").checked =
        !!permissions.students;

    $("#perm-admins").checked =
        !!permissions.admins;

    $("#perm-courses").checked =
        !!permissions.courses;

    $("#perm-notes").checked =
        !!permissions.notes;

    $("#perm-materials").checked =
        !!permissions.materials;

    $("#perm-assignments").checked =
        !!permissions.assignments;

    $("#perm-announcements").checked =
        !!permissions.announcements;

    $("#perm-syllabus").checked =
        !!permissions.syllabus;

    $("#perm-activity").checked =
        !!permissions.activity;

    $("#perm-settings").checked =
        !!permissions.settings;

    $("#perm-permissions").checked =
        !!permissions.permissions;

}
    async function savePermissions(){

        if(!selectedAdmin){

            toast("Select an administrator.","error");

            return;

        }

        const permissions={

            dashboard:$("#perm-dashboard").checked,

            students:$("#perm-students").checked,

            admins:$("#perm-admins").checked,

            courses:$("#perm-courses").checked,

            notes:$("#perm-notes").checked,

            materials:$("#perm-materials").checked,

            assignments:$("#perm-assignments").checked,

            announcements:$("#perm-announcements").checked,

            syllabus:$("#perm-syllabus").checked,

            activity:$("#perm-activity").checked,

            settings:$("#perm-settings").checked,

            permissions:$("#perm-permissions").checked

        };

        showLoading();

        try{

            await db.ref(

                `${DB_PATH}/${selectedAdmin.id}/permissions`

            ).set(permissions);

            await logActivity(
    `Updated permissions for ${selectedAdmin.name}`,
    "security"
);

            toast(

                "Permissions updated.",

                "success"

            );

        }

        catch(err){

            console.error(err);

            toast(

                err.message,

                "error"

            );

        }

        finally{

            hideLoading();

        }

    }

    return{

        init

    };

})();