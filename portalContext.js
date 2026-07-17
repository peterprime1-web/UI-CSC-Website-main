/*
=========================================
PORTAL CONTEXT BUILDER
=========================================
*/

export function buildPortalContext(portal) {

    let context = `

=========================================
CSC PORTAL KNOWLEDGE
=========================================

The following information comes directly
from the live CSC Portal database.

Never invent portal information.

If something is not listed below,
tell the student it does not exist.

`;

    /*
    =========================================
    COURSES
    =========================================
    */

    context += "\nCOURSES\n\n";


if(portal.courses){
    Object.values(portal.courses || {}).forEach(course => {

        context +=
`• ${course.code}

Title: ${course.title}

Lecturer: ${course.lecturer}

Semester: ${course.semester}

Level: ${course.level}

\n`;

    });
}

    /*
    =========================================
    ASSIGNMENTS
    =========================================
    */

    context += "\n----------------------------------\n";
    context += "\nASSIGNMENTS\n\n";

    if(portal.assignments){

    Object.values(portal.assignments || {}).forEach(a => {

        context +=
`• ${a.title}

Course: ${a.course}

Due Date: ${a.dueDate}

Description:
${a.description || "No description"}

\n`;

    });
}

    /*
    =========================================
    ANNOUNCEMENTS
    =========================================
    */

    context += "\n----------------------------------\n";
    context += "\nANNOUNCEMENTS\n\n";
if(portal.announcements){
    Object.values(portal.announcements || {}).forEach(a => {

        context +=
`• ${a.title}

${a.message}

Date:
${a.date || ""}

\n`;

    });
}

    /*
    =========================================
    NOTES
    =========================================
    */

    context += "\n----------------------------------\n";
    context += "\nNOTES\n\n";
if(portal.notes){
    Object.values(portal.notes || {}).forEach(note => {

        context +=
`• ${note.title}

Course:
${note.course}

File:
${note.fileName || note.file || ""}

\n`;

    });
}

    /*
    =========================================
    MATERIALS
    =========================================
    */

    context += "\n----------------------------------\n";
    context += "\nCOURSE MATERIALS\n\n";
if(portal.materials){
    Object.values(portal.materials || {}).forEach(material => {

        context +=
`• ${material.title}

Course:
${material.course}

Type:
${material.type || ""}

\n`;

    });
}
    context +=
`

=========================================
END OF LIVE PORTAL DATA
=========================================

`;

    return context;

}