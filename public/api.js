window.AIAPI = (() => {

    let currentModel =

localStorage.getItem("aiModel")

|| "gemini"; 

    async function send(message, history = [], systemPrompt = "") {

        try {
            

            const controller = new AbortController();
           const timeout = setTimeout(() => controller.abort(), 30000);
            const response = await fetch("/chat", {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

    message,

    context: systemPrompt,

    portalContext: Portal.getCurrentContext(),

    model: currentModel,

    history,

    conversationId:
        ChatManager
            .getCurrentConversation()
            .id

}),

                signal: controller.signal

            });

            if(!response.ok){

                throw new Error("Server Error");

            }

            const data = await response.json();

            return {

    reply: data.reply,

    model: data.model,

    action: data.action || null

};

        }

        catch(err){

            console.warn(err);

            currentModel =

                currentModel==="gemini"

                ? "groq"

                : "gemini";

            const retry = await fetch("/chat",{

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body: JSON.stringify({

    message,

    context: systemPrompt,

    portalContext: Portal.getCurrentContext(),

    model: currentModel,

    history,

    conversationId:
        ChatManager
            .getCurrentConversation()
            .id

})
            });

            if(!retry.ok){

                throw new Error(

                    "AI services unavailable."

                );

            }

            const retryData = await retry.json();

return {

    reply: retryData.reply,

    model: retryData.model,

    action: retryData.action || null

};

        }

    }
    clearTimeout(timeout);

    async function generateTitle(firstMessage){

    const response = await fetch("/generate-title",{

        method:"POST",

        headers:{

            "Content-Type":"application/json"

        },

        body:JSON.stringify({

            message:firstMessage,

            model:currentModel

        })

    });

    if(!response.ok){

        throw new Error("Unable to generate title.");

    }

    const data = await response.json();

    return data.title;

}

    function getModel(){

        return currentModel;

    }

    function setModel(model){

         currentModel = model;

localStorage.setItem(

    "aiModel",

    model

);

    }

    return{

        send,

        getModel,

        setModel,

        generateTitle

    };

})();