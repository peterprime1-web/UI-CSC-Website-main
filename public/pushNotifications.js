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

    async function registerToken(token) {

    try {

        // Save locally
        localStorage.setItem("fcmToken", token);

        // User not logged in yet?
        const student = getCurrentStudent?.();

        if (!student || !student.uid) {

            console.log(
                "User not logged in yet. Token saved locally."
            );

            return;

        }

        // Register device with backend
        const result = await PushManager.register(

            student.uid,

            token

        );

        console.log(
            "Device registered:",
            result
        );

    }

    catch(err){

        console.error(err);

    }

}

    return {

        init

    };

})();