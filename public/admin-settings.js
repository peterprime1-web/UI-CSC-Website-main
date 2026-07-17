// =========================================
// SETTINGS
// =========================================

window.AdminSettings = (() => {

    const DB_PATH = "settings";

    function init(){

    if(!can("settings"))

        return;
         bindEvents();
        loadSettings();
    
}

    function bindEvents(){

        $("#save-settings").onclick =
            saveSettings;

    }

    async function loadSettings(){

        try{

            const snap =
                await db.ref(DB_PATH).once("value");

            if(!snap.exists()){

                await createDefaultSettings();

                return loadSettings();

            }

            const settings = snap.val();

            $("#portal-name").value =
                settings.portalName || "";

            $("#portal-university").value =
                settings.university || "";

            $("#portal-department").value =
                settings.department || "";

            $("#portal-session").value =
                settings.academicSession || "";

            $("#portal-semester").value =
                settings.semester || "First";

            $("#portal-ai-model").value =
                settings.defaultAiModel || "gemini";

            $("#portal-ai-enabled").checked =
                settings.enableAI ?? true;

            $("#portal-upload-size").value =
                settings.maxUploadSize || 20;

            $("#portal-maintenance").checked =
                settings.maintenanceMode ?? false;

            $("#portal-registration").checked =
                settings.allowRegistration ?? false;

        }

        catch(err){

            console.error(err);

            toast(
                "Unable to load settings.",
                "error"
            );

        }

    }

    async function createDefaultSettings(){

        await db.ref(DB_PATH).set({

            portalName: "UI CSC Portal",

            university: "University of Ibadan",

            department: "Computer Science",

            academicSession: "2026/2027",

            semester: "First",

            defaultAiModel: "gemini",

            enableAI: true,

            maxUploadSize: 20,

            maintenanceMode: false,

            allowRegistration: false,

            updatedAt: Date.now()

        });

    }

    async function saveSettings(){

        showLoading();

        try{

            await db.ref(DB_PATH).update({

                portalName:
                    $("#portal-name").value.trim(),

                university:
                    $("#portal-university").value.trim(),

                department:
                    $("#portal-department").value.trim(),

                academicSession:
                    $("#portal-session").value.trim(),

                semester:
                    $("#portal-semester").value,

                defaultAiModel:
                    $("#portal-ai-model").value,

                enableAI:
                    $("#portal-ai-enabled").checked,

                maxUploadSize:
                    Number(
                        $("#portal-upload-size").value
                    ),

                maintenanceMode:
                    $("#portal-maintenance").checked,

                allowRegistration:
                    $("#portal-registration").checked,

                updatedAt:
                    Date.now()

            });

            await logActivity(

                "Settings Updated",

                "settings"

            );

            toast(

                "Settings saved successfully.",

                "success"

            );

        }

        catch(err){

            console.error(err);

            toast(

                "Unable to save settings.",

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