window.ChatManager = (() => {

    let conversations = [];

    let currentConversation = null;

    function init() {

        conversations = AIStorage.loadConversations();

        currentConversation =
            AIStorage.loadCurrentConversation();

        if (conversations.length === 0) {

            createConversation();

        }

        else if (!currentConversation) {

            currentConversation = conversations[0].id;

        }

        save();

    }

    function createConversation(title = "New Chat") {

        const conversation = {

            id: AIUtils.uuid(),

            title,

            createdAt: Date.now(),

            updatedAt: Date.now(),

            messages: []

        };

        conversations.unshift(conversation);

        currentConversation = conversation.id;

        save();

        return conversation;

    }

    function getCurrentConversation() {

        return conversations.find(

            c => c.id === currentConversation

        );

    }

    function switchConversation(id) {

        if (!conversations.find(c => c.id === id))

            return false;

        currentConversation = id;

        save();

        return true;

    }

    function addMessage(role, content) {

        const chat = getCurrentConversation();

        if (!chat) return;

        chat.messages.push({

            id: AIUtils.uuid(),

            role,

            content,

            timestamp: Date.now()

        });


        chat.updatedAt = Date.now();

        save();

    }

    function renameConversation(id, title) {

        const chat = conversations.find(

            c => c.id === id

        );

        if (!chat) return;

        chat.title = title;

        chat.updatedAt = Date.now();

        save();

    }

    function deleteConversation(id) {

        conversations = conversations.filter(

            c => c.id !== id

        );

        if (conversations.length === 0) {

            createConversation();

        }

        if (

            currentConversation === id

        ) {

            currentConversation = conversations[0].id;

        }

        save();

    }

    function getConversations() {

        return conversations;

    }

    function save() {

        AIStorage.saveConversations(

            conversations

        );

        AIStorage.saveCurrentConversation(

            currentConversation

        );

    }

    return {

        init,

        createConversation,

        getCurrentConversation,

        getConversations,

        switchConversation,

        addMessage,

        renameConversation,

        deleteConversation

    };

})();