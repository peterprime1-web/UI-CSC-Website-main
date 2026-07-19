import { SpeechRecognition } from "@capacitor-community/speech-recognition";

window.NativeVoice = {

    async start() {

        const status =
            await SpeechRecognition.checkPermissions();

        if (status.speechRecognition !== "granted") {

            const request =
                await SpeechRecognition.requestPermissions();

            if (request.speechRecognition !== "granted") {

                throw new Error(
                    "Microphone permission denied."
                );

            }

        }

        const result =
            await SpeechRecognition.start({

                language: "en-US",

                maxResults: 1,

                partialResults: false,

                popup: true

            });

        return result.matches?.[0] || "";

    }

};