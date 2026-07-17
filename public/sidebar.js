window.Sidebar = (() => {

    function init(){

        const toggle = document.getElementById("sidebar-toggle");
        const sidebar = document.querySelector(".sidebar");
        const main = document.querySelector(".main-content");

        if(!toggle || !sidebar || !main) return;

        if(window.innerWidth > 900){

            if(localStorage.getItem("sidebar")==="collapsed"){

                sidebar.classList.add("collapsed");
                main.classList.add("expanded");

            }

        }

        toggle.onclick = ()=>{

            if(window.innerWidth<=900){

                sidebar.classList.toggle("show");

                toggle.innerHTML =
                    sidebar.classList.contains("show")

                    ? '<span class="material-icons">close</span>'

                    : '<span class="material-icons">menu</span>';

                return;

            }

            sidebar.classList.toggle("hidden");

            main.classList.toggle("expanded");

            localStorage.setItem(

                "sidebar",

                sidebar.classList.contains("hidden")

                ? "hidden"

                : "expanded"

            );

        };

        window.addEventListener("resize",()=>{

            if(window.innerWidth>900){

                sidebar.classList.remove("show");

                toggle.innerHTML =
                    '<span class="material-icons">menu</span>';

            }

        });

    }

    return{

        init

    };

})();