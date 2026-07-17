window.AnnouncementsPage = (() => {

    Portal.setCurrentPage("announcements");
    let announcements = [];
    let filteredAnnouncements = [];

    function init(){

        loadAnnouncements();

        const search =
            document.getElementById("announcement-search");

        if(search){

            search.addEventListener("input",filterAnnouncements);

        }

    }

    async function loadAnnouncements(){

    try{

        const snapshot =
            await db.ref("announcements").once("value");

        announcements = [];

        if(snapshot.exists()){

            snapshot.forEach(child=>{

                announcements.push({

                    id:child.key,

                    ...child.val()

                });

            });

        }

        announcements.sort((a,b)=>{

            if(a.pinned && !b.pinned) return -1;

            if(!a.pinned && b.pinned) return 1;

            return (b.createdAt||0) - (a.createdAt||0);

        });

        filteredAnnouncements=[...announcements];

        renderAnnouncements();

    }

    catch(err){

        console.error(err);

    }

}

    function renderAnnouncements(){

    const container =
        document.getElementById("announcement-list");

    if(!container) return;

    if(filteredAnnouncements.length===0){

        container.innerHTML=`

            <div class="empty-state">

                <span class="material-icons">

                    campaign

                </span>

                <h3>

                    No announcements found.

                </h3>

            </div>

        `;

        return;

    }

    container.innerHTML =
        filteredAnnouncements.map(announcement=>`

<div class="announcement-item ${announcement.pinned ? "pinned" : ""}">

    <div class="announcement-header">

        <span class="announcement-badge ${announcement.type.toLowerCase()}">
            ${announcement.type}
        </span>

        <span class="announcement-date">
            ${formatDate(announcement.createdAt)}
        </span>

    </div>

    <h3 class="announcement-title">
        ${announcement.title}
    </h3>

    <p class="announcement-body">
        ${announcement.message}
    </p>

    <div class="announcement-footer">

        <button class="primary-btn read-btn">
            Read More
        </button>

        ${
            announcement.fileUrl
            ? `<a href="${announcement.fileUrl}" target="_blank" class="secondary-btn">Attachment</a>`
            : ""
        }

    </div>

</div>
`).join("");

}

    function filterAnnouncements(){

    const search =
        document.getElementById("announcement-search")
        .value
        .toLowerCase()
        .trim();

    filteredAnnouncements =
        announcements.filter(announcement=>{

            const text=`

                ${announcement.title}

                ${announcement.message}

                ${announcement.type}

            `.toLowerCase();

            return text.includes(search);

        });

    renderAnnouncements();

}

    function getAnnouncement(id){

    return announcements.find(a=>a.id===id);

}
    return{

        init,
        getAnnouncement

    };

    

})();

