import { db, messaging } from "./firebase-admin.js";

/*
=========================================
REGISTER DEVICE TOKEN
=========================================
*/

export async function registerDevice(req, res) {
    console.log("REGISTER DEVICE ENDPOINT HIT");
    console.log("REGISTER DEVICE CALLED");
    console.log(req.body);

    try {

        const { uid, token } = req.body;

        if (!uid || !token) {

            return res.status(400).json({

                success: false,

                message: "Missing uid or token."

            });

        }

       const snapshot = await db.ref("students").once("value");

let studentKey = null;

snapshot.forEach(child => {

    const student = child.val();

    if (student.uid === uid) {

        studentKey = child.key;

    }

});

if (!studentKey) {

    return res.status(404).json({

        success: false,

        message: "Student record not found."

    });

}

await db.ref(`students/${studentKey}`).update({

    fcmToken: token,

    lastTokenUpdate: Date.now()

});

        res.json({

            success: true

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

}

/*
=========================================
SEND TO ONE DEVICE
=========================================
*/

export async function sendNotification(req, res) {

    try {

        const {

            token,

            title,

            body,

            data = {}

        } = req.body;

        if (!token) {

            return res.status(400).json({

                success: false,

                message: "Device token required."

            });

        }

        const message = {

            token,

            notification: {

                title,

                body

            },

            data,

            android: {

                priority: "high",

                notification: {

                    channelId: "csc_elite"

                }

            }

        };

        const response = await messaging.send(message);

        res.json({

            success: true,

            response

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

}

/*
=========================================
NOTIFY ALL STUDENTS
=========================================
*/

export async function notifyStudents({

    title,

    body,

    data = {}

}) {

    try {

        const snapshot = await db
            .ref("students")
            .once("value");

        const tokens = [];

        snapshot.forEach(child => {

            const student = child.val();

            if (student.fcmToken) {

                tokens.push(student.fcmToken);

            }

        });

        if (tokens.length === 0) {

            console.log("No student devices registered.");

            return;

        }

        const message = {

            notification: {

                title,

                body

            },

            data,

            android: {

                priority: "high",

                notification: {

                    channelId: "csc_elite"

                }

            },

            tokens

        };

        const response =
            await messaging.sendEachForMulticast(message);

        console.log(
            `Notifications sent: ${response.successCount}/${tokens.length}`
        );

        return response;

    }

    catch (err) {

        console.error(err);

    }

}