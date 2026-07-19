window.PushManage = {

    async register(uid, token) {

        const response = await fetch("/register-device", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                uid,

                token

            })

        });

        return response.json();

    }

};