import { env } from "../../../config/env.js";

function inferExtension(mimeType = "audio/webm") {
  if (mimeType.includes("wav")) return "wav";
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) return "mp3";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
}

export class OpenAISttProvider {
  constructor({ apiKey = env.openAiApiKey, model = env.openAiSttModel } = {}) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async transcribeBase64Audio({ audioBase64, mimeType = "audio/webm", prompt = "", language = env.defaultLanguage }) {
    const audioBuffer = Buffer.from(audioBase64, "base64");
    return this.transcribeBuffer({ audioBuffer, mimeType, prompt, language });
  }

  async transcribeBuffer({ audioBuffer, mimeType = "audio/webm", prompt = "", language = env.defaultLanguage }) {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is required for STT.");
    }

    const form = new FormData();
    form.set("model", this.model);
    form.set("file", new Blob([audioBuffer], { type: mimeType }), `audio.${inferExtension(mimeType)}`);
    form.set("response_format", "text");

    if (prompt) form.set("prompt", prompt);
    if (language) form.set("language", language);

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: form,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI STT request failed: ${response.status} ${errorText}`);
    }

    return (await response.text()).trim();
  }
}
