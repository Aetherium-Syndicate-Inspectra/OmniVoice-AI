import { catalogService } from "../services/catalogService.js";
import { orderService } from "../services/orderService.js";
import { appointmentService } from "../services/appointmentService.js";
import { leadService } from "../services/leadService.js";
import { handoffService } from "../services/handoffService.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

function includesAny(text, words) {
  return words.some((word) => text.includes(word));
}

function detectIntent(input = "") {
  const text = input.toLowerCase();

  if (includesAny(text, ["พนักงาน", "เจ้าหน้าที่", "ขอคุยคน", "human", "agent"])) return "human_handoff";
  if (includesAny(text, ["ออเดอร์", "สถานะ", "จัดส่ง", "tracking", "เลขพัสดุ", "order"])) return "order_status";
  if (includesAny(text, ["นัด", "โทรกลับ", "callback", "appointment"])) return "appointment";
  if (includesAny(text, ["ราคา", "โปร", "โปรโมชั่น", "มีของไหม", "สต็อก", "ขาย", "ซื้อ", "สินค้า"])) return "sales";
  return "general";
}

function extractOrderNumber(text = "") {
  const match = text.match(/ord\d+/i);
  return match?.[0] || "";
}

function extractPreferredTime(text = "") {
  const match = text.match(/(\d{1,2}\s*(?:โมง|:\d{2})|พรุ่งนี้|วันนี้|เย็นนี้|เช้านี้)/i);
  return match?.[0] || "";
}

function extractProductQuery(text = "") {
  const commonPhrases = ["สินค้า", "ราคา", "โปร", "โปรโมชั่น", "ขาย", "ซื้อ", "มีของไหม", "สต็อก"];
  let cleaned = text;
  for (const phrase of commonPhrases) {
    cleaned = cleaned.replaceAll(phrase, " ");
  }
  return cleaned.replace(/\s+/g, " ").trim();
}

export class SalesConversationEngine {
  constructor({ llmProvider = null } = {}) {
    this.llmProvider = llmProvider;
  }

