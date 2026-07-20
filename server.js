import express from "express";
import cors from "cors";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

import { chatHandler } from "./chatHandler.js";
import { generateTitle } from "./titleGenerator.js";
import { auth } from "./firebase-admin.js";
import uploadRoutes from "./uploadRoutes.js";
import {

    registerDevice,

    sendNotification,

    notifyStudents

} from "./notificationHandler.js";

/*
=========================================
PATHS
=========================================
*/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
=========================================
APP
=========================================
*/

const app = express();

/*
=========================================
MIDDLEWARE
=========================================
*/

app.use(express.json());

app.use(cors({

    origin: process.env.ALLOWED_ORIGIN || "*",

    methods: ["GET", "POST"]

}));

app.use(

    express.static(

        path.join(__dirname, "public")

    )

);

/*
=========================================
REGISTER DEVICE
=========================================
*/

app.post(

    "/register-device",

    registerDevice

);

/*
=========================================
SEND PUSH
=========================================
*/


/*
=========================================
HOME
=========================================
*/

app.get("/", (req, res) => {

    res.sendFile(

        path.join(

            __dirname,

            "public",

            "index.html"

        )

    );

});

/*
=========================================
AI CHAT
=========================================
*/

app.post("/chat", chatHandler);

/*
=========================================
GENERATE TITLE
=========================================
*/

app.post("/generate-title", async (req, res) => {

  console.log("Generating title...");

    try {

        const {

            message,

            model

        } = req.body;

        const title = await generateTitle(

            message,

            model

        );

        res.json({

            title

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            title: "New Chat"

        });

    }

});

/*
=========================================
CREATE ADMIN
=========================================
*/

app.post("/create-admin", async (req, res) => {

    try {

        const {

            email,

            password,

            name

        } = req.body;

        const user = await auth.createUser({

            email,

            password,

            displayName: name

        });

        res.json({

            success: true,

            uid: user.uid

        });

    }

    catch (err) {

        if (

            err.code ===

            "auth/email-already-exists"

        ) {

            return res.status(400).json({

                success: false,

                message: "Email already exists."

            });

        }

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});


app.post("/notify-announcement", async (req, res) => {

    try {

        const { title, message } = req.body;

        await notifyStudents({

            title: "📢 New Announcement",

            body: title,

            data: {
                type: "announcement"
            }

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

});


app.post("/notify-assignment", async (req, res) => {

    try {

        const { title, message } = req.body;

        await notifyStudents({

            title: "📢 New Assignment",

            body: dueDate,

            data: {
                type: "assignment"
            }

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

});


app.post("/notify-notes", async (req, res) => {

    try {

        const { title, message } = req.body;

        await notifyStudents({

            title: "📢 New Notes",

            body: title,

            data: {
                type: "notes"
            }

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

});

app.post("/notify-materials", async (req, res) => {

    try {

        const { title, message } = req.body;

        await notifyStudents({

            title: "📢 New Materials",

            body: title,

            data: {
                type: "materials"
            }

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

});
/*
=========================================
BOOTSTRAP ADMIN
=========================================
*/

app.post("/bootstrap-admin", async (req, res) => {

    try {

        const user = await auth.createUser({

            email: "your@email.com",

            password: "YourPassword123!",

            displayName: "Portal Admin"

        });

        res.json({

            success: true,

            uid: user.uid

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});



/*
=========================================
UPLOADS
=========================================
*/

app.use(

    "/upload",

    uploadRoutes

);
/*


=========================================
START SERVER
=========================================
*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(

        `🚀 Server running on port ${PORT}`

    );

});