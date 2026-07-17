const $ = selector => document.querySelector(selector);
    const $$ = selector => document.querySelectorAll(selector);

function formatDate(timestamp){
        if(!timestamp) return "";
        return new Date(timestamp).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

function toast(message, type = "success") {
    let container = document.querySelector("#toast-container");
    if(!container){
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const element = document.createElement("div");
    element.className = `toast ${type}`;
    element.innerHTML = `
        <span class="material-icons">
            ${type === "success" ? "check_circle" : type === "error" ? "error" : "info"}
        </span>
        <div>${message}</div>
    `;
    container.appendChild(element);

    setTimeout(() => {
        element.remove();
    }, 3500);
}

function openModal(id) {
    document.getElementById(id)?.classList.add("show");
}

function closeModal(id) {
    document.getElementById(id)?.classList.remove("show");
}

document.addEventListener("click", e => {
    if(e.target.classList.contains("modal-overlay")){
        e.target.classList.remove("show");
    }
});

document.addEventListener("keydown", e => {
    if(e.ctrlKey && e.key.toLowerCase() === "k"){
        e.preventDefault();
        document.querySelector("#global-search")?.focus();
    }
    if(e.key === "Escape"){
        document.querySelectorAll(".modal-overlay.show").forEach(modal => {
            modal.classList.remove("show");
        });

    }
});
