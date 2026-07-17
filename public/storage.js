window.AIStorage = (() => {

    const KEYS = {

        conversations: "csc_ai_conversations",

        currentConversation: "csc_ai_current",

        settings: "csc_ai_settings"

    };

    function save(key, value) {

        try {

            localStorage.setItem(

                key,

                JSON.stringify(value)

            );

            return true;

        }

        catch (err) {

            console.error("Storage Save Error:", err);

            return false;

        }

    }

    function load(key, defaultValue = null) {

        try {

            const data = localStorage.getItem(key);

            if (!data) return defaultValue;

            return JSON.parse(data);

        }

        catch (err) {

            console.error("Storage Load Error:", err);

            return defaultValue;

        }

    }

    function remove(key) {

        localStorage.removeItem(key);

    }

    function clearAll() {

        Object.values(KEYS).forEach(remove);

    }

    function saveConversations(conversations) {

        return save(KEYS.conversations, conversations);

    }

    function loadConversations() {

        return load(KEYS.conversations, []);

    }

    function saveCurrentConversation(id) {

        return save(KEYS.currentConversation, id);

    }

    function loadCurrentConversation() {

        return load(KEYS.currentConversation, null);

    }

    function saveSettings(settings) {

        return save(KEYS.settings, settings);

    }

    function loadSettings() {

        return load(KEYS.settings, {});

    }

    function exists(key){

    return localStorage.getItem(key)!==null;

}

    return {

        KEYS,

        save,

        load,

        remove,

        clearAll,

        saveConversations,

        loadConversations,

        saveCurrentConversation,

        loadCurrentConversation,

        saveSettings,

        loadSettings,

        exists

    };

})();