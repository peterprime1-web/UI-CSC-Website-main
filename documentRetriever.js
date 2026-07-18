import { db } from "./firebase-admin.js";
import { getDocumentText } from "./supabaseDatabase.js";

/*
=========================================
GET DOCUMENT CONTEXT
=========================================
*/

export async function getConversationDocuments(conversationId){

    if(!conversationId){

        return "";

    }

    const snapshot = await db

        .ref(`portal/conversations/${conversationId}/documents`)

        .once("value");

    if(!snapshot.exists()){

        return "";

    }

    const documentIds = Object.keys(

        snapshot.val()

    );

    console.log("Retrieving documents for:", conversationId);

    console.log(documentIds);

    let context = "";

    for(const id of documentIds){

        try{

            const text = await getDocumentText(id);

            console.log("Loaded", id, text.length);

            context +=

`\n\n========== DOCUMENT ${id} ==========\n`;

            context += text;

        }

        catch(err){

            console.error(

                "Document retrieval failed:",

                id,

                err

            );

        }

    }

    return context;

}