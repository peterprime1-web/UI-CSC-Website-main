window.CSCAI = (() => {

  Portal.setCurrentPage("ai");


    let input;

let attach;

let voice;

function updateInputButtons(){

    if(!input) return;

    const typing = input.value.trim().length > 0;

    attach.classList.toggle("hide", typing);

    voice.classList.toggle("hide", typing);

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

    try{

        const result =

            await Upload.upload(file);

        ChatManager.addMessage(

            "assistant",

            `📄 Uploaded **${file.name}** successfully.`

        );

        AIRenderer.renderMessages();

    }

    catch(err){

        console.error(err);
        ChatManager.addMessage(

            "assistant",

            `❌ ${err.message}`
        );

        AIRenderer.renderMessages();

    }

    fileInput.value = "";

};

input.addEventListener("input", () => {

    input.style.height = "24px";

    input.style.height = input.scrollHeight + "px";

});

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

            ChatManager.addMessage(

                "assistant",

                response.reply

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

   
            AIRenderer.renderMessages();

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