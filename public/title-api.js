window.AITitle = (() => {

    async function generate(userMessage, assistantReply) {

        const response = await fetch("/generate-title", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                userMessage,

                assistantReply,

                model: AIAPI.getModel()

            })

        });

        const data = await response.json();

        return data.title;

    }

    return {

        generate

    };

})();