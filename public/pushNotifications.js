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

    console.log("Token received:", token);

    localStorage.setItem("fcmToken", token);

    const student = getCurrentStudent?.();

    console.log("Current student:", student);

    if (!student || !student.uid) {

        console.log("Student not logged in yet.");

        return;

    }

    console.log("Sending token to backend...");

    const result = await PushManager.register(student.uid, token);

    console.log("Backend response:", result);

}

    return {

        init

    };

})();