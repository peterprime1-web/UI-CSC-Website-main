window.Announcements = (() => {

    let announcements = [];
    let sliderIndex = 0;
    let sliderInterval = null;

     function init(){

        initAnnouncementSlider();

    }

    
    function initAnnouncementSlider(){

    loadAnnouncements();

    document
        .getElementById("announcement-next")
        ?.addEventListener("click", () => {

            nextSlide();

            startSlider();

        });

    document
        .getElementById("announcement-prev")
        ?.addEventListener("click", () => {

            previousSlide();

            startSlider();

        });

}

    async function loadAnnouncements(){

    try{

        const snapshot = await db.ref("announcements").once("value");

        announcements = [];

        if(snapshot.exists()){

            snapshot.forEach(child=>{

                announcements.push({

                    id: child.key,

                    ...child.val()

                });

            });

        }

        announcements.sort((a,b)=>{

            if(a.pinned && !b.pinned) return -1;

            if(!a.pinned && b.pinned) return 1;

            return (b.createdAt||0) - (a.createdAt||0);

        });

        announcements = announcements.slice(0,3);

        if(announcements.length===0){

            renderEmptyAnnouncement();

            return;

        }

        sliderIndex = 0;

        renderAnnouncement();

        startSlider();

    }

    catch(err){

        console.error("Announcement Error:",err);

        renderEmptyAnnouncement();

    }

}

    function renderAnnouncement(){

    const announcement = announcements[sliderIndex];

    if(!announcement) return;

    const badge =
        document.getElementById("announcement-priority");

    const date =
        document.getElementById("announcement-date");

    const title =
        document.getElementById("announcement-title");

    const preview =
        document.getElementById("announcement-preview");

    const button =
        document.getElementById("announcement-read");

    const card =
        document.getElementById("announcement-card");

    if(card){

        card.className =
            "announcement-card " +
            (announcement.type || "information")
            .toLowerCase();

    }

    badge.textContent =
        announcement.type || "Information";

    date.textContent =
        formatDate(announcement.createdAt);

    title.textContent =
        announcement.title;

    preview.textContent = truncateWords(announcement.message, 15);

    button.onclick = () => {

        openAnnouncement(announcement);

    };

    updateSliderDots();

}

    function renderEmptyAnnouncement(){

    const container=$("#announcement-slider");

    if(!container) return;

    container.innerHTML=`

        <div class="announcement-card">

            <div class="empty-state">

                <span class="material-icons">

                    campaign

                </span>

                <h3>No announcements available.</h3>

            </div>

        </div>

    `;

}


    function nextSlide(){

    if(!announcements.length) return;

    sliderIndex=(sliderIndex+1)%announcements.length;

    renderAnnouncement();

}

    function previousSlide(){

    if(!announcements.length) return;

    sliderIndex--;

    if(sliderIndex<0){

        sliderIndex=announcements.length-1;

    }

    renderAnnouncement();

}

    function updateSliderDots(){

    const dots=$("#slider-dots");

    if(!dots) return;

    dots.innerHTML="";

    announcements.forEach((announcement,index)=>{

        const dot=document.createElement("span");

        dot.className="slider-dot";

        if(index===sliderIndex){

            dot.classList.add("active");

        }

        dot.onclick=()=>{

            sliderIndex=index;

            renderAnnouncement();

            startSlider();

        };

        dots.appendChild(dot);

    });

}

    function openAnnouncement(announcement){

    const modal=$("#announcement-modal");

    if(!modal) return;

    $("#announcement-modal-title").textContent=

        announcement.title;

    $("#announcement-modal-date").textContent=

        formatDate(announcement.createdAt);

    $("#announcement-modal-content").innerHTML=

        announcement.message;

    const type=$("#announcement-modal-type");

    if(type){

        type.textContent=

            announcement.type||"Information";

    }

    const attachment=$("#announcement-modal-attachment");

    if(attachment){

        if(announcement.fileUrl){

            attachment.href=announcement.fileUrl;

            attachment.style.display="inline-flex";

        }

        else{

            attachment.style.display="none";

        }

    }

    modal.classList.add("show");

}

    function startSlider(){

    stopSlider();

    sliderInterval=setInterval(nextSlide,6000);

}

function stopSlider(){

    if(sliderInterval){

        clearInterval(sliderInterval);

        sliderInterval=null;

    }

}


    function truncateWords(text, limit){

    if(!text) return "";

    const words = text.trim().split(/\s+/);

    return words.length > limit
        ? words.slice(0, limit).join(" ") + "..."
        : text;

}

    return {
        init,
        openAnnouncement
    };

})();