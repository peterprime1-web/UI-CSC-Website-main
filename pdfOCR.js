import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_VISION_KEY
);

const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash"
});

/*
=========================================
PDF OCR
=========================================
*/

export async function ocrPdf(buffer){

    const pdf = {

        inlineData: {

            data: buffer.toString("base64"),

            mimeType: "application/pdf"

        }

    };

    const prompt = `
You are an OCR engine.

Extract ALL readable text from this PDF.

Rules:

- Preserve headings.
- Preserve numbering.
- Preserve bullet points.
- Preserve tables.
- Preserve equations.
- Preserve page order.
- If diagrams contain readable labels, include them.
- Do NOT summarize.
- Return ONLY the extracted text.
`;

    const result = await model.generateContent([

        prompt,

        pdf

    ]);

    return result.response.text();

}