import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth";

import { uploadFile, getFileURL } from "./supabaseStorage.js";
import { db } from "./firebase-admin.js";
import {

    saveDocumentText

} from "./supabaseDatabase.js";



/*
=========================================
SUPPORTED TYPES
=========================================
*/

const ALLOWED_TYPES = [

    "application/pdf",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "text/plain",

    "image/png",

    "image/jpeg",

    "image/jpg"

];

/*
=========================================
UPLOAD HANDLER
=========================================
*/

export async function uploadHandler(req, res){

    const {

    conversationId

} = req.body;

    try{

        if(!req.file){

            return res.status(400).json({

                success:false,

                message:"No file uploaded."

            });

        }

        if(

            !ALLOWED_TYPES.includes(

                req.file.mimetype

            )

        ){

            return res.status(400).json({

                success:false,

                message:"Unsupported file type."

            });

        }

        /*
        =========================================
        UPLOAD TO SUPABASE
        =========================================
        */

        const path = await uploadFile(

            req.file,

            "materials"

        );

        const url = getFileURL(path);

        /*
        =========================================
        EXTRACT TEXT
        =========================================
        */

        let extractedText = "";

        switch(req.file.mimetype){

            case "application/pdf": {

    const loadingTask = pdfjs.getDocument({

        data: new Uint8Array(req.file.buffer)

    });

    const pdf = await loadingTask.promise;

    const pages = [];

    for (

        let pageNum = 1;

        pageNum <= pdf.numPages;

        pageNum++

    ) {

        const page = await pdf.getPage(pageNum);

        const content = await page.getTextContent();

        pages.push(

    content.items

        .map(item => item.str)

        .join(" ")

);

    }

    extractedText = pages.join("\n\n");

    break;

}

            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":

                extractedText =

                    (

                        await mammoth.extractRawText({

                            buffer:req.file.buffer

                        })

                    ).value;

                break;

            case "text/plain":

                extractedText =

                    req.file.buffer.toString();

                break;

            default:

                extractedText = "";

        }

        /*
        =========================================
        SAVE METADATA
        =========================================
        */

        const id = db

            .ref("portal/materials")

            .push().key;

        

            

            await db
.ref(`portal/materials/${id}`)
.set({

    id,

    title:req.file.originalname,

    fileUrl:url,

    storagePath:path,

    mime:req.file.mimetype,

    size:req.file.size,

    uploadedAt:Date.now()

});

if(conversationId){

    await db

        .ref(

`portal/conversations/${conversationId}/documents/${id}`

        )

        .set(true);

}

/*
=========================================
SAVE EXTRACTED TEXT
=========================================
*/

await saveDocumentText(

    id,

    extractedText

);
        /*
        =========================================
        RESPONSE
        =========================================
        */

        res.json({

            success:true,

            id,

            url

        });

    }

    catch(err){

        console.error(err);

        res.status(500).json({

            success:false,

            message:err.message

        });

    }

}