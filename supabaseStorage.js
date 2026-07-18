import { createClient } from "@supabase/supabase-js";

const supabase = createClient(

    process.env.SUPABASE_URL,

    process.env.SUPABASE_SERVICE_KEY

);

const BUCKET = "portal-files";

/*
=========================================
UPLOAD FILE
=========================================
*/

export async function uploadFile(

    file,

    folder = "general"

) {

    const extension =

        file.originalname

            .split(".")

            .pop();

    const filename =

`${folder}/${Date.now()}-${Math.random()

    .toString(36)

    .substring(2)}.${extension}`;

    const { error } = await supabase

        .storage

        .from(BUCKET)

        .upload(

            filename,

            file.buffer,

            {

                contentType:

                    file.mimetype,

                upsert: false

            }

        );

    if(error){

        throw error;

    }

    return filename;

}

/*
=========================================
GET PUBLIC URL
=========================================
*/

export function getFileURL(path){

    const { data } =

        supabase

        .storage

        .from(BUCKET)

        .getPublicUrl(path);

    return data.publicUrl;

}

/*
=========================================
DELETE FILE
=========================================
*/

export async function deleteFile(path){

    const { error } =

        await supabase

        .storage

        .from(BUCKET)

        .remove([path]);

    if(error){

        throw error;

    }

}