import path from "node:path";
import { env, projectRoot } from "../../../config/env.js";
import { randomId, writeBinaryFile } from "../../../utils/files.js";

export class OpenAITtsProvider {
  constructor({
    apiKey = env.openAiApiKey,
    model = env.openAiTtsModel,
    voice = env.openAiTtsVoice,
  } = {}) {
    this.apiKey = apiKey;
    this.model = model;
    this.voice = voice;
  }

  async synthesizeToBuffer({ text }) {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is required for TTS.");
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        voice: this.voice,
        input: text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI TTS request failed: ${response.status} ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async synthesizeToPublicFile({ text, filePrefix = "tts" }) {
    const audioBuffer = await this.synthesizeToBuffer({ text });
    const fileName = `${filePrefix}_${randomId("audio")}.mp3`;
    const relativePath = path.join("public", "audio", fileName);
    const absolutePath = path.join(projectRoot, relativePath);

    await writeBinaryFile(absolutePath, audioBuffer);

    return {
      fileName,
      absolutePath,
      publicUrl: `${env.appBaseUrl}/audio/${fileName}`,
    };
  }
}
