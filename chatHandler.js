import { getPortalData, getPortalSection } from "./firebaseHelpers.js";
import { buildPortalContext } from "./portalContext.js";

import { askGemini } from "./gemini.js";
import { askGroq } from "./groq.js";
import { classifyIntent } from "./intentClassifier.js";
import { getConversationDocuments } from "./documentRetriever.js";

/*
=========================================
CHAT ROUTE HANDLER
=========================================
*/

export async function chatHandler(req, res) {

    try {

        const {

            message,

            history = [],

            model = "gemini",

            context = "",

            conversationId

        } = req.body;

        console.log("Conversation ID:", conversationId);

        if (!message?.trim()) {

            return res.status(400).json({

                reply: "Message is required."

            });

        }

        /*
        =========================================
        DETECT USER INTENT
        =========================================
        */

        const intent = await classifyIntent(message);

let portalContext = "";

if (intent.type === "portal" && intent.topic) {

    const section = await getPortalSection(intent.topic);

    portalContext = buildPortalContext({
        [intent.topic]: section
    });

}
        /*
        =========================================
        NAVIGATION REQUEST
        =========================================
        */

        if (intent.type === "navigate") {

            return res.json({

                action: intent,

                reply:

`Opening ${intent.target}...`,

                model: "portal"

            });

        }

        const documentContext =

    await getConversationDocuments(

        conversationId

    );

    console.log(documentContext.substring(0, 500));
        /*
        =========================================
        BUILD FINAL PROMPT
        =========================================
        */

        const fullPrompt = `
${context}

${portalContext}

Student:

${message}

${documentContext}
`;

        /*
        =========================================
        PRIMARY MODEL
        =========================================
        */

        let reply;

        let usedModel = model;

        try {

            if (model === "groq") {

                reply = await askGroq(

                    fullPrompt,

                    history

                );

            }

            else {

                reply = await askGemini(

                    fullPrompt,

                    history

                );

                usedModel = "gemini";

            }

        }

        /*
        =========================================
        FALLBACK
        =========================================
        */

        catch (err) {

            console.warn(

                "Primary model failed.",

                err

            );

            if (model === "groq") {

                reply = await askGemini(

                    fullPrompt,

                    history

                );

                usedModel = "gemini";

            }

            else {

                reply = await askGroq(

                    fullPrompt,

                    history

                );

                usedModel = "groq";

            }

        }

        /*
        =========================================
        RESPONSE
        =========================================
        */

        return res.json({

            reply,

            model: usedModel,

            action: null

        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            reply:

            "A server error occurred."

        });

    }

}