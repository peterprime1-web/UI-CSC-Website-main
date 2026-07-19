window.PushNotificationsManager = (() => {

    async function init() {

        if (!window.Capacitor) return;

        const { PushNotifications } = Capacitor.Plugins;

        // Request permission
        let permission = await PushNotifications.requestPermissions();

        if (permission.receive !== "granted") {
            console.warn("Push notification permission denied.");
            return;
        }

        // Register with FCM
        await PushNotifications.register();

        // Registration success
        PushNotifications.addListener("registration", token => {

            console.log("FCM Token:", token.value);

            // We'll send this to the backend next
            registerToken(token.value);

        });

        // Registration error
        PushNotifications.addListener("registrationError", err => {

            console.error("Push registration failed:", err);

        });

        // Notification received while app is open
        PushNotifications.addListener(
            "pushNotificationReceived",
            notification => {

                console.log("Notification received:", notification);

            }
        );

        // User taps notification
        PushNotifications.addListener(
            "pushNotificationActionPerformed",
            action => {

                console.log("Notification tapped:", action);

            }
        );

    }

   export async function registerDevice(req, res) {

    console.log("========== REGISTER DEVICE ==========");
    console.log("Body:", req.body);

    const { uid, token } = req.body;

    console.log("UID:", uid);
    console.log("TOKEN:", token?.substring(0, 25));

    const snapshot = await db.ref("students").once("value");

    let studentKey = null;

    snapshot.forEach(child => {

        console.log(
            "Checking:",
            child.key,
            child.val().uid
        );

        if (child.val().uid === uid) {

            console.log("MATCH FOUND!");

            studentKey = child.key;

        }

    });

    console.log("studentKey =", studentKey);

}

    return {

        init

    };

})();