  async respond({ transcript = "", callContext = {} }) {
    const intent = detectIntent(transcript);
    const phone = callContext.from || callContext.phone || "";
    const orderNumber = extractOrderNumber(transcript);

    let draftReply = `สวัสดีค่ะ ยินดีให้ข้อมูลเกี่ยวกับร้าน ${env.defaultStoreName} นะคะ`;
    let businessAction = { type: "none" };
    let metadata = { intent };

    if (intent === "order_status") {
      try {
        const order = await orderService.lookup({ orderNumber, phone });
        metadata.order = order || null;

        if (order) {
          draftReply = `ตรวจสอบให้แล้วค่ะ ออเดอร์ ${order.orderNumber} ของ${order.customerName} ตอนนี้สถานะคือ ${order.status}` +
            (order.trackingNumber ? ` เลขติดตามคือ ${order.trackingNumber}` : "") +
            ` หากต้องการ ดิฉันช่วยสรุปรายการสินค้าในออเดอร์ให้ต่อได้ค่ะ`;
        } else {
          draftReply = "ตอนนี้ยังไม่พบข้อมูลออเดอร์จากเลขที่ให้มา หากสะดวก แจ้งเลขออเดอร์หรือเบอร์โทรที่ใช้สั่งซื้อเพิ่มเติมได้เลยค่ะ";
        }
      } catch (error) {
        logger.error("ORDER_LOOKUP_FAILED", { intent, callId: callContext.callId, error: error.message });
        metadata.errorCode = "ORDER_LOOKUP_FAILED";
        draftReply = "ขออภัยค่ะ ระบบตรวจสอบออเดอร์ขัดข้องชั่วคราว ดิฉันสามารถให้เจ้าหน้าที่ติดต่อกลับโดยเร็วได้ค่ะ";
      }
    }

    if (intent === "sales") {
      try {
        const query = extractProductQuery(transcript);
        const product = await catalogService.summarizeProduct(query);
        metadata.product = product || null;

        if (product) {
          draftReply = `สินค้าที่ใกล้เคียงที่สุดคือ ${product.name} ราคา ${product.displayPrice}` +
            ` จุดเด่นคือ ${product.benefits.join(" / ")}` +
            (product.available ? ` ตอนนี้มีสต็อกพร้อมขายค่ะ` : ` ตอนนี้สินค้าหมดชั่วคราวค่ะ`) +
            (product.upsell_suggestion ? ` ${product.upsell_suggestion}` : "");
          businessAction = { type: "lead_capture" };
          await leadService.create({
            phone,
            customerNeed: `สนใจสินค้า: ${product.name}`,
          });
        } else {
          draftReply = "ตอนนี้ดิฉันยังจับชื่อสินค้าไม่ชัดเจนค่ะ ช่วยบอกชื่อสินค้า รุ่น หรือสิ่งที่ต้องการใช้งาน เช่น ผิวแห้ง ผิวหมองคล้ำ หรือสินค้าตัวไหนที่สนใจอยู่ ได้เลยค่ะ";
        }
      } catch (error) {
        logger.error("SALES_FLOW_FAILED", { intent, callId: callContext.callId, error: error.message });
        metadata.errorCode = "SALES_FLOW_FAILED";
        draftReply = "ขออภัยค่ะ ระบบแนะนำสินค้าขัดข้องชั่วคราว หากสะดวกดิฉันให้เจ้าหน้าที่โทรกลับเพื่อแนะนำสินค้าได้ทันทีค่ะ";
      }
    }

    if (intent === "appointment") {
      try {
        const preferredTime = extractPreferredTime(transcript);
        const appointment = await appointmentService.create({
          phone,
          preferredTime,
          reason: transcript || "ขอให้เจ้าหน้าที่ติดต่อกลับ",
        });
        metadata.appointment = appointment;

        draftReply = `ได้เลยค่ะ ดิฉันบันทึกคำขอให้เจ้าหน้าที่ติดต่อกลับไว้แล้ว` +
          (appointment.preferredTime ? ` ช่วงเวลาที่คุณสะดวกคือ ${appointment.preferredTime}` : "") +
          ` หากต้องการ แจ้งเพิ่มเติมได้ว่าต้องการสอบถามเรื่องสินค้า ราคา หรือการสั่งซื้อค่ะ`;

        businessAction = { type: "appointment_created", id: appointment.id };
      } catch (error) {
        logger.error("APPOINTMENT_CREATE_FAILED", { intent, callId: callContext.callId, error: error.message });
        metadata.errorCode = "APPOINTMENT_CREATE_FAILED";
        draftReply = "ขออภัยค่ะ ระบบนัดหมายขัดข้องชั่วคราว ดิฉันแนะนำให้ฝากเบอร์และเวลาสะดวกเพื่อให้ทีมงานติดต่อกลับโดยเร็วค่ะ";
      }
    }

    if (intent === "human_handoff") {
      try {
        const handoff = await handoffService.request({
          callId: callContext.callId,
          phone,
          reason: "ลูกค้าต้องการคุยกับเจ้าหน้าที่",
          summary: transcript,
        });
        metadata.handoff = handoff;
        draftReply = "ได้เลยค่ะ ดิฉันจะส่งเรื่องให้เจ้าหน้าที่ช่วยดูแลต่อ โดยสรุปข้อมูลเบื้องต้นไว้ให้แล้ว เพื่อไม่ให้คุณต้องเล่าซ้ำค่ะ";
        businessAction = { type: "human_handoff_requested", id: handoff.id };
      } catch (error) {
        logger.error("HANDOFF_REQUEST_FAILED", { intent, callId: callContext.callId, error: error.message });
        metadata.errorCode = "HANDOFF_REQUEST_FAILED";
        draftReply = "ขออภัยค่ะ ระบบส่งต่อเจ้าหน้าที่ขัดข้องชั่วคราว ดิฉันจดข้อมูลไว้แล้วและจะให้ทีมงานติดต่อกลับให้เร็วที่สุดค่ะ";
      }
    }

    if (intent === "general") {
      draftReply = "ยินดีช่วยดูแลค่ะ ตอนนี้คุณต้องการสอบถามเรื่องสินค้า ราคา โปรโมชั่น สถานะออเดอร์ หรืออยากให้เจ้าหน้าที่ติดต่อกลับคะ";
    }

    let finalReply = draftReply;

    if (this.llmProvider) {
      try {
        finalReply = await this.llmProvider.polishSalesReply({
          draftReply,
          transcript,
          intent,
          metadata,
          storeName: env.defaultStoreName,
        });
      } catch (error) {
        logger.warn("LLM_POLISH_REPLY_FAILED", { intent, callId: callContext.callId, error: error.message });
        finalReply = draftReply;
      }
    }

    return {
      intent,
      replyText: finalReply,
      draftReply,
      businessAction,
      metadata,
    };
  }
}
