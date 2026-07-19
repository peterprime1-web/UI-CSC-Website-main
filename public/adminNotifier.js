window.AdminNotifier = {

    async send(type, title, id) {

        const icons = {
            announcement: "📢 New Announcement",
            note: "📖 New Lecture Note",
            material: "📚 New Course Material",
            assignment: "📝 New Assignment"
        };

        try {

            await fetch("/notify", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    type,

                    title: icons[type],

                    body: title,

                    id

                })

            });

        } catch (err) {

            console.error("Notification failed", err);

        }

    }

};