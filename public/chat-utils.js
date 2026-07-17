window.AIUtils = (() => {

    function uuid() {

        return crypto.randomUUID();

    }

    function escapeHTML(text = "") {

        const div = document.createElement("div");

        div.textContent = text;

        return div.innerHTML;

    }

    function formatTime(timestamp) {

        return new Date(timestamp).toLocaleTimeString([], {

            hour: "2-digit",

            minute: "2-digit"

        });

    }

    function formatDate(timestamp) {

        return new Date(timestamp).toLocaleDateString([], {

            day: "numeric",

            month: "short",

            year: "numeric"

        });

    }

    function debounce(func, delay = 300) {

        let timeout;

        return (...args) => {

            clearTimeout(timeout);

            timeout = setTimeout(() => {

                func(...args);

            }, delay);

        };

    }

    function copy(text) {

        navigator.clipboard.writeText(text);

    }

    function scrollBottom(element) {

        if (!element) return;

        element.scrollTop = element.scrollHeight;

    }

    function truncate(text, length = 40) {

        if (!text) return "";

        if (text.length <= length)

            return text;

        return text.substring(0, length) + "...";

    }

    return {

        uuid,

        escapeHTML,

        formatTime,

        formatDate,

        debounce,

        copy,

        scrollBottom,

        truncate

    };

})();