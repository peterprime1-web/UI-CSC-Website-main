import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_KEY = process.env.GEMINI_KEY;

if (!GEMINI_KEY) {

    throw new Error("Missing GEMINI_KEY");

}

const genAI = new GoogleGenerativeAI(GEMINI_KEY);

/*
=========================================
SANITISE HISTORY
=========================================
*/

function sanitiseHistory(history = []) {

    let clean = history.map(message => ({

        role:

            message.role === "user"

                ? "user"

                : "model",

        parts: [

            {

                text: message.content

            }

        ]

    }));

    while (

        clean.length &&

        clean[0].role !== "user"

    ) {

        clean.shift();

    }

    clean = clean.filter((message, index, array) => {

        if (index === 0) return true;

        return message.role !== array[index - 1].role;

    });

    while (

        clean.length &&

        clean[clean.length - 1].role !== "model"

    ) {

        clean.pop();

    }

    return clean;

}

/*
=========================================
ASK GEMINI
=========================================
*/

export async function askGemini(

    prompt,

    history = []

) {

    const model = genAI.getGenerativeModel({

        model: "gemini-3.1-flash-lite"

    });

    const chat = model.startChat({

        history: sanitiseHistory(history)

    });

    const result = await chat.sendMessage(prompt);

    return result.response.text();

}