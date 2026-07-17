import fetch from "node-fetch";

const GROQ_KEY = process.env.GROQ_KEY;

if (!GROQ_KEY) {

    throw new Error("Missing GROQ_KEY");

}

/*
=========================================
ASK GROQ
=========================================
*/

export async function askGroq(

    prompt,

    history = []

) {

    const messages = [

        ...history.map(message => ({

            role:

                message.role === "assistant"

                    ? "assistant"

                    : "user",

            content: message.content

        })),

        {

            role: "user",

            content: prompt

        }

    ];

    const response = await fetch(

        "https://api.groq.com/openai/v1/chat/completions",

        {

            method: "POST",

            headers: {

                Authorization: `Bearer ${GROQ_KEY}`,

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                model: "openai/gpt-oss-120b",

                messages,

                temperature: 0.3

            })

        }

    );

    if (!response.ok) {

        const error = await response.text();

        throw new Error(error);

    }

    const data = await response.json();

    return (

        data?.choices?.[0]?.message?.content ||

        "No response."

    );

}