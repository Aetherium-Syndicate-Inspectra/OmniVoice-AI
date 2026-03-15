import express from "express";
import crypto from "node:crypto";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { verifyTelnyxWebhook } from "../../utils/signatures.js";
import { SalesConversationEngine } from "../../engine/salesConversationEngine.js";
import { OpenAILlmProvider } from "../../pipeline/providers/llm/openaiLlmProvider.js";
import { appendTurn, upsertCallSession } from "../../state/callSessionStore.js";

const router = express.Router();
router.use(express.json({ limit: "2mb", verify: (req, _res, buf) => { req.rawBody = buf; } }));

const llmProvider = env.openAiApiKey ? new OpenAILlmProvider() : null;
const salesEngine = new SalesConversationEngine({ llmProvider });

function commandId() {
  return crypto.randomUUID();
}

async function telnyxApi(path, body = {}) {
  if (!env.telnyxApiKey) {
    logger.warn("Skipping Telnyx API call because TELNYX_API_KEY is empty", { path });
    return { skipped: true };
  }

  const response = await fetch(`https://api.telnyx.com/v2${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.telnyxApiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telnyx API request failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

async function answerCall(callControlId) {
  return telnyxApi(`/calls/${callControlId}/actions/answer`, {
    command_id: commandId(),
  });
}

async function speakText(callControlId, text) {
  return telnyxApi(`/calls/${callControlId}/actions/speak`, {
    command_id: commandId(),
    payload: text,
    voice: env.telnyxSpeakVoice,
    payload_type: "text",
  });
}

async function gatherUsingAi(callControlId) {
  return telnyxApi(`/calls/${callControlId}/actions/gather_using_ai`, {
    command_id: commandId(),
    language: env.telnyxLanguage,
    voice: env.telnyxSpeakVoice,
    greeting: "สวัสดีค่ะ ดิฉันช่วยเรื่องสินค้า ราคา โปรโมชั่น สถานะออเดอร์ หรือให้เจ้าหน้าที่ติดต่อกลับได้ค่ะ ตอนนี้ต้องการให้ช่วยเรื่องไหนคะ",
    parameters: {
      type: "object",
      properties: {
        intent: { type: "string", description: "reason for calling" },
        product_name: { type: "string", description: "product mentioned by caller" },
        order_number: { type: "string", description: "order number if provided" },
        wants_human: { type: "boolean", description: "whether caller requests a human agent" },
        callback_time: { type: "string", description: "preferred callback time if requested" }
      }
    },
    send_partial_results: false,
    send_message_history_updates: true,
  });
}

function verify(req) {
  if (!env.telnyxValidateSignature) return true;
  return verifyTelnyxWebhook({
    publicKey: env.telnyxPublicKey,
    timestamp: req.get("telnyx-timestamp"),
    payload: req.rawBody?.toString("utf8"),
    signature: req.get("telnyx-signature-ed25519"),
  });
}

router.post("/voice", async (req, res) => {
  try {
    if (!verify(req)) {
      return res.status(403).json({ error: "Invalid Telnyx signature" });
    }

    const event = req.body?.data || {};
    const eventType = event.event_type;
    const payload = event.payload || {};
    const callControlId = payload.call_control_id;
    const callId = payload.call_session_id || callControlId || `telnyx_${Date.now()}`;

    upsertCallSession(callId, {
      provider: "telnyx",
      from: payload.from,
      to: payload.to,
      callId,
      callControlId,
    });

    logger.info("Telnyx voice webhook", { eventType, callId });

    if (eventType === "call.initiated" && callControlId) {
      await answerCall(callControlId);
    }

    if (eventType === "call.answered" && callControlId) {
      if (env.telnyxUseAiGather) {
        await gatherUsingAi(callControlId);
      } else {
        await speakText(callControlId, "สวัสดีค่ะ ดิฉันช่วยเรื่องสินค้า ราคา โปรโมชั่น หรือสถานะออเดอร์ได้ค่ะ");
      }
    }

    if (eventType === "call.ai_gather.ended" && callControlId) {
      const result = payload.result || {};
      const conversationText = [
        result.intent,
        result.product_name,
        result.order_number,
        result.callback_time,
        result.wants_human ? "ต้องการคุยกับเจ้าหน้าที่" : "",
      ]
        .filter(Boolean)
        .join(" ");

      appendTurn(callId, {
        role: "user",
        text: conversationText,
      });

      const engineResult = await salesEngine.respond({
        transcript: conversationText,
        callContext: {
          callId,
          provider: "telnyx",
          from: payload.from,
          to: payload.to,
        },
      });

      appendTurn(callId, {
        role: "assistant",
        text: engineResult.replyText,
        businessAction: engineResult.businessAction?.type,
      });

      await speakText(callControlId, engineResult.replyText);

      if (env.telnyxUseAiGather) {
        await gatherUsingAi(callControlId);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    logger.error("Telnyx webhook failed", { error: error.message });
    return res.status(500).json({ error: error.message });
  }
});

export default router;
