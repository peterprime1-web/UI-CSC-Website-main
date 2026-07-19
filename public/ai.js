window.CSCAI = (() => {

  Portal.setCurrentPage("ai");
    let isUploading = false;

    let input;

let attach;

let voice;

function updateInputButtons(){

    if(!input) return;

    const typing = input.value.trim().length > 0;

    attach?.classList.toggle("hide", typing);

    voice?.classList.toggle("hide", typing);

}

        function init() {

    AIMarkdown.init();

    ChatManager.init();

    AIRenderer.renderConversationList();

    AIRenderer.renderMessages();

    

    bindEvents();

    

input = document.getElementById("chat-input");

attach = document.getElementById("attach-btn");

voice = document.getElementById("voice-btn");

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (SpeechRecognition) {

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = true;

    let listening = false;

    voice.onclick = () => {

        if (!listening) {

            recognition.start();

        } else {

            recognition.stop();

        }

    };

    recognition.onstart = () => {

        listening = true;

        voice.classList.add("recording");

        voice.innerHTML = `
        <span class="material-icons">
            stop
        </span>

        
    `;
        input.focus();
    };

    recognition.onend = () => {

        listening = false;

        voice.classList.remove("recording");

        finalTranscript = "";

        voice.innerHTML = `
        <span class="material-icons">
            mic
        </span>
    `;

    };

    let finalTranscript = "";

recognition.onresult = (event) => {

    let interimTranscript = "";

    for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
    ) {

        if(event.results[i].isFinal){

            finalTranscript += event.results[i][0].transcript + " ";

        }

        else{

            interimTranscript += event.results[i][0].transcript;

        }

    }

    input.value = finalTranscript + interimTranscript;

    input.dispatchEvent(new Event("input"));

};

recognition.onerror = (event) => {

    console.error(event.error);

    listening = false;

    finalTranscript = "";

    voice.classList.remove("recording");

    voice.innerHTML = `
        <span class="material-icons">
            mic
        </span>
    `;

};

}
if (!SpeechRecognition) {

    voice.style.display = "none";

}


input.addEventListener("input", updateInputButtons);

// Initial state
updateInputButtons();
    const uploadBtn =

document.getElementById(

    "attach-btn"

);

const fileInput =

document.getElementById(

    "ai-file-input"

);

uploadBtn.onclick = () => {

    fileInput.click();

};

fileInput.onchange = async () => {

    if(!fileInput.files.length)

        return;

    const file =

        fileInput.files[0];

    setUploadState(true);

    try{

    // ==========================================
    // Show Uploading...
    // ==========================================

    const uploadingId = Date.now().toString();

    ChatManager.addMessage(

        "assistant",

        `📤 Uploading **${file.name}**...`,

        {

            id: uploadingId

        }

    );

    AIRenderer.renderMessages();

    const result =

        await Upload.upload(file);

        // Remove Uploading... message

const conversation =

    ChatManager.getCurrentConversation();

conversation.messages =

    conversation.messages.filter(

        msg => msg.id !== uploadingId

    );

AIRenderer.renderMessages();

        ChatManager.addMessage(

            "assistant",

            `📄 Uploaded **${file.name}** successfully.`

        );

        AIRenderer.renderMessages();

    }

    catch(err){

        console.error(err);
        const conversation =

    ChatManager.getCurrentConversation();

conversation.messages =

    conversation.messages.filter(

        msg => msg.id !== uploadingId

    );
        ChatManager.addMessage(

    "assistant",

    `❌ Failed to upload **${file.name}**.\n\n${err.message}`

);

        AIRenderer.renderMessages();

        setUploadState(false);

document.getElementById("chat-input")?.focus();

    }

    setUploadState(false);

document.getElementById("chat-input")?.focus();

    fileInput.value = "";
    
};

input.focus();
input.addEventListener("input", () => {

    input.style.height = "24px";

    input.style.height = input.scrollHeight + "px";

});

}


function setUploadState(uploading){

    isUploading = uploading;

    const sendBtn = document.getElementById("send-btn");

    const attachBtn = document.getElementById("attach-btn");

    const voiceBtn = document.getElementById("voice-btn");

    const input = document.getElementById("chat-input");

    if(sendBtn)
        sendBtn.disabled = uploading;

    if(attachBtn)
        attachBtn.disabled = uploading;

    if(voiceBtn)
        voiceBtn.disabled = uploading;

    if(input)
        input.disabled = uploading;

}


    
    function bindEvents() {
    document
    .getElementById("send-btn")
    ?.addEventListener("click", sendMessage);

    document
    .getElementById("chat-input")
    ?.addEventListener("keydown", e => {
        if(e.key === "Enter" && !e.shiftKey){
            e.preventDefault();
            sendMessage();
        }
    });

    document
    .getElementById("new-chat-btn")
    ?.addEventListener("click", () => {
        ChatManager.createConversation();
        AIRenderer.renderConversationList();
        AIRenderer.renderMessages();
        updateInputButtons();

        const input = document.getElementById("chat-input");
        if (input) {
            input.value = "";
            input.focus();
            updateInputButtons();
        }
    });

    /* ==========================================
       ADD THIS: Event Delegation for Suggestions 
       ========================================== */
    document
    .getElementById("chat-messages")
    ?.addEventListener("click", (e) => {
        // Check if the clicked element (or its parent) is a suggestion card
        const card = e.target.closest(".suggestion-card");
        if (!card) return;

        // Get the title text to determine which prompt type to load
        const title = card.querySelector("h4")?.textContent.trim().toLowerCase();
        
        let promptType = "system";
        if (title.includes("quiz")) promptType = "quiz";
        else if (title.includes("summarize")) promptType = "summary";
        else if (title.includes("assignment")) promptType = "assignment";

        // Fetch the custom instructions
        const student = getCurrentStudent?.() || null;
        const selectedPrompt = AIPrompts.get(promptType, student);

        // Debug log to verify it's working instantly
    

        // Optional: Pre-populate the input field with a helpful starter phrase
        const input = document.getElementById("chat-input");
        if (input) {
            if (promptType === "quiz") input.value = "Generate a quiz for me on... ";
            if (promptType === "summary") input.value = "Please summarize these notes: ";
            if (promptType === "assignment") input.value = "Help me solve this assignment problem: ";
            input.focus();
        }
    });
}

    async function sendMessage() {

        const student = getCurrentStudent();

        const systemPrompt =

            AIPrompts.get(

            "system",

            student

            );

        const input =
            document.getElementById("chat-input");

        if(!input) return;
        if(isUploading){

    ChatManager.addMessage(

        "assistant",

        "⏳ Please wait for the current upload to finish."

    );

    AIRenderer.renderMessages();

    return;

}

        const message = input.value.trim();
       
        if(!message) return;

        ChatManager.addMessage(

            "user",

            message

        );

        AIRenderer.renderMessages();

        input.value = "";

        updateInputButtons();

        AIRenderer.renderTyping();

        try{

            const history =
                ChatManager
                .getCurrentConversation()
                .messages;

            const response =
                await AIAPI.send(

                    message,

                    history,

                    systemPrompt

                    );
                    const isFirstConversation = history.length === 1;

            const badge = document.getElementById("ai-provider");

if (badge) {

    badge.textContent = response.model;

}

        if(response.action){

    Portal.execute(response.action);

}
            
    AIRenderer.removeTyping();

const conversation =
    ChatManager.getCurrentConversation();

const assistantMessage = {

    role: "assistant",

    content: "",

    timestamp: Date.now()

};

conversation.messages.push(assistantMessage);

AIRenderer.createStreamingMessage();

AIRenderer.streamMessage(

    response.reply,

    (partial, done)=>{

        assistantMessage.content = partial;

        if(done){

            AIRenderer.finishStreamingMessage(partial);

        }

        else{

            AIRenderer.updateStreamingMessage(partial);

        }

    }

);
            

            

            if (isFirstConversation && response.reply) {

    try {

        const title = await AIAPI.generateTitle(message);

        ChatManager.renameConversation(
            ChatManager.getCurrentConversation().id,
            title
        );

        AIRenderer.renderConversationList();

    } catch (err) {

        console.error(err);

    }

}

   
            

        }

        catch(err){

            AIRenderer.removeTyping();

            ChatManager.addMessage(

                "assistant",

                "⚠️ Unable to contact the AI server."

            );

            AIRenderer.renderMessages();

            console.error(err);

        }

    }

    function initAiMobileToggle() {
    const toggleBtn = document.getElementById('ai-sidebar-toggle');
    const aiLayout = document.querySelector('.ai-layout');

    if (toggleBtn && aiLayout) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            aiLayout.classList.toggle('show-sidebar');
        });

        // Close mobile sidebar automatically if user clicks on the chat space
        const aiMain = document.querySelector('.ai-main');
        aiMain?.addEventListener('click', () => {
            aiLayout.classList.remove('show-sidebar');
        });
    }
}

// Fire toggle handler on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAiMobileToggle);
} else {
    initAiMobileToggle();
}

    return{

        init

    };

})();