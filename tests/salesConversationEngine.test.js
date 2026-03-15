import test from "node:test";
import assert from "node:assert/strict";
import { SalesConversationEngine } from "../src/engine/salesConversationEngine.js";

test("sales intent should return product details and create lead action", async () => {
  const engine = new SalesConversationEngine();

  const result = await engine.respond({
    transcript: "ขอทราบราคาสินค้า เซรั่ม",
    callContext: { from: "+66999999999", callId: "call_001" },
  });

  assert.equal(result.intent, "sales");
  assert.equal(result.businessAction.type, "lead_capture");
  assert.match(result.replyText, /ราคา/);
});

test("order intent should resolve by order number", async () => {
  const engine = new SalesConversationEngine();

  const result = await engine.respond({
    transcript: "ขอตรวจสอบออเดอร์ ORD1001",
    callContext: { from: "+66888888888", callId: "call_002" },
  });

  assert.equal(result.intent, "order_status");
  assert.match(result.replyText, /ORD1001/i);
  assert.equal(result.businessAction.type, "none");
});

test("human handoff intent should create handoff action", async () => {
  const engine = new SalesConversationEngine();

  const result = await engine.respond({
    transcript: "ขอคุยเจ้าหน้าที่",
    callContext: { from: "+66777777777", callId: "call_003" },
  });

  assert.equal(result.intent, "human_handoff");
  assert.equal(result.businessAction.type, "human_handoff_requested");
  assert.ok(result.businessAction.id);
});
