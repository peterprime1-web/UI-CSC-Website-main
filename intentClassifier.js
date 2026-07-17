import { askGemini } from "./gemini.js";

export async function classifyIntent(message){

    const prompt = `

You are an intent classifier.

Return ONLY valid JSON.

Types:

chat

navigate

portal

Examples:

"Open notes"

{
"type":"navigate",
"target":"notes"
}

"What assignments are due?"

{
"type":"portal",
"topic":"assignments"
}

"Explain recursion"

{
"type":"chat"
}

User:

${message}

`;

    const result = await askGemini(prompt);

    try{

        return JSON.parse(result);

    }

    catch{

        return{

            type:"chat"

        };

    }

}