import axios from "axios";
import fs from "fs";


const BASE_URL = "https://api.elevenlabs.io";

export class ElvenAiAPI {

    private headers;

    /**
     * Deletes a voice from ElvenAI
     */
    constructor(apiKey: string) {
        this.headers = { "xi-api-key": apiKey };
    }

    /**
     * Deletes a voice from ElvenAI
     */
    async deleteVoice(voiceID: string) {
        return axios.delete(`${BASE_URL}/v1/voices/${voiceID}`, { headers: this.headers });
    }

    async getVoices() {
        let voices = (await axios.get(`${BASE_URL}/v1/voices`, {headers: this.headers})).data.voices;
        let voiceMap: Record<string, string> = {};
        voices.forEach((voice: any)=>{ voiceMap[voice.name] = voice.voice_id; });
        return voiceMap;
    }

    /**
     * Adds a voice to ElvenAI and return the result voice id
     */
    async addVoice(name: string, voiceSamples: Blob) {
        let formData = new FormData();
        formData.append("name", name);
        formData.append("files[]", voiceSamples);
        try {
            return (
                await axios.post(
                    `${BASE_URL}/v1/voices/add`,
                    formData,
                    {
                        headers: {...this.headers, "Content-Type": "multipart/form-data"}
                    }
                )
            ).data.voice_id;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Generates a voice line with the given voice id
     * @param dialog {string} The text to get a audio clip for
     * @param voiceID {string} The id of the voice used to generate the clip
    */
    async generateVoiceLine(dialog: string ,voiceID: string, outFile: string) {
        return new Promise( async res => {
            (await axios.post(
                `${BASE_URL}/v1/text-to-speech/${voiceID}`,
                {
                    "text": dialog,
                    "voice_settings": {
                        "stability": .10,
                        "similarity_boost": .75
                    }
                },
                {
                    headers: {
                        ...this.headers,
                        'Accept': 'audio/mpeg',
                    },
                    responseType: "stream",
                    timeout: 10 * 60000
                }
            )).data.pipe(fs.createWriteStream(outFile)).on("finish", res)
        });
    }
}