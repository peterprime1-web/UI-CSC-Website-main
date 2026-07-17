// ========================================
// UI CSC PORTAL
// portal.js
// Navigation & UI Context Manager
// ========================================

window.Portal = (() => {

    // ==========================
    // Current UI State
    // ==========================

    let currentPage = "dashboard";

    let currentMaterial = null;
    let currentAssignment = null;

    // ==========================
    // Page
    // ==========================

    function setCurrentPage(page){

        currentPage = page;

    }

    function getCurrentPage(){

        return currentPage;

    }

    // ==========================
    // Material
    // ==========================

    function setCurrentMaterial(material){

        currentMaterial = material;

    }

    function clearCurrentMaterial(){

        currentMaterial = null;

    }

    function getCurrentMaterial(){

        return currentMaterial;

    }

    // ==========================
    // Assignment
    // ==========================

    function setCurrentAssignment(assignment){

        currentAssignment = assignment;

    }

    function clearCurrentAssignment(){

        currentAssignment = null;

    }

    function getCurrentAssignment(){

        return currentAssignment;

    }

    // ==========================
    // Context for AI
    // ==========================

    function getCurrentContext(){

        return{

            page: currentPage,

            material: currentMaterial,

            assignment: currentAssignment

        };

    }

    // ==========================
    // Navigation
    // ==========================

    function navigate(page){

        if(window.Navigate){

            Navigate.showPage(page);

            currentPage = page;

            return true;

        }

        return false;

    }

    // ==========================
    // Actions
    // ==========================

    function execute(action){

        if(!action) return false;

        switch(action.type){

            case "navigate":

                return navigate(action.target);

            case "openMaterial":

                if(action.data){

                    setCurrentMaterial(action.data);

                }

                openMaterial(action.data);

                return true;

            case "openAssignment":

                if(action.data){

                    setCurrentAssignment(action.data);

                }

                openAssignment(action.data);

                return true;

            case "searchNotes":

                searchNotes(action.query);

                return true;

            default:

                return false;

        }

    }

    // ==========================
    // Material
    // ==========================

    function openMaterial(material){

        console.log("Open Material", material);

    }

    // ==========================
    // Assignment
    // ==========================

    function openAssignment(assignment){

        console.log("Open Assignment", assignment);

    }

    // ==========================
    // Search
    // ==========================

    function searchNotes(query){

        console.log("Searching Notes:", query);

    }

    // ==========================
    // Public API
    // ==========================

    return{

        // Page

        setCurrentPage,
        getCurrentPage,

        // Material

        setCurrentMaterial,
        getCurrentMaterial,
        clearCurrentMaterial,

        // Assignment

        setCurrentAssignment,
        getCurrentAssignment,
        clearCurrentAssignment,

        // Context

        getCurrentContext,

        // Navigation

        navigate,
        execute,

        // Actions

        openMaterial,
        openAssignment,
        searchNotes

    };

})();