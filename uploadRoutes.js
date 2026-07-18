import express from "express";
import multer from "multer";

import { uploadHandler } from "./uploadHandler.js";

const router = express.Router();

/*
=========================================
MULTER
=========================================
*/

const storage = multer.memoryStorage();

const upload = multer({

    storage,

    limits: {

        fileSize: 50 * 1024 * 1024 // 50MB

    }

});

/*
=========================================
UPLOAD
=========================================
*/

router.post(

    "/",

    upload.single("file"),

    uploadHandler

);

export default router;