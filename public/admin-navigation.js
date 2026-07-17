// =========================================
// ADMIN NAVIGATION
// =========================================

const Navigation = (() => {

    const pages = document.querySelectorAll(".page");
    const navButtons = document.querySelectorAll(".nav-btn");
    const pageTitle = document.getElementById("page-title");

    const sidebar = document.getElementById("sidebar");
    const mobileMenu = document.getElementById("mobile-menu");
    const sidebarToggle = document.getElementById("sidebar-toggle");

    let currentPage = "dashboard";

    // -----------------------------
    // Open a page
    // -----------------------------

    function open(page){

        currentPage = page;

        pages.forEach(p=>{

            p.classList.remove("active-page");

        });

        const active = document.getElementById(page);

        if(active){

            active.classList.add("active-page");

        }

        navButtons.forEach(btn=>{

            btn.classList.remove("active");

            if(btn.dataset.page===page){

                btn.classList.add("active");

            }

        });

        pageTitle.textContent =
            page.charAt(0).toUpperCase()+page.slice(1);

        sidebar.classList.remove("open");

    }

    // -----------------------------
    // Sidebar Buttons
    // -----------------------------

    navButtons.forEach(btn=>{

        btn.addEventListener("click",()=>{

            open(btn.dataset.page);

        });

    });

    // -----------------------------
    // Dashboard Cards
    // -----------------------------

    document.addEventListener("click",e=>{

        const card=e.target.closest("[data-open]");

        if(card){

            open(card.dataset.open);

        }

    });

    // -----------------------------
    // Mobile Sidebar
    // -----------------------------

    mobileMenu.onclick=()=>{

        sidebar.classList.toggle("open");

    };

    sidebarToggle.onclick=()=>{

        sidebar.classList.remove("open");

    };

    // -----------------------------
    // Outside Click closes sidebar
    // -----------------------------

    document.addEventListener("click",(e)=>{

        if(window.innerWidth>1024) return;

        if(
            !sidebar.contains(e.target)
            &&
            !mobileMenu.contains(e.target)
        ){

            sidebar.classList.remove("open");

        }

    });

    // -----------------------------
    // Public API
    // -----------------------------

    return{

        open,
        current:()=>currentPage

    };

})();