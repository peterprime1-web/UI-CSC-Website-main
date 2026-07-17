// =====================
// DOM Helpers
// =====================

window.$ = (selector) => document.querySelector(selector);

window.$$ = (selector) => document.querySelectorAll(selector);

// =====================
// Loading
// =====================

window.showLoading = () => {
    $("#loading")?.classList.remove("hidden");
};

window.hideLoading = () => {
    $("#loading")?.classList.add("hidden");
};

// =====================
// Toast
// =====================

window.toast = (message, type = "success") => {

    const container = $("#toast-container");

    if (!container) return;

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);

};

async function uploadFile(bucket, file){

    const extension = file.name.split(".").pop();

    const filename = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2,8)}.${extension}`;

    const { error } = await window.supabaseClient.storage

        .from(bucket)

        .upload(filename, file);

    if(error)
        throw error;

    const { data } = window.supabaseClient.storage

        .from(bucket)

        .getPublicUrl(filename);

    return {

        fileName: file.name,

        filePath: filename,

        fileUrl: data.publicUrl

    };

}

async function deleteFile(bucket, filePath){

    const { error } = await window.supabaseClient.storage

        .from(bucket)

        .remove([filePath]);

    if(error)
        throw error;

}

function getCourse(courseId){

    return courses.find(c => c.id === courseId);

    
}

async function logActivity(title,icon="history"){

    await db.ref("activity").push({

        title,

        icon,

        time:new Date().toLocaleString(),

        timestamp:Date.now()

    });

}