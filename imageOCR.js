import { GoogleGenerativeAI } from "@google/generative-ai";

/*
=========================================
GEMINI VISION
=========================================
*/

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_VISION_KEY
);

const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash"
});

/*
=========================================
IMAGE OCR
=========================================
*/

export async function extractImageText(buffer, mimeType) {
    console.log("Extracting text from image...");

    const image = {

        inlineData: {

            data: Buffer.isBuffer(buffer)

    ? buffer.toString("base64")

    : Buffer.from(buffer).toString("base64"),

            mimeType

        }

    };

    const prompt = `
You are an OCR engine.

Extract ALL readable text from this image.

Rules:

- Preserve headings.
- Preserve bullet points.
- Preserve equations.
- Preserve numbering.
- Preserve tables if possible.
- Ignore decorations.
- Do NOT summarize.
- Return ONLY the extracted text.
`;
    console.log("Sending image to Gemini Vision...");
    const result = await model.generateContent([

        prompt,

        image

    ]);

    return result.response.text();

}