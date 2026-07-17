// ========================================
// UI CSC PORTAL
// portalData.js
// Firebase Data Provider
// ========================================

window.PortalData = (() => {

    // =====================================
    // Firebase References
    // =====================================

    const db = firebase.database();

    // =====================================
    // Generic Helper
    // =====================================

    async function get(path){

        try{

            const snapshot = await db.ref(path).once("value");

            return snapshot.val();

        }

        catch(err){

            console.error(

                `PortalData Error (${path})`,

                err

            );

            return null;

        }

    }

    // =====================================
    // Assignments
    // =====================================

    async function getAssignments(){

        return await get("assignments");

    }

    async function getAssignment(id){

        if(!id) return null;

        return await get(`assignments/${id}`);

    }

    // =====================================
    // Notes
    // =====================================

    async function getNotes(){

        return await get("notes");

    }

    async function getNote(id){

        if(!id) return null;

        return await get(`notes/${id}`);

    }

    // =====================================
    // Course Materials
    // =====================================

    async function getMaterials(){

        return await get("materials");

    }

    async function getMaterial(id){

        if(!id) return null;

        return await get(`materials/${id}`);

    }

    // =====================================
    // Announcements
    // =====================================

    async function getAnnouncements(){

        return await get("announcements");

    }

    async function getAnnouncement(id){

        if(!id) return null;

        return await get(`announcements/${id}`);

    }

    // =====================================
    // Courses
    // =====================================

    async function getCourses(){

        return await get("courses");

    }

    async function getCourse(id){

        if(!id) return null;

        return await get(`courses/${id}`);

    }

    // =====================================
    // Forum
    // =====================================

    async function getForumPosts(){

        return await get("forum");

    }

    // =====================================
    // Dashboard
    // =====================================

    async function getDashboard(){

        return {

            assignments: await getAssignments(),

            announcements: await getAnnouncements(),

            materials: await getMaterials(),

            notes: await getNotes()

        };

    }

    // =====================================
    // Export
    // =====================================

    return{

        getAssignments,
        getAssignment,

        getNotes,
        getNote,

        getMaterials,
        getMaterial,

        getAnnouncements,
        getAnnouncement,

        getCourses,
        getCourse,

        getForumPosts,

        getDashboard

    };

})();