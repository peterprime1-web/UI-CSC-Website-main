window.NativeVoice = {

    start() {

        return new Promise((resolve, reject) => {

            if (!window.Capacitor) {
                reject(new Error("Capacitor not available"));
                return;
            }

            const plugin = window.Capacitor.Plugins.NativeVoice;

            if (!plugin) {
                reject(new Error("NativeVoice plugin not found"));
                return;
            }

            plugin.start()
                .then(result => resolve(result.text))
                .catch(reject);

        });

    }

};