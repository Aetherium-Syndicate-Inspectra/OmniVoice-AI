import { OpenAISttProvider } from "./providers/stt/openaiSttProvider.js";
import { OpenAILlmProvider } from "./providers/llm/openaiLlmProvider.js";
import { OpenAITtsProvider } from "./providers/tts/openaiTtsProvider.js";
import { SalesConversationEngine } from "../engine/salesConversationEngine.js";
import { env } from "../config/env.js";

export class VoiceCallPipeline {
  constructor({
    sttProvider = new OpenAISttProvider(),
    llmProvider = new OpenAILlmProvider(),
    ttsProvider = new OpenAITtsProvider(),
    salesEngine = null,
  } = {}) {
    this.sttProvider = sttProvider;
    this.llmProvider = llmProvider;
    this.ttsProvider = ttsProvider;
    this.salesEngine = salesEngine || new SalesConversationEngine({ llmProvider });
  }

  async runTextTurn({ transcript, callContext = {} }) {
    const engineResult = await this.salesEngine.respond({
      transcript,
      callContext,
    });

    const result = {
      transcript,
      ...engineResult,
      audio: null,
    };

    if (env.enableExternalTts && env.saveTtsAudioToPublic) {
      try {
        const audio = await this.ttsProvider.synthesizeToPublicFile({
          text: engineResult.replyText,
          filePrefix: callContext.callId || "call",
        });
        result.audio = audio;
      } catch {
        result.audio = null;
      }
    }

    return result;
  }

  async runAudioTurn({
    audioBase64,
    mimeType = "audio/webm",
    callContext = {},
    transcriptionPrompt = "",
  }) {
    const transcript = await this.sttProvider.transcribeBase64Audio({
      audioBase64,
      mimeType,
      prompt: transcriptionPrompt,
      language: env.defaultLanguage,
    });

    return this.runTextTurn({
      transcript,
      callContext,
    });
  }
}
