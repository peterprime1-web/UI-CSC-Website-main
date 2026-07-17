window.AIActions = (() => {

    function execute(message){

        const text = message.toLowerCase();

        if(text.includes("assignment")){

            Portal.navigate("assignments");

            return true;

        }

        if(text.includes("forum")){

            Portal.navigate("forum");

            return true;

        }

        if(text.includes("announcement")){

            Portal.navigate("announcements");

            return true;

        }

        if(text.includes("notes")){

            Portal.navigate("notes");

            return true;

        }

        if(text.includes("materials")){

            Portal.navigate("materials");

            return true;

        }

        if(text.includes("syllabus")){

            Portal.navigate("syllabus");

            return true;

        }

        return false;

    }

    return{

        execute

    };

})();