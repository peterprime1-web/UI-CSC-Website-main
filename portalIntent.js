/*
=========================================
PORTAL INTENT DETECTOR
=========================================
*/

export function detectIntent(message = "") {

    const text = message.toLowerCase().trim();

    /*
    =========================================
    NAVIGATION
    =========================================
    */

    const navigation = {

        dashboard: [
            "dashboard",
            "home",
            "homepage"
        ],

        notes: [
            "notes",
            "lecture notes",
            "open notes"
        ],

        assignments: [
            "assignments",
            "assignment page",
            "open assignments"
        ],

        announcements: [
            "announcements",
            "announcement page",
            "open announcements"
        ],

        materials: [
            "materials",
            "course materials",
            "open materials"
        ],

        syllabus: [
            "syllabus",
            "course outline"
        ],

        forum: [
            "forum",
            "discussion",
            "community"
        ],

        ai: [
            "ai",
            "assistant",
            "chat"
        ]

    };

    for (const [page, keywords] of Object.entries(navigation)) {

        for (const word of keywords) {

            if (

                text === word ||

                text.startsWith(`open ${word}`) ||

                text.startsWith(`go to ${word}`) ||

                text.startsWith(`show ${word}`)

            ) {

                return {

                    type: "navigate",

                    target: page

                };

            }

        }

    }

    /*
    =========================================
    PORTAL QUESTIONS
    =========================================
    */

    if (

        text.includes("assignment") ||

        text.includes("deadline") ||

        text.includes("due")

    ) {

        return {

            type: "portal",

            topic: "assignments"

        };

    }

    if (

        text.includes("announcement") ||

        text.includes("news")

    ) {

        return {

            type: "portal",

            topic: "announcements"

        };

    }

    if (

        text.includes("note") ||

        text.includes("lecture")

    ) {

        return {

            type: "portal",

            topic: "notes"

        };

    }

    if (

        text.includes("material") ||

        text.includes("handout")

    ) {

        return {

            type: "portal",

            topic: "materials"

        };

    }

    if (

        text.includes("course") ||

        text.includes("lecturer")

    ) {

        return {

            type: "portal",

            topic: "courses"

        };

    }

    /*
    =========================================
    GENERAL AI
    =========================================
    */

    return {

        type: "chat"

    };

}