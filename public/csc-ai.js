const chatInput = document.getElementById("chat-input");

chatInput.addEventListener("input", () => {

    chatInput.style.height = "0px";

    chatInput.style.height =

        Math.min(chatInput.scrollHeight,220)

        + "px";

});

chatInput.addEventListener("keydown",(e)=>{

    if(

        e.key==="Enter"

        &&

        !e.shiftKey

    ){

        e.preventDefault();

        sendMessage();

    }

});

document

.querySelectorAll(".suggestion-card")

.forEach(card=>{

    card.addEventListener("click",()=>{

        const title =

            card.querySelector("h4").textContent;

        const prompts={

            "Explain a Concept":

                "Explain ",

            "Summarize Notes":

                "Summarize these notes.",

            "Generate Quiz":

                "Generate a quiz on ",

            "Help with Code":

                "Help me debug this code.",

            "Analyze PDF":

                "Analyze this PDF.",

            "Assignment Help":

                "Help me solve this assignment."

        };

        chatInput.value=

            prompts[title]||"";

        chatInput.focus();

    });

});

const welcome=

document.getElementById(

"welcome-screen"

);

if(welcome){

welcome.style.display="none";

}

chatMessages.scrollTo({

top:chatMessages.scrollHeight,

behavior:"smooth"

});

