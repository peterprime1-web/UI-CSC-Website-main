/*=====================================================
    UI CSC ADMIN PORTAL
    ANNOUNCEMENTS MODULE
======================================================*/

window.AdminAnnouncements = (()=>{

    const DB_PATH = "announcements";

    const BUCKET = "announcements";

    let announcements = [];

    let filteredAnnouncements = [];

    function $(id){
        return document.getElementById(id);
    }

    function show(msg){
        toast(msg,"success");
    }

    function error(msg){
        toast(msg,"error");
    }

    function loading(state){
        state
            ? showLoading()
            : hideLoading();
    }

    function init(){

    if(!can("announcements"))

        return;
         bindEvents();
        listenForAnnouncements();
        
    
}

    return{

    init,

    openAnnouncementModal,

    editAnnouncement,

    deleteAnnouncement

};

    function listenForAnnouncements(){

    loading(true);

    db.ref(DB_PATH).on(

        "value",

        snapshot=>{

            announcements=[];

            snapshot.forEach(child=>{

                announcements.push({

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

            error("Unable to load announcements.");

        }

    );

}

    function applyFilters(){

    const search = $("announcement-search")
        ?.value
        .toLowerCase()
        .trim() || "";

    const audience =
        $("announcement-audience-filter")
        ?.value || "";

    const pinned =
        $("announcement-pinned-filter")
        ?.value || "";

    filteredAnnouncements = announcements.filter(a=>{

        const matchesSearch =

            a.title.toLowerCase().includes(search)

            ||

            a.message.toLowerCase().includes(search);

        const matchesAudience =

            !audience ||

            a.audience===audience;

        const matchesPinned =

            !pinned ||

            String(a.pinned)===pinned;

        return(

            matchesSearch &&

            matchesAudience &&

            matchesPinned

        );

    });

    filteredAnnouncements.sort((a,b)=>{

        if(a.pinned!==b.pinned)

            return b.pinned-a.pinned;

        return b.createdAt-a.createdAt;

    });

    renderAnnouncements();

}

    function bindEvents(){

    $("add-announcement-btn")
        ?.addEventListener(

            "click",

            ()=>openAnnouncementModal()

        );

    $("refresh-announcements")
        ?.addEventListener(

            "click",

            applyFilters

        );

    $("announcement-search")
        ?.addEventListener(

            "input",

            applyFilters

        );

    $("announcement-audience-filter")
        ?.addEventListener(

            "change",

            applyFilters

        );

    $("announcement-pinned-filter")
        ?.addEventListener(

            "change",

            applyFilters

        );

}

    function openAnnouncementModal(announcement=null){

    openModal(

        announcement

            ? "Edit Announcement"

            : "Add Announcement",

        `

        <div class="form-grid">

            <div class="form-group">

                <label>

                    Title

                </label>

                <input

                    id="announcement-title"

                    value="${announcement?.title || ""}"

                    type="text">

            </div>

            <div class="form-group">

                <label>

                    Audience

                </label>

                <select id="announcement-audience">

                    <option value="Everyone">

                        Everyone

                    </option>

                    <option value="100">

                        100 Level

                    </option>

                    <option value="200">

                        200 Level

                    </option>

                    <option value="300">

                        300 Level

                    </option>

                    <option value="400">

                        400 Level

                    </option>

                    <option value="500">

                        500 Level

                    </option>

                </select>

            </div>

            <div class="form-group">

                <label>

                    Type

                </label>

                <select id="announcement-type">

                    <option>

                        Information

                    </option>

                    <option>

                        Important

                    </option>

                    <option>

                        Urgent

                    </option>

                </select>

            </div>

            <div class="form-group">

                <label>

                    Message

                </label>

                <textarea

                    id="announcement-message">${announcement?.message || ""}</textarea>

            </div>

            <div class="form-group">

                <label>

                    Attachment

                </label>

                <input

                    id="announcement-file"

                    type="file">

            </div>

            <div class="form-group">

                <label>

                    <input

                        id="announcement-pinned"

                        type="checkbox"

                        ${announcement?.pinned ? "checked" : ""}>

                    Pin Announcement

                </label>

            </div>

        </div>

        `

    );

    $("save-modal").onclick=()=>{

        announcement

            ? updateAnnouncement(announcement.id)

            : saveAnnouncement();

    };

}

    async function saveAnnouncement(){

    const title = $("announcement-title").value.trim();

    const message = $("announcement-message").value.trim();

    if(!title){

        error("Enter a title.");

        return;

    }

    if(!message){

        error("Enter a message.");

        return;

    }

    loading(true);

    try{

        let upload = {

            fileName: "",

            filePath: "",

            fileUrl: ""

        };

        const file = $("announcement-file").files[0];

        if(file){

            upload = await uploadFile(

                BUCKET,

                file

            );

        }

        const newRef = db.ref(DB_PATH).push();
        await newRef.set({

            title,

            message,

            audience:$("announcement-audience").value,

            type:$("announcement-type").value,

            pinned:$("announcement-pinned").checked,

            fileName:upload.fileName,

            filePath:upload.filePath,

            fileUrl:upload.fileUrl,

            createdAt:Date.now(),

            updatedAt:Date.now()

        });
        
        try {

    await fetch("https://ui-csc-website-main.onrender.com/notify-announcement", {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            title,

            message

        })

    });

}

catch(err){

    console.error("Notification failed:", err);

}
      
        await logActivity(

            `Added announcement "${title}"`,

            "campaign"

        );

        closeModal();

        show("Announcement added.");

          await AdminNotifier.send(
    "announcement",
    title,
    newRef.key
);

    }

    catch(err){

        console.error(err);

        error("Unable to save announcement.");

    }

    finally{

        loading(false);

    }

}

    async function updateAnnouncement(id){

    const announcement = announcements.find(

        a=>a.id===id

    );

    if(!announcement) return;

    loading(true);

    try{

        let upload={

            fileName:announcement.fileName,

            filePath:announcement.filePath,

            fileUrl:announcement.fileUrl

        };

        const file = $("announcement-file").files[0];

        if(file){

            upload = await uploadFile(

                BUCKET,

                file

            );

            if(announcement.filePath){

                await deleteFile(

                    BUCKET,

                    announcement.filePath

                );

            }

        }

        await db.ref(DB_PATH+"/"+id).update({

            title:$("announcement-title").value.trim(),

            message:$("announcement-message").value.trim(),

            audience:$("announcement-audience").value,

            type:$("announcement-type").value,

            pinned:$("announcement-pinned").checked,

            fileName:upload.fileName,

            filePath:upload.filePath,

            fileUrl:upload.fileUrl,

            updatedAt:Date.now()

        });

        await logActivity(

            `Updated announcement "${announcement.title}"`,

            "edit"

        );

        closeModal();

        show("Announcement updated.");

    }

    catch(err){

        console.error(err);

        error("Unable to update announcement.");

    }

    finally{

        loading(false);

    }

}

    function editAnnouncement(id){

    const announcement = announcements.find(

        a=>a.id===id

    );

    if(!announcement) return;

    openAnnouncementModal(announcement);

}

    async function deleteAnnouncement(id){

    const announcement = announcements.find(

        a=>a.id===id

    );

    if(!announcement) return;

    if(!confirm("Delete this announcement?"))

        return;

    loading(true);

    try{

        if(announcement.filePath){

            await deleteFile(

                BUCKET,

                announcement.filePath

            );

        }

        await db.ref(DB_PATH+"/"+id).remove();

        await logActivity(

            `Deleted announcement "${announcement.title}"`,

            "delete"

        );

        show("Announcement deleted.");

    }

    catch(err){

        console.error(err);

        error("Unable to delete announcement.");

    }

    finally{

        loading(false);

    }

}

function renderAnnouncements(){

    const container = $("announcements-container");

    if(!container) return;

    if(!filteredAnnouncements.length){

        container.innerHTML = `

        <div class="empty-state">

            <span class="material-icons">

                campaign

            </span>

            <h3>

                No announcements found

            </h3>

        </div>

        `;

        return;

    }

    container.innerHTML = filteredAnnouncements.map(a=>`

        <div class="announcement-card">

            <div class="announcement-header">

                <div>

                    ${a.pinned
                        ? '<span class="pin-badge">📌 Pinned</span>'
                        : ""}

                    <span class="type-badge ${a.type.toLowerCase()}">

                        ${a.type}

                    </span>

                </div>

                <small>

                    ${formatDate(a.createdAt)}

                </small>

            </div>

            <h3>

                ${a.title}

            </h3>

            <p>

                ${a.message}

            </p>

            <div class="announcement-meta">

                <span>

                    👥 ${a.audience}

                </span>

                ${
                    a.fileUrl

                    ?

                    `

                    <a

                        href="${a.fileUrl}"

                        target="_blank">

                        📎 ${a.fileName}

                    </a>

                    `

                    :

                    ""

                }

            </div>

            <div class="announcement-actions">

                <button

                    onclick="AdminAnnouncements.editAnnouncement('${a.id}')">

                    <span class="material-icons">

                        edit

                    </span>

                </button>

                <button

                    onclick="AdminAnnouncements.deleteAnnouncement('${a.id}')">

                    <span class="material-icons">

                        delete

                    </span>

                </button>

            </div>

        </div>

    `).join("");

}


})();