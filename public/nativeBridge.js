window.NativeBridge = {

    async getPlatform() {

        if (!window.Capacitor)
            return "web";

        try {

            const result =
                await Capacitor.Plugins.NativeBridge.getPlatform();

            return result.platform;

        } catch {

            return "web";

        }

    }

};