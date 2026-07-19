window.NativeVoice = {

    async start() {

        const result =
            await Capacitor.Plugins.NativeVoice.start();

        return result.text;

    }

};