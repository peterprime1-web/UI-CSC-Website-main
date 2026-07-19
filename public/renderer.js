window.AIRenderer = (() => {

    let streamingBubble = null;
let streamingContent = null;

    function renderConversationList() {
        const container = document.getElementById("chat-list");
        if (!container) return;

        const conversations = ChatManager.getConversations();
        const current = ChatManager.getCurrentConversation();

        container.innerHTML = conversations.map(chat => `
            <div class="chat-item ${current && chat.id === current.id ? "active" : ""}" data-chat-id="${chat.id}">
                <div class="chat-icon">
                    <span class="material-icons">chat</span>
                </div>
                <div class="chat-info">
                    <h4>${AIUtils.escapeHTML(chat.title)}</h4>
                    <small>${AIUtils.formatTime(chat.updatedAt)}</small>
                </div>
                <button class="delete-chat-btn" data-delete-id="${chat.id}">
                    <span class="material-icons">delete_outline</span>
                </button>
            </div>
        `).join("");

        bindConversationClicks();
    }

    function bindConversationClicks() {
        document.querySelectorAll(".chat-item").forEach(item => {
            item.addEventListener("click", () => {
                ChatManager.switchConversation(item.dataset.chatId);
                renderConversationList();
                renderMessages();
            });
        });

        document.querySelectorAll(".delete-chat-btn").forEach(button => {
            button.onclick = async (e) => {
                e.stopPropagation();

                const ok = await Modal.confirm(
                    "Delete Conversation",
                    "Are you sure you want to permanently delete this conversation? This action cannot be undone."
                );

                if (!ok) return;

                ChatManager.deleteConversation(button.dataset.deleteId);
                renderConversationList();
                renderMessages();
            };
        }); // Fixed: Added missing closing parenthesis here
    }

    function renderMessages() {
        const container = document.getElementById("chat-messages");
        if (!container) return;

        const chat = ChatManager.getCurrentConversation();
        if (!chat) {
            container.innerHTML = "";
            return;
        }

        if (chat.messages.length === 0) {
            container.innerHTML = `
                <div id="welcome-screen">
                    <div class="welcome-screen">
                        <div class="welcome-icon">
                            <span class="material-icons">smart_toy</span>
                        </div>
                        <h2>Welcome back 👋</h2>
                        <p>
                            Ask anything about programming, Computer Science, assignments,
                            algorithms, Python, Java, C, Data Structures, and more.
                        </p>
                        <div class="ai-suggestions">
                            <button class="suggestion-card">
                                <span class="material-icons">menu_book</span>
                                <h4>Explain a Concept</h4>
                                <small>Break difficult topics down.</small>
                            </button>
                            <button class="suggestion-card">
                                <span class="material-icons">summarize</span>
                                <h4>Summarize Notes</h4>
                                <small>Turn long notes into key points.</small>
                            </button>
                            <button class="suggestion-card">
                                <span class="material-icons">quiz</span>
                                <h4>Generate Quiz</h4>
                                <small>Practice with exam questions.</small>
                            </button>
                            <button class="suggestion-card">
                                <span class="material-icons">code</span>
                                <h4>Help with Code</h4>
                                <small>Debug and explain programs.</small>
                            </button>
                            <button class="suggestion-card">
                                <span class="material-icons">upload_file</span>
                                <h4>Analyze PDF</h4>
                                <small>Ask questions about uploaded notes.</small>
                            </button>
                            <button class="suggestion-card">
                                <span class="material-icons">assignment</span>
                                <h4>Assignment Help</h4>
                                <small>Learn step-by-step solutions.</small>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = chat.messages.map(renderMessage).join("");
        AIMarkdown.renderCodeBlocks(container);
        AIUtils.scrollBottom(container);
        bindCopyButtons(container);
    }

    function bindCopyButtons(container) {
        container.querySelectorAll(".copy-message-btn").forEach(button => {
            button.onclick = () => {
                const messageEl = button.closest(".message");
                if (!messageEl) return;

                const textEl = messageEl.querySelector(".message-bubble");
                if (!textEl) return;

                const textToCopy = textEl.innerText.replace(/content_copy|check/g, "").trim();

                navigator.clipboard.writeText(textToCopy).then(() => {
                    button.innerHTML = `<span class="material-icons">check</span>`;
                    setTimeout(() => {
                        button.innerHTML = `<span class="material-icons">content_copy</span>`;
                    }, 1500);
                }).catch(err => console.error("Failed to copy text: ", err));
            };
        });
    }

    function renderMessage(message) {
        return `
            <div class="message ${message.role}">
                <div class="message-avatar">
                    ${message.role === "assistant" ? `<span class="material-icons">smart_toy</span>` : ""}
                </div>
                <div class="message-bubble">
                    ${AIMarkdown.render(message.content)}
                    <div class="message-time">
                        ${AIUtils.formatTime(message.timestamp)}
                    </div>
                    <div class="message-actions">
                        <button class="copy-message-btn">
                            <span class="material-icons">content_copy</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function renderTyping() {
        const container = document.getElementById("chat-messages");
        if (!container) return;

        container.insertAdjacentHTML(
            "beforeend",
            `
            <div class="message assistant typing">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
            `
        );
        AIUtils.scrollBottom(container);
    }

    function removeTyping() {
        document.querySelector(".typing")?.remove();
    }


        function streamMessage(text, callback) {

    let current = "";

    let index = 0;

    const speed = 4; // milliseconds

    function type() {

        if (index >= text.length) {

            callback(current, true);

            return;

        }

        current += text[index++];

        callback(current, false);

        requestAnimationFrame(() => {

            setTimeout(type, speed);

        });

    }

    type();

}

    function createStreamingMessage() {

    const container = document.getElementById("chat-messages");

    if (!container) return;

    const wrapper = document.createElement("div");
    wrapper.className = "message assistant";

    const bubble = document.createElement("div");
    bubble.className = "message-bubble streaming";

    wrapper.appendChild(bubble);
    container.appendChild(wrapper);

    streamingBubble = wrapper;
    streamingContent = bubble;

    AIUtils.scrollBottom(container);

}

function updateStreamingMessage(text) {

    if (!streamingContent) return;

    streamingContent.textContent = text;

    AIUtils.scrollBottom(
        document.getElementById("chat-messages")
    );

}

function finishStreamingMessage(markdown) {

    if (!streamingContent) return;

    streamingContent.classList.remove("streaming");

    streamingContent.innerHTML =
        AIMarkdown.render(markdown);

    AIMarkdown.renderCodeBlocks(streamingContent);

    streamingBubble = null;
    streamingContent = null;

}


    return {
        renderConversationList,
        renderMessages,
        renderTyping,
        removeTyping,
        streamMessage,  
        createStreamingMessage,
        updateStreamingMessage,
        finishStreamingMessage
    };

})(); // Correctly moved to the very bottom to encapsulate all functions safely