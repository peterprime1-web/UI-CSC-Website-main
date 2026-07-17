import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { auth, db } from "./firebase-admin.js";

// ================= INIT PATH =================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= APP INIT (MUST BE FIRST) =================
const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "*",
  methods: ["POST"],
}));

// Serve static files from the project root
app.use(express.static(path.join(__dirname, "public")));

// ================= ROUTES =================

// Home page (frontend)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const GEMINI_KEY = process.env.GEMINI_KEY;
const GROQ_KEY = process.env.GROQ_KEY;

if (!GEMINI_KEY) console.error("❌ Missing GEMINI_KEY in .env");
if (!GROQ_KEY) console.error("❌ Missing GROQ_KEY in .env");

const genAI = new GoogleGenerativeAI(GEMINI_KEY);

// ================= GEMINI HISTORY SANITISER =================
function sanitiseForGemini(rawHistory) {
  let history = rawHistory.map(m => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }]
  }));

  while (history.length && history[0].role !== "user") {
    history.shift();
  }

  history = history.filter((entry, i, arr) =>
    i === 0 || entry.role !== arr[i - 1].role
  );

  while (history.length && history[history.length - 1].role !== "model") {
    history.pop();
  }

  return history;
}


// ===================================
// Firebase Helpers
// ===================================

async function getAssignments() {

    try {

        const snapshot =
            await db.ref("assignments").once("value");

        return snapshot.val() || {};

    }

    catch (err) {

        console.error("Assignment Fetch Error", err);

        return {};

    }

}

// ================= CHAT ROUTE =================
app.post("/chat", async (req, res) => {
  const { message, model, history = [], context = "", portalContext = {} } = req.body;

  // ============================
// Portal Intent Detection
// ============================

const lowerMessage = message.toLowerCase();

let portalAction = null;

// Navigation

if (
    lowerMessage === "open notes" ||
    lowerMessage === "go to notes" ||
    lowerMessage === "show notes"
) {

    portalAction = {
        type: "navigate",
        target: "notes"
    };

}

else if (
    lowerMessage === "open assignments" ||
    lowerMessage === "go to assignments"
) {

    portalAction = {
        type: "navigate",
        target: "assignments"
    };

}

else if (
    lowerMessage === "open announcements" ||
    lowerMessage === "go to announcements"
) {

    portalAction = {
        type: "navigate",
        target: "announcements"
    };

}

else if (
    lowerMessage === "open materials" ||
    lowerMessage === "go to materials"
) {

    portalAction = {
        type: "navigate",
        target: "coursematerials"
    };

}

let assignmentContext = "";
if (

    lowerMessage.includes("assignment") ||

    lowerMessage.includes("deadline") ||

    lowerMessage.includes("due")

){

    const assignments = await getAssignments();

    assignmentContext =
        "Current Assignments:\n\n";

    Object.values(assignments).forEach(a => {

        assignmentContext +=

`Title: ${a.title}
Course: ${a.course}
Deadline: ${a.deadline}

`;

    });

}

  const portalInfo = `

===== CURRENT PORTAL CONTEXT =====

Current Page:
${portalContext.page || "None"}

Current Course:
${portalContext.course || "None"}

Current Material:
${portalContext.material || "None"}

Current Assignment:
${portalContext.assignment || "None"}

Current Announcement:
${portalContext.announcement || "None"}

===================================

`;

  if (!message || typeof message !== "string" || message.trim() === "") {
    return res.status(400).json({
      reply: "A non-empty message string is required."
    });
  }

  if (!model || typeof model !== "string") {
    return res.status(400).json({
      reply: "A model field ('gemini' or 'groq') is required."
    });
  }

  const priorHistory = Array.isArray(history)
    ? history.slice(-20)
    : [];

    

  try {

    // If a portal command was detected,
// don't ask Gemini.

if (portalAction) {

    return res.json({

        reply: "Opening...",

        action: portalAction,

        model: "portal"

    });

}
    // ================= GEMINI =================
    if (model === "gemini") {
      const geminiModel = genAI.getGenerativeModel({
        model: "gemini-3.1-flash-lite"
      });


      const geminiHistory = [

    {

        role: "user",

        parts: [

            {

                text: context

            }

        ]

    },

    {

        role: "model",

        parts: [

            {

                text: "Understood. I will follow these instructions throughout this conversation."

            }

        ]

    },

    ...sanitiseForGemini(priorHistory)

];

      const chat = geminiModel.startChat({
        history: geminiHistory
      });

      await chat.sendMessage(

`${context}

${portalInfo}

${assignmentContext}

User:

${message.trim()}`
);
      const reply = result.response.text();

      console.log("Gemini reply:", reply);

      return res.json({
        reply: reply || "No response from Gemini.",
        model: "gemini",
        action: null
      });
    }

    // ================= GROQ =================
    if (model === "groq") {
     const messages = [
  ...priorHistory.map(m => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content
  })),
  {
    role: "user",
    content: `${context}

${portalInfo}

${assignmentContext}

User:

${message.trim()}`
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
            model: "groq/compound-mini",
            messages
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Groq API Error (${response.status}):`, errText);

        return res.status(response.status).json({
          reply: `Groq API error: ${response.statusText}`
        });
      }

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content;

      console.log("Groq reply:", reply);

      return res.json({
        reply: reply || "No response from Groq.",
        model: "groq",
        action: null
      });
    }

    return res.status(400).json({
      reply: `Invalid model "${model}". Use "gemini" or "groq".`
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);

    res.status(500).json({
      reply: "A server error occurred while processing your request."
    });
  }
});


app.post("/generate-title", async (req, res) => {

    const { userMessage, assistantReply, model = "gemini" } = req.body;

    const prompt = `
Generate a short title for this conversation.

Rules:
- Maximum 5 words.
- No quotation marks.
- No punctuation at the end.
- Make it descriptive.
- Return ONLY the title.

User:
${userMessage}

Assistant:
${assistantReply}
`;

    try {

        if (model === "gemini") {

            const geminiModel = genAI.getGenerativeModel({
                model: "gemini-3.1-flash-lite"
            });

            const result = await geminiModel.generateContent(prompt);

            return res.json({
                title: result.response.text().trim()
            });

        }

        // Add Groq/OpenAI later if desired

        res.json({
            title: "New Conversation"
        });

    } catch (err) {

        console.error(err);

        res.json({
            title: "New Conversation"
        });

    }

});




app.post("/create-admin", async(req,res)=>{

    try{

        const {

    email,

    password,

    name

} = req.body;

        const user = await auth.createUser({

    email,

    password,

    displayName: name

});

        res.json({

            success:true,

            uid:user.uid

        });

    }

    catch(err){

    if(err.code==="auth/email-already-exists"){

        return res.status(400).json({

            success:false,

            message:"Email already exists."

        });

    }

    res.status(500).json({

        success:false,

        message:err.message

    });

}

});



const PORT = parseInt(process.env.PORT, 10) || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

