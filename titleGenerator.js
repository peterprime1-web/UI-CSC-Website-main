import { askGemini } from "./gemini.js";
import { askGroq } from "./groq.js";

/*
=========================================
GENERATE CHAT TITLE
=========================================
*/

export async function generateTitle(

    firstMessage,

    model = "gemini"

) {

    if (!firstMessage?.trim()) {

        return "New Chat";

    }

    const prompt = `

Generate a short conversation title.

Rules:

- Maximum 6 words.
- No quotation marks.
- No punctuation unless necessary.
- Do not begin with verbs like Explain, Help, Tell.
- Make it look like a ChatGPT conversation title.
- Return ONLY the title.

User message:

${firstMessage}

`;

    try {

        if (model === "groq") {

            return cleanTitle(

                await askGroq(prompt)

            );

        }

        return cleanTitle(

            await askGemini(prompt)

        );

    }

    catch {

        return fallbackTitle(firstMessage);

    }

}

/*
=========================================
CLEAN TITLE
=========================================
*/

function cleanTitle(title) {

    return title

        .replace(/["']/g, "")

        .replace(/\n/g, "")

        .trim()

        .substring(0, 60);

}

/*
=========================================
FALLBACK
=========================================
*/

function fallbackTitle(text) {

    return text

        .split(" ")

        .slice(0, 6)

        .join(" ")

        .substring(0, 60);

}