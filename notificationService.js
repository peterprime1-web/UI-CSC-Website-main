// ========================================
// CSC ELITE NOTIFICATION SERVICE
// ========================================

import { notifyStudents } from "./notificationHandler.js";

const TYPES = {

    note: {
        icon: "📖",
        title: "New Lecture Note"
    },

    material: {
        icon: "📚",
        title: "New Course Material"
    },

    assignment: {
        icon: "📝",
        title: "New Assignment"
    },

    announcement: {
        icon: "📢",
        title: "New Announcement"
    }

};

export async function notify(type, name, id = "") {

    const config = TYPES[type];

    if (!config) {

        throw new Error(
            `Unknown notification type: ${type}`
        );

    }

    await notifyStudents({

        title: `${config.icon} ${config.title}`,

        body: name,

        data: {

            type,

            id: String(id)

        }

    });

}