import express from "express";
import crypto from "node:crypto";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { VoiceCallPipeline } from "../../pipeline/voiceCallPipeline.js";
import { appendTurn, upsertCallSession } from "../../state/callSessionStore.js";

const router = express.Router();
router.use(express.json({ limit: "10mb" }));

const pipeline = new VoiceCallPipeline();

function isAuthorized(req) {
  if (!env.sipSharedSecret) return true;
  const token = req.get("x-sip-shared-secret") || req.body?.sharedSecret;
  return token === env.sipSharedSecret;
}

router.post("/events", async (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(403).json({ error: "Unauthorized SIP bridge request" });
  }

  const {
    eventType = "turn.received",
    callId = `sip_${Date.now()}`,
    from = "",
    to = "",
    transcript = "",
    audioBase64 = "",
    mimeType = "audio/webm",
  } = req.body || {};

  upsertCallSession(callId, {
    provider: env.sipProviderName,
    from,
    to,
    callId,
  });

  try {
    if (eventType === "call.started") {
      return res.json({
        ok: true,
        action: "play_prompt",
        text: `สวัสดีค่ะ ยินดีต้อนรับสู่ ${env.defaultStoreName} ดิฉันช่วยเรื่องสินค้า ราคา สถานะออเดอร์ หรือให้เจ้าหน้าที่ติดต่อกลับได้ค่ะ`,
      });
    }

    let result = null;

    if (audioBase64) {
      result = await pipeline.runAudioTurn({
        audioBase64,
        mimeType,
        callContext: { callId, from, to, provider: env.sipProviderName },
      });
      appendTurn(callId, { role: "user", text: result.transcript });
    } else if (transcript) {
      appendTurn(callId, { role: "user", text: transcript });
      result = await pipeline.runTextTurn({
        transcript,
        callContext: { callId, from, to, provider: env.sipProviderName },
      });
    }

    if (!result) {
      return res.status(400).json({ error: "transcript or audioBase64 is required." });
    }

    appendTurn(callId, {
      role: "assistant",
      text: result.replyText,
      businessAction: result.businessAction?.type,
    });

    return res.json({
      ok: true,
      provider: env.sipProviderName,
      callId,
      transcript: result.transcript,
      replyText: result.replyText,
      audioUrl: result.audio?.publicUrl || null,
      businessAction: result.businessAction,
      nextAction: result.audio?.publicUrl ? "play_audio_url" : "speak_text",
    });
  } catch (error) {
    logger.error("SIP bridge event failed", { error: error.message, eventType, callId });
    return res.status(500).json({ error: error.message });
  }
});

export default router;
