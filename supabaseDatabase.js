import { createClient } from "@supabase/supabase-js";

const supabase = createClient(

    process.env.SUPABASE_URL,

    process.env.SUPABASE_SERVICE_KEY

);

/*
=========================================
SAVE DOCUMENT TEXT
=========================================
*/

export async function saveDocumentText(documentId, text){

    if(!text || !text.trim()) return;

    const CHUNK_SIZE = 1000;

    const chunks = [];

    for(

        let i = 0;

        i < text.length;

        i += CHUNK_SIZE

    ){

        chunks.push({

            document_id: documentId,

            chunk_index: chunks.length,

            content: text.slice(

                i,

                i + CHUNK_SIZE

            )

        });

    }

    const { error } = await supabase

        .from("document_chunks")

        .insert(chunks);

    if(error){

        throw error;

    }

}
/*
=========================================
GET DOCUMENT TEXT
=========================================
*/

export async function getDocumentText(documentId){

    const { data, error } = await supabase

        .from("document_chunks")

        .select("content")

        .eq(

            "document_id",

            documentId

        )

        .order(

            "chunk_index",

            {

                ascending:true

            }

        );

    if(error){

        throw error;

    }

    return data

        .map(x=>x.content)

        .join("");

}
/*
=========================================
DELETE DOCUMENT
=========================================
*/

export async function deleteDocumentText(

    documentId

){

    const { error } = await supabase

        .from("document_chunks")

        .delete()

        .eq(

            "document_id",

            documentId

        );

    if(error){

        throw error;

    }

}