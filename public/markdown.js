window.AIMarkdown = (() => {

    let parser = null;

    function init() {

        if (window.marked) {

            parser = window.marked;

            parser.setOptions({

                breaks: true,

                gfm: true

            });

        }

    }

    function render(text = "") {

    if (!parser){

        return AIUtils.escapeHTML(text);

    }

    let html = parser.parse(text);

    // ==========================================
    // Make tables responsive
    // ==========================================

    html = html.replace(

        /<table>/g,

        '<div class="table-wrapper"><table>'

    );

    html = html.replace(

        /<\/table>/g,

        '</table></div>'

    );

    if(window.DOMPurify){

        html = DOMPurify.sanitize(html);

    }

    return html;

}

    function renderCodeBlocks(container){

    if(!container) return;

    /* ---------- Syntax Highlight ---------- */

    container

        .querySelectorAll("pre code")

        .forEach(code=>{

            addCopyButton(code);

            if(window.hljs){

                hljs.highlightElement(code);

            }

        });

    /* ---------- Mathematics ---------- */

    if(window.renderMathInElement){

        renderMathInElement(container,{

            delimiters:[

                {

                    left:"$$",

                    right:"$$",

                    display:true

                },

                {

                    left:"$",

                    right:"$",

                    display:false

                },

                {

                    left:"\\(",

                    right:"\\)",

                    display:false

                },

                {

                    left:"\\[",

                    right:"\\]",

                    display:true

                }

            ],

            throwOnError:false

        });

    }

}

    function addCopyButton(code) {

        const pre = code.parentElement;

        if (!pre || pre.querySelector(".copy-code-btn"))

            return;

        const button = document.createElement("button");

        button.className = "copy-code-btn";

        button.innerHTML = `

            <span class="material-icons">

                content_copy

            </span>

        `;

        button.onclick = () => {

            AIUtils.copy(code.innerText);

            button.innerHTML = `

                <span class="material-icons">

                    check

                </span>

            `;

            setTimeout(() => {

                button.innerHTML = `

                    <span class="material-icons">

                        content_copy

                    </span>

                `;

            }, 2000);

        };

        pre.appendChild(button);

    }

    return {

        init,

        render,

        renderCodeBlocks

    };

})();