import { db } from "./firebase-admin.js";

/*
=========================================
GENERIC FETCH
=========================================
*/

async function fetchNode(node) {

    try {

        const snapshot = await db.ref(node).once("value");

        return snapshot.val() || {};

    }

    catch (err) {

        console.error(`Firebase (${node})`, err);

        return {};

    }

}

/*
=========================================
INDIVIDUAL FETCHES
=========================================
*/

export async function getAssignments() {

    return await fetchNode("assignments");

}

export async function getAnnouncements() {

    return await fetchNode("announcements");

}

export async function getNotes() {

    return await fetchNode("notes");

}

export async function getMaterials() {

    return await fetchNode("materials");

}

export async function getCourses() {

    return await fetchNode("courses");

}

export async function getSettings() {

    return await fetchNode("settings");

}

/*
=========================================
FULL PORTAL
=========================================
*/

export async function getPortalData() {

    const [

        assignments,

        announcements,

        notes,

        materials,

        courses,

        settings

    ] = await Promise.all([

        getAssignments(),

        getAnnouncements(),

        getNotes(),

        getMaterials(),

        getCourses(),

        getSettings()

    ]);

    return {

        assignments,

        announcements,

        notes,

        materials,

        courses,

        settings

    };

}

export async function getPortalSection(section){

    return await fetchNode(section);

}