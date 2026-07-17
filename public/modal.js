window.Modal = (() => {

    let resolver = null;

    const overlay = () =>
        document.getElementById("ui-modal");

    const icon = () =>
        document.getElementById("ui-modal-icon");

    const title = () =>
        document.getElementById("ui-modal-title");

    const message = () =>
        document.getElementById("ui-modal-message");

    const confirmButton = () =>
        document.getElementById("ui-modal-confirm");

    const cancelButton = () =>
        document.getElementById("ui-modal-cancel");

    function open(options){

        title().textContent =
            options.title || "";

        message().textContent =
            options.message || "";

        icon().className =
            "ui-modal-icon " + (options.type || "info");

        switch(options.type){

            case "success":

                icon().innerHTML = `
                    <span class="material-icons">
                        check_circle
                    </span>
                `;
                break;

            case "error":

                icon().innerHTML = `
                    <span class="material-icons">
                        error
                    </span>
                `;
                break;

            case "warning":

                icon().innerHTML = `
                    <span class="material-icons">
                        warning
                    </span>
                `;
                break;

            default:

                icon().innerHTML = `
                    <span class="material-icons">
                        info
                    </span>
                `;

        }

        confirmButton().textContent =
            options.confirmText || "Continue";

        cancelButton().textContent =
            options.cancelText || "Cancel";

        cancelButton().style.display =
            options.showCancel
                ? "block"
                : "none";

        overlay().classList.add("show");

    }

    function close(){

        overlay().classList.remove("show");

    }

    function success(titleText, messageText){

        open({

            type:"success",

            title:titleText,

            message:messageText,

            confirmText:"OK",

            showCancel:false

        });

    }

    function error(titleText, messageText){

        open({

            type:"error",

            title:titleText,

            message:messageText,

            confirmText:"OK",

            showCancel:false

        });

    }

    function info(titleText, messageText){

        open({

            type:"info",

            title:titleText,

            message:messageText,

            confirmText:"OK",

            showCancel:false

        });

    }

    function confirm(titleText, messageText){

        open({

            type:"warning",

            title:titleText,

            message:messageText,

            confirmText:"Continue",

            cancelText:"Cancel",

            showCancel:true

        });

        return new Promise(resolve=>{

            resolver = resolve;

        });

    }

    function bindEvents(){

        confirmButton().onclick = ()=>{

            close();

            if(resolver){

                resolver(true);

                resolver = null;

            }

        };

        cancelButton().onclick = ()=>{

            close();

            if(resolver){

                resolver(false);

                resolver = null;

            }

        };

        overlay().onclick = e=>{

            if(e.target===overlay()){

                close();

                if(resolver){

                    resolver(false);

                    resolver = null;

                }

            }

        };

    }

    document.addEventListener(

        "DOMContentLoaded",

        bindEvents

    );

    return{

        success,

        error,

        info,

        confirm,

        close

    };

})();