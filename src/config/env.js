import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const projectRoot = path.resolve(__dirname, "../../");

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: toNumber(process.env.PORT, 3000),
  appBaseUrl: process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 3000}`,

  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiSttModel: process.env.OPENAI_STT_MODEL || "gpt-4o-mini-transcribe",
  openAiLlmModel: process.env.OPENAI_LLM_MODEL || "gpt-5",
  openAiTtsModel: process.env.OPENAI_TTS_MODEL || "tts-1",
  openAiTtsVoice: process.env.OPENAI_TTS_VOICE || "alloy",

  defaultLanguage: process.env.DEFAULT_LANGUAGE || "th",
  enableExternalTts: toBoolean(process.env.ENABLE_EXTERNAL_TTS, true),
  saveTtsAudioToPublic: toBoolean(process.env.SAVE_TTS_AUDIO_TO_PUBLIC, true),

  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || "",
  twilioValidateSignature: toBoolean(process.env.TWILIO_VALIDATE_SIGNATURE, false),
  twilioGatherTimeout: toNumber(process.env.TWILIO_GATHER_TIMEOUT, 4),
  twilioGatherHints: process.env.TWILIO_GATHER_HINTS || "",
  twilioUseExternalTts: toBoolean(process.env.TWILIO_USE_EXTERNAL_TTS, false),
  twilioStatusCallbackUrl: process.env.TWILIO_STATUS_CALLBACK_URL || "/api/webhooks/twilio/status",

  telnyxApiKey: process.env.TELNYX_API_KEY || "",
  telnyxPublicKey: process.env.TELNYX_PUBLIC_KEY || "",
  telnyxValidateSignature: toBoolean(process.env.TELNYX_VALIDATE_SIGNATURE, false),
  telnyxSpeakVoice: process.env.TELNYX_SPEAK_VOICE || "Telnyx.KokoroTTS.af",
  telnyxLanguage: process.env.TELNYX_LANGUAGE || "th",
  telnyxUseAiGather: toBoolean(process.env.TELNYX_USE_AI_GATHER, true),

  sipSharedSecret: process.env.SIP_SHARED_SECRET || "",
  sipProviderName: process.env.SIP_PROVIDER_NAME || "generic-sip",

  defaultStoreName: process.env.DEFAULT_STORE_NAME || "OmniVoice AI Demo Store",
  defaultCurrency: process.env.DEFAULT_CURRENCY || "THB",
  salesHandoffEmail: process.env.SALES_HANDOFF_EMAIL || "sales@example.com",
  appointmentTimezone: process.env.APPOINTMENT_TIMEZONE || "Asia/Bangkok",
};
