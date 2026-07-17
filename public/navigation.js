window.Navigate = (() => {

    let currentPage = "dashboard";

    function init(){
        // Page item click listeners
        document.querySelectorAll(".nav-item").forEach(item=>{
            item.addEventListener("click",()=>{
                const page=item.dataset.page;
                if(page){
                    showPage(page);
                }
                
                // Automatically close sidebar on mobile after clicking an item
                closeMobileSidebar();
            });
        });

        // Dashboard "View All" buttons
        document.querySelectorAll("[data-page-open]").forEach(btn=>{
            btn.addEventListener("click",()=>{
                showPage(btn.dataset.pageOpen);
            });
        });

        // Setup mobile hamburger toggles
        setupMobileToggle();
    }

    function showPage(page){
        currentPage = page;

        document.querySelectorAll(".page").forEach(section=>{
            section.classList.remove("active");
        });

        const active=document.getElementById(page);
        if(active){
            active.classList.add("active");
        }

        document.querySelectorAll(".nav-item").forEach(item=>{
            item.classList.remove("active");
        });

        const nav=document.querySelector(
            `.nav-item[data-page="${page}"]`
        );

        if(nav){
            nav.classList.add("active");
        }

        const title = document.getElementById("page-title");
        if(title){
            title.textContent = nav?.dataset.title || "Dashboard";
        }

        window.scrollTo({
            top:0,
            behavior:"smooth"
        });
    }

    // New helper functions to handle the mobile menu behavior
    function setupMobileToggle() {
        const menuBtn = document.getElementById("mobile-menu-btn");
        const sidebar = document.querySelector(".sidebar");
        const overlay = document.querySelector(".sidebar-overlay");

        if (menuBtn && sidebar) {
            menuBtn.addEventListener("click", () => {
                sidebar.classList.toggle("show");
                overlay?.classList.toggle("show");
            });
        }

        // Close when clicking outside on the overlay background
        if (overlay) {
            overlay.addEventListener("click", closeMobileSidebar);
        }
    }

    function closeMobileSidebar() {
        const sidebar = document.querySelector(".sidebar");
        const overlay = document.querySelector(".sidebar-overlay");
        
        sidebar?.classList.remove("show");
        overlay?.classList.remove("show");
    }

    return{
        init,
        showPage
    };

})();