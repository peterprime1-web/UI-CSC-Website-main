window.Upload = (() => {

    async function upload(file){

        const formData = new FormData();

        formData.append("file", file);

formData.append(
    "conversationId",
    ChatManager.getCurrentConversation().id
);

        const response = await fetch(

            "/upload",

            {

                method:"POST",

                body:formData

            }

        );

        if(!response.ok){

            throw new Error(

                "Upload failed."

            );

        }

        return await response.json();

    }

    return{

        upload

    };

})();