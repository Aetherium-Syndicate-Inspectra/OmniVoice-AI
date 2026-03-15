import express from "express";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { twimlResponse, say, gather, play, hangup } from "../../utils/twiml.js";
import { validateTwilioRequestBestEffort } from "../../utils/signatures.js";
import { VoiceCallPipeline } from "../../pipeline/voiceCallPipeline.js";
import { appendTurn, upsertCallSession } from "../../state/callSessionStore.js";

const router = express.Router();
const pipeline = new VoiceCallPipeline();

router.use(express.urlencoded({ extended: false }));

async function verifyTwilio(req) {
  if (!env.twilioValidateSignature) return true;
  if (!env.twilioAuthToken) return false;
  return validateTwilioRequestBestEffort(req, env.twilioAuthToken);
}

router.post("/voice", async (req, res) => {
  const isValid = await verifyTwilio(req);
  if (!isValid) {
    return res.status(403).type("text/xml").send(twimlResponse(say("Unauthorized request") + hangup()));
  }

  const callId = req.body.CallSid || `twilio_${Date.now()}`;
  upsertCallSession(callId, {
    provider: "twilio",
    from: req.body.From,
    to: req.body.To,
    callId,
  });

  const actionUrl = `${env.appBaseUrl}/api/webhooks/twilio/gather`;

  const xml = twimlResponse(
    say(`สวัสดีค่ะ ยินดีต้อนรับสู่ ${env.defaultStoreName} ดิฉันเป็นผู้ช่วยอัตโนมัติ สามารถช่วยเรื่องสินค้า ราคา โปรโมชั่น สถานะออเดอร์ หรือติดต่อเจ้าหน้าที่ได้ค่ะ`) +
      gather({
        action: actionUrl,
        timeout: env.twilioGatherTimeout,
        hints: env.twilioGatherHints,
        prompt: say("กรุณาพูดสิ่งที่ต้องการได้เลยค่ะ"),
      }),
  );

  res.type("text/xml").send(xml);
});

router.post("/gather", async (req, res) => {
  const isValid = await verifyTwilio(req);
  if (!isValid) {
    return res.status(403).type("text/xml").send(twimlResponse(say("Unauthorized request") + hangup()));
  }

  const callId = req.body.CallSid || `twilio_${Date.now()}`;
  const transcript = req.body.SpeechResult || req.body.Digits || "";
  const confidence = req.body.Confidence || "";

  appendTurn(callId, {
    role: "user",
    text: transcript,
    confidence,
  });

  if (!transcript) {
    return res
      .type("text/xml")
      .send(twimlResponse(say("ขออภัยค่ะ ดิฉันยังไม่ได้ยินชัดเจน รบกวนพูดอีกครั้งได้เลยค่ะ") + gather({
        action: `${env.appBaseUrl}/api/webhooks/twilio/gather`,
        timeout: env.twilioGatherTimeout,
        hints: env.twilioGatherHints,
        prompt: say("กรุณาพูดอีกครั้งค่ะ"),
      })));
  }

  const result = await pipeline.runTextTurn({
    transcript,
    callContext: {
      callId,
      provider: "twilio",
      from: req.body.From,
      to: req.body.To,
    },
  });

  appendTurn(callId, {
    role: "assistant",
    text: result.replyText,
    businessAction: result.businessAction?.type,
  });

  let responseChunk = "";

  if (env.twilioUseExternalTts && result.audio?.publicUrl) {
    responseChunk += play(result.audio.publicUrl);
  } else {
    responseChunk += say(result.replyText);
  }

  responseChunk += gather({
    action: `${env.appBaseUrl}/api/webhooks/twilio/gather`,
    timeout: env.twilioGatherTimeout,
    hints: env.twilioGatherHints,
    prompt: say("หากต้องการสอบถามเพิ่มเติม พูดต่อได้เลย หรือบอกว่าขอคุยเจ้าหน้าที่ค่ะ"),
  });

  res.type("text/xml").send(twimlResponse(responseChunk));
});

router.post("/status", (req, res) => {
  logger.info("Twilio status callback received", {
    callSid: req.body.CallSid,
    callStatus: req.body.CallStatus,
    from: req.body.From,
    to: req.body.To,
  });

  res.status(204).send();
});

export default router;
